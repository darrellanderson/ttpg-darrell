import sharp from "sharp";
import { AbstractCell } from "../abstract-cell/abstract-cell";

/**
 * Center text in a cell.
 *
 * Supports custom fonts, which must be installed on the system.
 */
export class TextCell extends AbstractCell {
    private readonly _text: string;
    private _font: string = "Futura";
    private _fontStyle: string = "Regular";
    private _fontSize: number = 16;
    private _textColor: string = "#000000";

    constructor(width: number, height: number, text: string) {
        super(width, height);
        this._text = text;
    }

    public setTextColor(color: string) {
        this._textColor = color;
        return this;
    }

    public setFont(font: string): this {
        this._font = font;
        return this;
    }

    public setFontSize(fontSize: number): this {
        this._fontSize = fontSize;
        return this;
    }

    public setFontStyle(fontStyle: string): this {
        this._fontStyle = fontStyle;
        return this;
    }

    public toBuffer(): Promise<Buffer> {
        const { width, height } = this.getSize();
        const dy: number = Math.floor(this._fontSize * 0.37);
        const svgText: string = `<?xml version="1.0" standalone="no"?>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xml:lang="en"
                height="${height}"
                width="${width}"
            >
                <text
                    text-anchor="middle"
                    x="50%" y="50%"
                    dy="${dy}"
                    fill="${this._textColor}"
                    font-size="${this._fontSize}"
                    font-family="${this._font}"
                    font-style="${this._fontStyle}"
                >
                    ${this._text}
                </text>
            </svg>`;
        const svgBuffer: Buffer = Buffer.from(svgText);
        return sharp(svgBuffer).png().toBuffer();
    }
}
