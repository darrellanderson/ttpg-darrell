import { AbstractCell } from "../abstract-cell/abstract-cell";
import { ColCell } from "./col-cell";
import { TextCell } from "../text-cell/text-cell";

class MyCell extends AbstractCell {
    public toBuffer(): Promise<Buffer> {
        return this._renderChildren();
    }
}

it("constructor, empty cells", () => {
    expect(() => {
        new ColCell([]);
    }).toThrow();
});

it("getSize (with cells)", () => {
    const width = 20;
    const height = 10;
    const rowSize: { width: number; height: number } = new ColCell([
        new MyCell(width, height),
        new MyCell(width, height),
        new MyCell(width, height),
    ]).getSize();
    expect(rowSize).toEqual({ width: 20, height: 30 });
});

it("toBuffer", async () => {
    const buffer: Buffer = await new ColCell([
        new TextCell(1, 1, ""),
        new TextCell(1, 1, ""),
        new TextCell(1, 1, ""),
    ]).toBuffer();
    expect(buffer).toBeDefined();
});

it("layout with spacing", () => {
    const cell1 = new MyCell(1, 10);
    const cell2 = new MyCell(1, 10);
    const colCell = new ColCell([cell1, cell2], 5);
    expect(cell1.getLocalPosition()).toEqual({ left: 0, top: 0 });
    expect(cell2.getLocalPosition()).toEqual({ left: 0, top: 15 });
    expect(colCell.getSize()).toEqual({ width: 1, height: 25 });
});
