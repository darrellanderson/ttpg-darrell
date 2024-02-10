import { ICell } from "../i-cell";

export class RowCell implements ICell {
    private readonly _cells: ICell[] = [];

    getCellSize(): { w: number; h: number } {
        let w = 0;
        let h = 0;
        for (const cell of this._cells) {
            const cellSize = cell.getCellSize();
            if (cellSize.w < 0) {
                throw new Error("negative cell width");
            }
            w += cellSize.w;
            h = Math.max(h, cellSize.h);
        }
        return { w, h };
    }

    toBuffer(): Promise<Buffer> {
        throw new Error("Method not implemented.");
    }
}
