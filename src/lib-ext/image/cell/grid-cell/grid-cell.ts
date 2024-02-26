import {
    AbstractCell,
    CellChild,
    CellSize,
} from "../abstract-cell/abstract-cell";

/**
 * Layout cells in a grid (potentially for cardsheets).
 */
export class GridCell extends AbstractCell {
    static readonly MAX_DIMENSION = 4096;

    static getMaxCellCount(cellSize: CellSize): number {
        const { width, height } = cellSize;
        const maxCols = Math.floor(this.MAX_DIMENSION / width);
        const maxRows = Math.floor(this.MAX_DIMENSION / height);
        return maxCols * maxRows;
    }

    /**
     * Most GPUs reserve power-of-2 dimensions.  Compute the
     * row/col layout with the fewest wasted pixels.
     *
     * @param cellCount
     * @param cellSize
     * @returns
     */
    static getOptimalLayout(
        cellCount: number,
        cellSize: CellSize
    ): { cols: number; rows: number } {
        let optLayout: { cols: number; rows: number } = { cols: -1, rows: -1 };
        let optEfficiency = 0;

        const absoluteMaxCols: number = Math.floor(
            this.MAX_DIMENSION / cellSize.width
        );
        const absoluteMaxRows: number = Math.floor(
            this.MAX_DIMENSION / cellSize.height
        );

        const maxCols = Math.min(absoluteMaxCols, cellCount);
        for (let cols = 1; cols <= maxCols; cols++) {
            const maxRows = Math.min(absoluteMaxRows, cellCount);
            const rows = Math.ceil(cellCount / cols);
            if (rows > maxRows) {
                continue;
            }
            const w: number = cols * cellSize.width;
            const h: number = rows * cellSize.height;
            const pow2w: number = Math.pow(2, Math.ceil(Math.log2(w)));
            const pow2h: number = Math.pow(2, Math.ceil(Math.log2(h)));
            const efficiency: number = (w * h) / (pow2w * pow2h);
            if (efficiency > optEfficiency) {
                optLayout = { cols, rows };
                optEfficiency = efficiency;
            }
        }
        return optLayout;
    }

    constructor(
        cells: Array<AbstractCell>,
        numCols: number,
        spacing: number = 0
    ) {
        if (cells.length === 0) {
            throw new Error("no cells");
        }
        if (numCols <= 0) {
            throw new Error(`invalid column count "${numCols}"`);
        }
        const maxSize: CellSize = GridCell.getMaxSize(cells);
        const maxCellCount: number = GridCell.getMaxCellCount(maxSize);
        if (cells.length > maxCellCount) {
            throw new Error(`${cells.length} cells, max ${maxCellCount}`);
        }

        const numRows: number = Math.ceil(cells.length / numCols);
        const childrenWithLayout: Array<CellChild> = cells.map(
            (child, index) => {
                const col: number = index % numCols;
                const row: number = Math.floor(index / numCols);
                const left: number = col * (maxSize.width + spacing);
                const top: number = row * (maxSize.height + spacing);
                return { child, left, top };
            }
        );
        super(
            maxSize.width * numCols,
            maxSize.height * numRows,
            childrenWithLayout
        );
    }

    public toBuffer(): Promise<Buffer> {
        return this._renderChildren();
    }
}
