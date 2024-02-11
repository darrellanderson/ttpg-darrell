import { AbstractCell, CellSize } from "../abstract-cell/abstract-cell";

export class GridCell extends AbstractCell {
    static readonly MAX_DIMENSION = 4096;
    static getMaxCells(cellSize: CellSize): number {
        const { width, height } = cellSize;
        const maxCols = Math.floor(this.MAX_DIMENSION / width);
        const maxRows = Math.floor(this.MAX_DIMENSION / height);
        return maxCols * maxRows;
    }

    public toBuffer(): Promise<Buffer> {
        throw new Error("Method not implemented.");
    }
}
