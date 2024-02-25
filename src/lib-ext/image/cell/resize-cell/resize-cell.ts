import sharp from "sharp";
import { AbstractCell } from "../abstract-cell/abstract-cell";

/**
 * Wrap another cell, resizing it to the given dimensions.
 */
export class ResizeCell extends AbstractCell {
    private readonly _innerCell: AbstractCell;

    constructor(width: number, height: number, cell: AbstractCell) {
        super(width, height);
        this._innerCell = cell;

        const scaleW: number = width / cell.getSize().width;
        const scaleH: number = height / cell.getSize().height;
        for (const snapPoint of cell.getSnapPoints()) {
            if (snapPoint.left !== undefined) {
                snapPoint.left *= scaleW; // these are copies
            }
            if (snapPoint.top !== undefined) {
                snapPoint.top *= scaleH;
            }
            this.addSnapPoint(snapPoint);
        }
    }

    public toBuffer(): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this._innerCell.toBuffer().then((buffer: Buffer): void => {
                const { width, height } = this.getSize();
                sharp(buffer)
                    .resize(width, height, { fit: "fill" })
                    .png()
                    .toBuffer()
                    .then((buffer: Buffer): void => {
                        resolve(buffer);
                    }, reject);
            }, reject);
        });
    }
}
