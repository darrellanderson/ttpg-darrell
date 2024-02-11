import { AbstractCell, CellSize } from "../abstract-cell/abstract-cell";

export class GridCell extends AbstractCell {
    static readonly MAX_DIMENSION = 4096;

    static getMaxCells(cellSize: CellSize): number {
        const { width, height } = cellSize;
        const maxCols = Math.floor(this.MAX_DIMENSION / width);
        const maxRows = Math.floor(this.MAX_DIMENSION / height);
        return maxCols * maxRows;
    }

    constructor(cells: Array<AbstractCell>) {
        const size = cells[0]?.getSize() ?? { width: 0, height: 0 };
        super(size.width, size.height);
    }

    public toBuffer(): Promise<Buffer> {
        throw new Error("Method not implemented.");
    }
}
