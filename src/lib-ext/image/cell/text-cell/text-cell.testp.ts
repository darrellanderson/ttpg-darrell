import sharp from "sharp";
import { TextCell } from "./text-cell";
import { ICell } from "../i-cell";

async function main() {
    const cell: ICell = new TextCell("TEST", 300, 100).setFontSize(90);
    const buffer = await cell.toBuffer();
    sharp(buffer).png().toFile("test.png");
}

main();
