import path from "fs-extra";
import sharp, { Metadata } from "sharp";
import { AbstractCell } from "../abstract-cell/abstract-cell";

/**
 * Load an image from a file.
 * Require the image size at construtor time for synchronous use.
 */
export class ImageCell extends AbstractCell {
    private readonly _imageFile: string | undefined;

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
        if (!path.existsSync(imageFile)) {
            throw new Error(`no file "${imageFile}"`);
        }
        this._imageFile = imageFile;
    }

    public toBuffer(): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const { width, height } = this.getSize();
            const image = sharp(this._imageFile);
            image.metadata().then((metadata: Metadata) => {
                if (metadata.width === width && metadata.height === height) {
                    resolve(image.toBuffer());
                } else {
                    reject(
                        `size mimatch (observed ${metadata.width}x${metadata.height}, expected ${width}x${height})`
                    );
                }
            });
        });
    }
}
