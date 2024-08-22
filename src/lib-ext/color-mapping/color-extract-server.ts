/**
 * HTTP server provides color to render, extracts
 * rendered color from the screen.
 */

import { execSync } from "child_process";
import * as http from "http";
import url from "url";
import Jimp from "jimp";
import { ParsedUrlQuery } from "querystring";

const POS = {
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

async function extractColors(r: number, g: number, b: number): Promise<string> {
    const before: number = Date.now();
    const { x, y, w, h } = POS.CAPTURE;
    execSync(`screencapture -R${x},${y},${w},${h} -t png /tmp/px.png`);
    const delta: number = Date.now() - before;
    console.log("screencapture ms", delta);

    const image = await Jimp.read("/tmp/px.png");
    const slot = Jimp.intToRGBA(image.getPixelColor(POS.SLOT.x, POS.SLOT.y));
    const obj = Jimp.intToRGBA(image.getPixelColor(POS.OBJ.x, POS.OBJ.y));
    const widget = Jimp.intToRGBA(
        image.getPixelColor(POS.WIDGET.x, POS.WIDGET.y)
    );
    return [
        "raw:",
        r.toString().padStart(3, "0"),
        g.toString().padStart(3, "0"),
        b.toString().padStart(3, "0"),
        "slot:",
        slot.r.toString().padStart(3, "0"),
        slot.g.toString().padStart(3, "0"),
        slot.b.toString().padStart(3, "0"),
        "obj:",
        obj.r.toString().padStart(3, "0"),
        obj.g.toString().padStart(3, "0"),
        obj.b.toString().padStart(3, "0"),
        "widget:",
        widget.r.toString().padStart(3, "0"),
        widget.g.toString().padStart(3, "0"),
        widget.b.toString().padStart(3, "0"),
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
    console.log("URL", req.url);
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
    res.end(JSON.stringify({})); // TODO return next color
};
const server: http.Server = http.createServer(listener);
server.listen(8013, "localhost");
console.log("Server running at http://localhost:8013/");
