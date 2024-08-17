/**
 * Given a screenshot and start/end coordinates extract the color values.
 */
import fs from "fs";
import sharp, { Metadata } from "sharp";

type RGB = [r: number, g: number, b: number];

async function extractColors(
    filename: string,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    n: number
): Promise<Array<RGB>> {
    const result: Array<RGB> = [];
    const image = sharp(filename);
    const metadata: Metadata = await image.metadata();
    const w: number | undefined = metadata.width;
    const h: number | undefined = metadata.height;
    if (!w || !h) {
        throw new Error("bad metadata");
    }

    const raw = await image.raw().toBuffer();
    const pixelArray: Uint8ClampedArray = new Uint8ClampedArray(raw); // [r, g, b, a] repeated

    if (pixelArray.length !== w * h * 4) {
        throw new Error("bad pixel array");
    }

    const getPx = (x: number, y: number): RGB => {
        const i: number = (y * w + x) * 4;
        const pixel: Uint8ClampedArray = pixelArray.slice(i, i + 4);
        const s: number = 10000;
        const r: number = Math.floor((pixel[0]! * s) / 255) / s;
        const g: number = Math.floor((pixel[1]! * s) / 255) / s;
        const b: number = Math.floor((pixel[2]! * s) / 255) / s;
        return [r, g, b];
    };

    const dx = (endX - startX) / (n - 1);
    const dy = (endY - startY) / (n - 1);
    for (let i = 0; i < n; i++) {
        const x = Math.round(startX + i * dx);
        const y = Math.round(startY + i * dy);
        const rgb: RGB = getPx(x, y);
        result.push(rgb);
    }

    return result;
}

async function processScreenshot() {
    const filename: string =
        "/Users/darrell/Desktop/Screenshot 2024-08-16 at 10.34.21 AM.png";
    if (!fs.existsSync(filename)) {
        throw new Error(`file not found "${filename}"`);
    }

    // Plastic.
    {
        const startX: number = 50;
        const startY: number = 44;
        const endX: number = 4904;
        const endY: number = 43;
        const n: number = 40;
        const colors: Array<RGB> = await extractColors(
            filename,
            startX,
            startY,
            endX,
            endY,
            n
        );

        console.log(colors);
    }

    // Widget.
    {
        const startX: number = 55;
        const startY: number = 107;
        const endX: number = 4898;
        const endY: number = 107;
        const n: number = 40;
        const colors: Array<RGB> = await extractColors(
            filename,
            startX,
            startY,
            endX,
            endY,
            n
        );

        console.log(colors);
    }
}

processScreenshot();
