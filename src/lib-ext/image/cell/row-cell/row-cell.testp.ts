import sharp from "sharp";
import { RowCell } from "./row-cell";
import { TextCell } from "../text-cell/text-cell";

async function main() {
    const rowCell = new RowCell(
        [
            new TextCell(20, 20, "1"),
            new TextCell(20, 20, "2"),
            new TextCell(20, 20, "3"),
        ],
        20
    );
    const buffer = await rowCell.toBuffer();
    sharp(buffer).toFile("test.png");
}

main();
