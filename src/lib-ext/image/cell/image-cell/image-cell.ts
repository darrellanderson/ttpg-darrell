import path from "fs-extra";
import { ICell } from "../i-cell";
import sharp from "sharp";

export class ImageCell implements ICell {
    private readonly _width: number;
    private readonly _height: number;
    private _imageFile: string = "";

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
    }

    setImageFile(imageFile: string) {
        if (!path.existsSync(imageFile)) {
            throw new Error(`no file "${imageFile}"`);
        }
        this._imageFile = imageFile;
        return this;
    }

    getCellSize(): { w: number; h: number } {
        return { w: this._width, h: this._height };
    }

    toBuffer(): Promise<Buffer> {
        return sharp(this._imageFile).toBuffer();
    }
}
