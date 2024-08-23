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

const allColors: Array<string> = [];
const d = 4;
for (let b = 128; b < 256; b += d) {
    for (let g = 0; g < 256; g += d) {
        for (let r = 0; r < 256; r += d) {
            allColors.push(JSON.stringify({ r, g, b }));
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
        allColors.length,
        "@",
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
