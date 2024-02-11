import { CellSize } from "../abstract-cell/abstract-cell";
import { GridCell } from "./grid-cell";

it("constructor", () => {
    new GridCell([]);
});

it("getMaxCells", () => {
    const cellSize: CellSize = { width: 500, height: 750 };
    const max = GridCell.getMaxCells(cellSize);
    expect(max).toEqual(40);
});
