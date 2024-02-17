import sharp, { Metadata } from "sharp";
import { AbstractCell } from "../abstract-cell/abstract-cell";

/**
 * Load an image from a file.
 */
export class ImageCell extends AbstractCell {
    private readonly _imageFile: string | undefined;
    private _alpha: number = 1;
    private _grayscale: boolean = false;
    private _tint: string = "#ffffff";

    public static from(imageFile: string): Promise<ImageCell> {
        return new Promise<ImageCell>((resolve, reject) => {
            sharp(imageFile)
                .metadata()
                .then((metadata: Metadata) => {
                    const w: number | undefined = metadata.width;
                    const h: number | undefined = metadata.height;
                    if (w === undefined || h === undefined) {
                        reject("missing width or height");
                    } else {
                        resolve(new ImageCell(w, h, imageFile));
                    }
                });
        });
    }

    constructor(width: number, height: number, imageFile: string) {
        super(width, height);
        this._imageFile = imageFile;
    }

    setAlpha(value: number): this {
        if (value < 0 || value > 1) {
            throw new Error(`invalid alpha "${value}"`);
        }
        this._alpha = value;
        return this;
    }

    setGrayscale(value: boolean): this {
        this._grayscale = value;
        return this;
    }

    setTint(value: string): this {
        if (!value.match(/^#[0-9a-f]{6}$/i)) {
            throw new Error(`invalid tint "${value}"`);
        }
        this._tint = value;
        return this;
    }

    public toBuffer(): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const { width, height } = this.getSize();
            let image = sharp(this._imageFile);
            image.metadata().then((metadata: Metadata) => {
                if (metadata.width === width && metadata.height === height) {
                    if (this._alpha < 1) {
                        image = image.ensureAlpha(this._alpha);
                    }
                    if (this._grayscale) {
                        image = image.grayscale(true);
                    }
                    if (this._tint !== "#ffffff") {
                        image = image.tint(this._tint);
                    }
                    resolve(image.png().toBuffer());
                } else {
                    reject(
                        `size mimatch (observed ${metadata.width}x${metadata.height}, expected ${width}x${height})`
                    );
                }
            });
        });
    }
}
