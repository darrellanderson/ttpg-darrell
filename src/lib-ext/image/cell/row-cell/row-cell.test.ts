import { AbstractCell } from "../abstract-cell/abstract-cell";
import { RowCell } from "./row-cell";
import { TextCell } from "../text-cell/text-cell";

class MyCell extends AbstractCell {
    public toBuffer(): Promise<Buffer> {
        return this._renderChildren();
    }
}

it("constructor, empty", () => {
    expect(() => {
        new RowCell([]);
    }).toThrow();
});

it("getSize (with cells)", () => {
    const width = 20;
    const height = 10;
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

it("layout with spacing", () => {
    const cell1 = new MyCell(10, 1);
    const cell2 = new MyCell(10, 1);
    const rowCell = new RowCell([cell1, cell2], 5);
    expect(cell1.getLocalPosition()).toEqual({ left: 0, top: 0 });
    expect(cell2.getLocalPosition()).toEqual({ left: 15, top: 0 });
    expect(rowCell.getSize()).toEqual({ width: 25, height: 1 });
});
