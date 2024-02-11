import { AbstractCell } from "../abstract-cell/abstract-cell";
import { RowCell } from "./row-cell";
import { TextCell } from "../text-cell/text-cell";

it("constructor, getSize", () => {
    const cellSize: { width: number; height: number } = new RowCell(
        []
    ).getSize();
    expect(cellSize).toEqual({ width: 0, height: 0 });
});

it("getSize (with cells)", () => {
    const width = 20;
    const height = 10;
    class MyCell extends AbstractCell {
        public toBuffer(): Promise<Buffer> {
            throw new Error("Method not implemented.");
        }
    }
    const rowSize: { width: number; height: number } = new RowCell([
        new MyCell(width, height),
        new MyCell(width, height),
        new MyCell(width, height),
    ]).getSize();
    expect(rowSize).toEqual({ width: 60, height: 10 });
});

it("toBuffer", async () => {
    const buffer: Buffer = await new RowCell([
        new TextCell(1, 1, ""),
        new TextCell(1, 1, ""),
        new TextCell(1, 1, ""),
    ]).toBuffer();
    expect(buffer).toBeDefined();
});
