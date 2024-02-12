import sharp from "sharp";
import { TextCell } from "./text-cell";

async function main() {
    const cell = new TextCell(300, 100, "TEST").setFontSize(90);
    const buffer = await cell.toBuffer();
    sharp(buffer).toFile("test.png");
}

main();
