import { RowCell } from "./row-cell";

it("constructor, getSize", () => {
    const cellSize = new RowCell().getCellSize();
    expect(cellSize).toEqual({ w: 0, h: 0 });
});
