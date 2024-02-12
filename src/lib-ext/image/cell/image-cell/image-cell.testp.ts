import path from "path";
import sharp from "sharp";
import { ImageCell } from "./image-cell";

const FILE: string = path.join(__dirname, "test.jpg");
const WIDTH: number = 54;
const HEIGHT: number = 64;

async function main() {
    const cell = new ImageCell(WIDTH, HEIGHT, FILE).setTint("#ff0000");
    const buffer = await cell.toBuffer();
    sharp(buffer).toFile("test.png");
}

main();
