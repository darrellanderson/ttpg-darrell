import path from "fs-extra";
import { ICell } from "../i-cell";
import sharp, { Metadata } from "sharp";

/**
 * Load an image from a file.
 * Require the image size at construtor time for synchronous use.
 */
export class ImageCell implements ICell {
    private readonly _imageFile: string | undefined;
    private readonly _width: number;
    private readonly _height: number;

    static from(imageFile: string): Promise<ImageCell> {
        return new Promise<ImageCell>((resolve, reject) => {
            sharp(imageFile)
                .metadata()
                .then((metadata: Metadata) => {
                    const w: number | undefined = metadata.width;
                    const h: number | undefined = metadata.height;
                    if (w === undefined || h === undefined) {
                        reject("missing width or height");
                    } else {
                        resolve(new ImageCell(imageFile, w, h));
                    }
                });
        });
    }

    constructor(imageFile: string, width: number, height: number) {
        if (!path.existsSync(imageFile)) {
            throw new Error(`no file "${imageFile}"`);
        }
        this._imageFile = imageFile;
        this._width = width;
        this._height = height;
    }

    getCellSize(): { w: number; h: number } {
        return { w: this._width, h: this._height };
    }

    toBuffer(): Promise<Buffer> {
        if (!this._imageFile) {
            throw new Error("must setImageFile first");
        }

        return new Promise<Buffer>((resolve, reject) => {
            const image = sharp(this._imageFile);
            image.metadata().then((metadata: Metadata) => {
                if (
                    metadata.width === this._width &&
                    metadata.height === this._height
                ) {
                    resolve(image.toBuffer());
                } else {
                    reject(
                        `size mimatch (observed ${metadata.width}x${metadata.height}, expected ${this._width}x${this._height})`
                    );
                }
            });
        });
    }
}
