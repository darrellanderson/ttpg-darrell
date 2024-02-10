import { ICell } from "../i-cell";
import sharp from "sharp";

export class TextCell implements ICell {
    private readonly _width: number;
    private readonly _height: number;
    private _text: string = "";
    private _fontSize: number = 16;

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
    }

    setFontSize(fontSize: number): this {
        this._fontSize = fontSize;
        return this;
    }

    setText(text: string): this {
        this._text = text;
        return this;
    }

    getCellSize(): { w: number; h: number } {
        return { w: this._width, h: this._height };
    }

    toBuffer(): Promise<Buffer> {
        const dy: number = Math.floor(this._fontSize * 0.37);
        const svgText: string = `<?xml version="1.0" standalone="no"?>
            <svg
            xmlns="http://www.w3.org/2000/svg"
            xml:lang="en"
            height="${this._height}"
            width="${this._width}">
            <text
            text-anchor="middle"
            x="50%" y="50%"
            dy="${dy}"
            fill="#ED0013"
            font-size="${this._fontSize}"
            font-family="Didot"
            font-style="Regular"
            >
            ${this._text}
            </text>
            </svg>`;
        console.log(svgText);
        const svgBuffer: Buffer = Buffer.from(svgText);
        return sharp(svgBuffer).toBuffer();
    }
}
