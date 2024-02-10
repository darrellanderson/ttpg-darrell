import { ICell } from "../i-cell";
import sharp from "sharp";

export class TextCell implements ICell {
    private readonly _text: string;
    private readonly _width: number;
    private readonly _height: number;
    private _font: string = "Futura";
    private _fontStyle: string = "Regular";
    private _fontSize: number = 16;
    private _bgColor: string = "#ffffff";
    private _fgColor: string = "#000000";

    constructor(text: string, width: number, height: number) {
        this._text = text;
        this._width = width;
        this._height = height;
    }

    setFont(font: string): this {
        this._font = font;
        return this;
    }

    setFontSize(fontSize: number): this {
        this._fontSize = fontSize;
        return this;
    }

    setFontStyle(fontStyle: string): this {
        this._fontStyle = fontStyle;
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
                width="${this._width}"
            >
                <rect width="100%" height="100%" fill="${this._bgColor}" /> 
                <text
                    text-anchor="middle"
                    x="50%" y="50%"
                    dy="${dy}"
                    fill="${this._fgColor}"
                    font-size="${this._fontSize}"
                    font-family="${this._font}"
                    font-style="${this._fontStyle}"
                >
                    ${this._text}
                </text>
            </svg>`;
        const svgBuffer: Buffer = Buffer.from(svgText);
        return sharp(svgBuffer).toBuffer();
    }
}
