import fs from "fs/promises";
import { AbstractCell } from "../abstract-cell/abstract-cell";
import { CellParser } from "./cell-parser";

const cell: AbstractCell = new CellParser().parse({
    type: "TextCell",
    width: 600,
    height: 100,
    fontSize: 90,
    text: "my text",
});

async function main() {
    const buffer: Buffer = await cell.toBuffer();
    await fs.writeFile("test.png", buffer);
}
main();
