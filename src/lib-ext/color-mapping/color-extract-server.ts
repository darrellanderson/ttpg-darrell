/**
 * HTTP server provides color to render, extracts
 * rendered color from the screen.
 */

import { execSync } from "child_process";
import * as http from "http";
import url from "url";
import Jimp from "jimp";
import { ParsedUrlQuery } from "querystring";

const POS_OFFICE = {
    CAPTURE: {
        // rectangle to screenshot, other positions relative to this
        x: 2500,
        y: 0,
        w: 300,
        h: 700,
    },
    SLOT: {
        x: 0,
        y: 0,
    },
    OBJ: {
        x: 0,
        y: 0,
    },
    WIDGET: {
        x: 0,
        y: 0,
    },
};

const POS_LAPTOP = {
    CAPTURE: {
        // rectangle to screenshot, other positions relative to this
        x: 1200,
        y: 100,
        w: 100,
        h: 300,
    },
    SLOT: {
        x: 174,
        y: 101,
    },
    OBJ: {
        x: 132,
        y: 352,
    },
    WIDGET: {
        x: 152,
        y: 536,
    },
};

const ENV: string = "laptop";
const POS = ENV === "laptop" ? POS_LAPTOP : POS_OFFICE;

const seedColors = [
    { r: 0, g: 200, b: 4 },
    { r: 8, g: 204, b: 68 },
    { r: 4, g: 180, b: 20 },
    { r: 92, g: 196, b: 96 },
    { r: 116, g: 200, b: 112 },
    { r: 56, g: 184, b: 56 },
    { r: 4, g: 144, b: 12 },
    { r: 60, g: 148, b: 48 },
    { r: 16, g: 92, b: 12 },
    { r: 132, g: 236, b: 4 },
    { r: 156, g: 252, b: 84 },
    { r: 96, g: 252, b: 28 },
    { r: 4, g: 236, b: 104 },
    { r: 96, g: 252, b: 124 },
    { r: 32, g: 252, b: 64 },
    { r: 252, g: 0, b: 0 },
    { r: 252, g: 32, b: 32 },
    { r: 252, g: 8, b: 8 },
    { r: 172, g: 92, b: 92 },
    { r: 184, g: 104, b: 104 },
    { r: 148, g: 44, b: 48 },
    { r: 192, g: 32, b: 16 },
    { r: 208, g: 52, b: 36 },
    { r: 180, g: 16, b: 8 },
    { r: 208, g: 28, b: 60 },
    { r: 224, g: 52, b: 76 },
    { r: 220, g: 12, b: 24 },
    { r: 252, g: 104, b: 104 },
    { r: 252, g: 112, b: 116 },
    { r: 252, g: 52, b: 56 },
    { r: 252, g: 216, b: 0 },
    { r: 252, g: 228, b: 44 },
    { r: 252, g: 240, b: 20 },
    { r: 252, g: 232, b: 120 },
    { r: 252, g: 252, b: 140 },
    { r: 252, g: 252, b: 84 },
    { r: 168, g: 148, b: 16 },
    { r: 172, g: 152, b: 60 },
    { r: 124, g: 92, b: 16 },
    { r: 216, g: 188, b: 72 },
    { r: 232, g: 200, b: 104 },
    { r: 252, g: 184, b: 48 },
    { r: 244, g: 252, b: 0 },
    { r: 252, g: 252, b: 4 },
    { r: 252, g: 252, b: 0 },
    { r: 252, g: 116, b: 216 },
    { r: 252, g: 120, b: 232 },
    { r: 252, g: 60, b: 248 },
    { r: 236, g: 172, b: 216 },
    { r: 252, g: 176, b: 244 },
    { r: 252, g: 132, b: 252 },
    { r: 196, g: 24, b: 144 },
    { r: 196, g: 56, b: 148 },
    { r: 168, g: 16, b: 92 },
    { r: 188, g: 40, b: 176 },
    { r: 188, g: 64, b: 176 },
    { r: 156, g: 20, b: 140 },
    { r: 224, g: 100, b: 176 },
    { r: 232, g: 112, b: 180 },
    { r: 244, g: 52, b: 144 },
    { r: 252, g: 140, b: 0 },
    { r: 252, g: 148, b: 8 },
    { r: 252, g: 100, b: 0 },
    { r: 224, g: 160, b: 92 },
    { r: 248, g: 168, b: 112 },
    { r: 252, g: 120, b: 52 },
    { r: 132, g: 64, b: 0 },
    { r: 140, g: 80, b: 0 },
    { r: 84, g: 28, b: 0 },
    { r: 252, g: 96, b: 0 },
    { r: 252, g: 108, b: 0 },
    { r: 252, g: 48, b: 0 },
    { r: 252, g: 168, b: 0 },
    { r: 252, g: 176, b: 4 },
    { r: 252, g: 128, b: 8 },
    { r: 180, g: 80, b: 252 },
    { r: 176, g: 76, b: 252 },
    { r: 136, g: 28, b: 252 },
    { r: 176, g: 120, b: 208 },
    { r: 180, g: 124, b: 216 },
    { r: 136, g: 64, b: 224 },
    { r: 104, g: 24, b: 144 },
    { r: 112, g: 48, b: 144 },
    { r: 52, g: 12, b: 92 },
    { r: 148, g: 92, b: 236 },
    { r: 148, g: 84, b: 252 },
    { r: 92, g: 36, b: 252 },
    { r: 168, g: 0, b: 252 },
    { r: 164, g: 0, b: 244 },
    { r: 116, g: 0, b: 252 },
    { r: 0, g: 208, b: 252 },
    { r: 0, g: 220, b: 252 },
    { r: 0, g: 224, b: 252 },
    { r: 112, g: 216, b: 240 },
    { r: 124, g: 248, b: 252 },
    { r: 60, g: 252, b: 252 },
    { r: 4, g: 152, b: 180 },
    { r: 60, g: 152, b: 184 },
    { r: 20, g: 108, b: 152 },
    { r: 0, g: 252, b: 236 },
    { r: 8, g: 252, b: 252 },
    { r: 0, g: 252, b: 252 },
    { r: 0, g: 144, b: 252 },
    { r: 8, g: 140, b: 252 },
    { r: 12, g: 92, b: 252 },
    { r: 240, g: 240, b: 240 },
    { r: 252, g: 252, b: 252 },
    { r: 152, g: 152, b: 152 },
    { r: 156, g: 156, b: 156 },
    { r: 104, g: 104, b: 104 },
    { r: 72, g: 72, b: 72 },
    { r: 84, g: 84, b: 80 },
    { r: 32, g: 32, b: 28 },
    { r: 40, g: 40, b: 40 },
    { r: 48, g: 48, b: 52 },
    { r: 12, g: 12, b: 16 },
    { r: 40, g: 32, b: 32 },
    { r: 52, g: 40, b: 40 },
    { r: 16, g: 12, b: 12 },
];

const allColors: Array<string> = [];
/*
const d = 4;
for (let b = 0; b < 256; b += d) {
    for (let g = 0; g < 256; g += d) {
        for (let r = 0; r < 256; r += d) {
            allColors.push(JSON.stringify({ r, g, b }));
        }
    }
}
    */
for (const seedColor of seedColors) {
    for (let b = -2; b <= 2; b += 1) {
        for (let g = -2; g <= 2; g += 1) {
            for (let r = -2; r <= 2; r += 1) {
                allColors.push(
                    JSON.stringify({
                        r: Math.min(Math.max(seedColor.r + r, 0), 255),
                        g: Math.min(Math.max(seedColor.g + g, 0), 255),
                        b: Math.min(Math.max(seedColor.b + b, 0), 255),
                    })
                );
            }
        }
    }
}

function nextColorAsJson(): string | undefined {
    const rgb: string | undefined = allColors.shift();
    return rgb;
}

async function extractColors(r: number, g: number, b: number): Promise<string> {
    //const before: number = Date.now();
    const { x, y, w, h } = POS.CAPTURE;
    execSync(`screencapture -R${x},${y},${w},${h} -t png /tmp/px.png`);
    //const delta: number = Date.now() - before;
    //console.log("screencapture ms", delta);

    const image = await Jimp.read("/tmp/px.png");
    const slot = Jimp.intToRGBA(image.getPixelColor(POS.SLOT.x, POS.SLOT.y));
    const obj = Jimp.intToRGBA(image.getPixelColor(POS.OBJ.x, POS.OBJ.y));
    const widget = Jimp.intToRGBA(
        image.getPixelColor(POS.WIDGET.x, POS.WIDGET.y)
    );

    const intToHex = (int: number): string => {
        return int.toString(16).toUpperCase().padStart(2, "0");
    };
    const rgbToHex = (r: number, g: number, b: number): string => {
        return `${intToHex(r)}${intToHex(g)}${intToHex(b)}`;
    };
    return [
        rgbToHex(r, g, b),
        rgbToHex(slot.r, slot.g, slot.b),
        rgbToHex(obj.r, obj.g, obj.b),
        rgbToHex(widget.r, widget.g, widget.b),
    ].join(" ");
}

const listener: http.RequestListener = async (
    req: http.IncomingMessage,
    res: http.ServerResponse
) => {
    if (req.method !== "GET") {
        res.writeHead(405, { "Content-Type": "text/plain" });
        res.end("Method Not Allowed");
        return;
    }
    if (!req.url?.startsWith("/color")) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
    }
    //console.log("URL", req.url);
    const queryArgs: ParsedUrlQuery = url.parse(req.url, true).query;

    let r, g, b: number | undefined;
    if (typeof queryArgs.r === "string") {
        r = parseInt(queryArgs.r);
    }
    if (typeof queryArgs.g === "string") {
        g = parseInt(queryArgs.g);
    }
    if (typeof queryArgs.b === "string") {
        b = parseInt(queryArgs.b);
    }

    if (r !== undefined && g !== undefined && b !== undefined) {
        const summary: string = await extractColors(r, g, b);
        console.log(summary);
    }
    res.writeHead(200, { "Content-Type": "application/json" });

    const content: string | undefined = nextColorAsJson();
    res.end(content ?? "");
};

const server: http.Server = http.createServer(listener);
server.listen(8013, "localhost");
console.log("# Server running at http://localhost:8013/");
console.log("# |allColors|:", allColors.length);
console.log("# hours:", (allColors.length * 100) / 1000 / 3600);
console.log("# raw slot plastic widget");
