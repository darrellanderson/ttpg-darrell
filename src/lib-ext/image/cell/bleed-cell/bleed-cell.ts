import sharp from "sharp";
import { AbstractCell, CellSize } from "../abstract-cell/abstract-cell";

/**
 * Wrap a cell in a bleed-size frame, copy edge pixels from the cell
 * to the edge of the larger bleed-cell.
 */
export class BleedCell extends AbstractCell {
    private readonly _innerCell: AbstractCell;
    private readonly _bleedSize: number;

    constructor(innerCell: AbstractCell, bleedSize: number) {
        const innerSize: CellSize = innerCell.getSize();
        super(
            innerSize.width + bleedSize * 2,
            innerSize.height + bleedSize * 2
        );
        this._innerCell = innerCell;
        this._bleedSize = bleedSize;
    }

    public toBuffer(): Promise<Buffer> {
        const innerSize: CellSize = this._innerCell.getSize();
        const { width, height }: CellSize = this.getSize();
        const image = sharp({
            create: {
                width,
                height,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 255 },
            },
        });

        return new Promise<Buffer>((resolve) => {
            this._innerCell.toBuffer().then((buffer: Buffer) => {
                const inner = sharp(buffer);

                // XXXX
                console.log(
                    JSON.stringify({
                        left: 0,
                        top: 0,
                        width: 1,
                        height: innerSize.height,
                    })
                );
                console.log(
                    JSON.stringify({
                        left: innerSize.width - 1,
                        top: 0,
                        width: 1,
                        height: innerSize.height,
                    })
                );
                console.log(
                    JSON.stringify({
                        left: 0,
                        top: 0,
                        width: innerSize.width,
                        height: 1,
                    })
                );
                console.log(
                    JSON.stringify({
                        left: 0,
                        top: innerSize.height - 1,
                        width: innerSize.width,
                        height: 1,
                    })
                );
                const left = inner
                    .extract({
                        left: 0,
                        top: 0,
                        width: 1,
                        height: innerSize.height,
                    })
                    .resize(this._bleedSize, innerSize.height, { fit: "fill" })
                    .toBuffer();
                const right = inner
                    .extract({
                        left: innerSize.width - 1,
                        top: 0,
                        width: 1,
                        height: innerSize.height,
                    })
                    .resize(this._bleedSize, innerSize.height, { fit: "fill" })
                    .toBuffer();
                const top = inner
                    .extract({
                        left: 0,
                        top: 0,
                        width: innerSize.width,
                        height: 1,
                    })
                    .resize(innerSize.width, this._bleedSize, { fit: "fill" })
                    .toBuffer();
                const bottom = inner
                    .extract({
                        left: 0,
                        top: innerSize.height - 1,
                        width: innerSize.width,
                        height: 1,
                    })
                    .resize(innerSize.width, this._bleedSize, { fit: "fill" })
                    .toBuffer();
                console.log("__3");
                Promise.all([left, right, top, bottom]).then(
                    ([left, right, top, bottom]) => {
                        console.log("__4");
                        image.composite([
                            { left: 0, top: this._bleedSize, input: left },
                            {
                                left: innerSize.width + this._bleedSize,
                                top: this._bleedSize,
                                input: right,
                            },
                            { left: this._bleedSize, top: 0, input: top },
                            {
                                left: this._bleedSize,
                                top: innerSize.height + this._bleedSize,
                                input: bottom,
                            },
                        ]);
                        resolve(image.png().toBuffer());
                    }
                );
            });
        });
    }
}
