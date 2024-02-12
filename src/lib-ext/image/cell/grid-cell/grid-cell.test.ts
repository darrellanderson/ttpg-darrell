import { Widget } from "@tabletop-playground/api";
import { AbstractCell, CellSize } from "../abstract-cell/abstract-cell";
import { GridCell } from "./grid-cell";

class MyCell extends AbstractCell {
    public toBuffer(): Promise<Buffer> {
        throw new Error("Method not implemented.");
    }
}

it("static getMaxCellCount", () => {
    const cellSize: CellSize = { width: 500, height: 750 };
    const max = GridCell.getMaxCellCount(cellSize);
    expect(max).toEqual(40);
});

it("static getOptimalLayout", () => {
    let cellCount: number;
    let cellSize: CellSize;
    let optLayout: { cols: number; rows: number };

    cellCount = 4;
    cellSize = { width: 250, height: 200 };
    optLayout = GridCell.getOptimalLayout(cellCount, cellSize);
    expect(optLayout).toEqual({ cols: 1, rows: 4 });

    cellCount = 21; // only 20 fit in a single column
    optLayout = GridCell.getOptimalLayout(cellCount, cellSize);
    expect(optLayout).toEqual({ cols: 16, rows: 2 });

    cellCount = 4;
    cellSize = { width: 200, height: 250 };
    optLayout = GridCell.getOptimalLayout(cellCount, cellSize);
    expect(optLayout).toEqual({ cols: 4, rows: 1 });
});

it("constructor", () => {
    new GridCell([], 3);
});

it("constructor (invalid column count)", () => {
    expect(() => {
        new GridCell([], -3);
    }).toThrow();
});

it("constructor (exceed max size)", () => {
    expect(() => {
        new GridCell([new MyCell(4097, 4097)], 1);
    }).toThrow();
});

it("toBuffer", () => {
    new GridCell([], 1).toBuffer();
});

it("layout", () => {
    const child1 = new MyCell(1, 1);
    const child2 = new MyCell(1, 1);
    const child3 = new MyCell(1, 1);
    const numCols = 2;
    new GridCell([child1, child2, child3], numCols);
    expect(child1.getGlobalPosition()).toEqual({ left: 0, top: 0 });
    expect(child2.getGlobalPosition()).toEqual({ left: 1, top: 0 });
    expect(child3.getGlobalPosition()).toEqual({ left: 0, top: 1 });
});
