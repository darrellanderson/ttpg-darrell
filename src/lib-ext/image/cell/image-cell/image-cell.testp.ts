import sharp from "sharp";
import { ImageCell } from "./image-cell";
import { ICell } from "../i-cell";

async function main() {
    const cell: ICell = new ImageCell(100, 100);
    const buffer = await cell.toBuffer();
    sharp(buffer).png().toFile("test.png");
}

main();
