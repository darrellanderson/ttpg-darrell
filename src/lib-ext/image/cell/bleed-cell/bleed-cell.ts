import sharp from "sharp";
import { AbstractCell, CellSize } from "../abstract-cell/abstract-cell";

/**
 * Wrap a cell in a bleed-size frame, copy edge pixels from the cell
 * to the edge of the larger bleed-cell.
 */
export class BleedCell extends AbstractCell {
    private readonly _innerCell: AbstractCell;
    private readonly _bleedLeftRight: number;
    private readonly _bleedTopBottom: number;

    constructor(
        innerCell: AbstractCell,
        bleedLeftRight: number,
        bleedTopBottom: number
    ) {
        if (bleedLeftRight < 0 || bleedTopBottom < 0) {
            throw new Error("bad bleed");
        }
        const innerSize: CellSize = innerCell.getSize();
        super(
            innerSize.width + bleedLeftRight * 2,
            innerSize.height + bleedTopBottom * 2
        );
        this._innerCell = innerCell;
        this._bleedLeftRight = bleedLeftRight;
        this._bleedTopBottom = bleedTopBottom;
    }

    private _extractAndStretch(
        edge: "left" | "right" | "top" | "bottom"
    ): Promise<Buffer> {
        const innerSize: CellSize = this._innerCell.getSize();

        let left: number = 0;
        let top: number = 0;
        let srcWidth: number = 0;
        let srcHeight: number = 0;
        let dstWidth: number = 0;
        let dstHeight: number = 0;

        if (edge === "left" || edge === "top") {
            left = 0;
            top = 0;
        } else if (edge === "right") {
            left = innerSize.width - 1;
            top = 0;
        } else if (edge === "bottom") {
            left = 0;
            top = innerSize.height - 1;
        }

        if (edge === "left" || edge === "right") {
            srcWidth = 1;
            srcHeight = innerSize.height;
            dstWidth = this._bleedLeftRight;
            dstHeight = innerSize.height;
        } else if (edge === "top" || edge === "bottom") {
            srcWidth = innerSize.width;
            srcHeight = 1;
            dstWidth = innerSize.width;
            dstHeight = this._bleedTopBottom;
        }

        return new Promise<Buffer>((resolve): void => {
            this._innerCell.toBuffer().then((buffer: Buffer): void => {
                // Only extract/resize when non-empty area.
                if (dstWidth === 0 || dstHeight === 0) {
                    resolve(buffer);
                    return;
                }
                sharp(buffer)
                    .extract({
                        left,
                        top,
                        width: srcWidth,
                        height: srcHeight,
                    })
                    .resize(dstWidth, dstHeight, {
                        fit: "fill",
                        kernel: "nearest",
                    })
                    .png()
                    .toBuffer()
                    .then((buffer2: Buffer): void => {
                        resolve(buffer2);
                    });
            });
        });
    }

    public toBuffer(): Promise<Buffer> {
        const { width, height }: CellSize = this.getSize();
        const image = sharp({
            create: {
                width,
                height,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 255 },
            },
        });

        const inner: Promise<Buffer> = this._innerCell.toBuffer();
        const left: Promise<Buffer> = this._extractAndStretch("left");
        const right: Promise<Buffer> = this._extractAndStretch("right");
        const top: Promise<Buffer> = this._extractAndStretch("top");
        const bottom: Promise<Buffer> = this._extractAndStretch("bottom");

        return new Promise<Buffer>((resolve): void => {
            Promise.all([inner, left, right, top, bottom]).then(
                ([inner2, left2, right2, top2, bottom2]): void => {
                    image
                        .composite([
                            {
                                left: 0,
                                top: this._bleedTopBottom,
                                input: left2,
                            },
                            {
                                left: width - this._bleedLeftRight,
                                top: this._bleedTopBottom,
                                input: right2,
                            },
                            {
                                left: this._bleedLeftRight,
                                top: 0,
                                input: top2,
                            },
                            {
                                left: this._bleedLeftRight,
                                top: height - this._bleedTopBottom,
                                input: bottom2,
                            },
                            {
                                left: this._bleedLeftRight,
                                top: this._bleedTopBottom,
                                input: inner2,
                            },
                        ])
                        .png()
                        .toBuffer()
                        .then((buffer: Buffer): void => {
                            resolve(buffer);
                        });
                }
            );
        });
    }
}
