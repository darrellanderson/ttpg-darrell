import sharp from "sharp";
import { AbstractCell } from "../abstract-cell/abstract-cell";

export class SolidCell extends AbstractCell {
    private _backgroundColor: {
        r: number;
        g: number;
        b: number;
    } = { r: 0, g: 0, b: 0 };

    constructor(width: number, height: number, color: string) {
        super(width, height);
        this.setColor(color);
    }

    setColor(color: string): this {
        const m: RegExpMatchArray | null = color.match(/^#([0-9a-f]{6})$/i);
        if (!m || !m[1]) {
            throw new Error(`invalid color "${color}"`);
        }
        color = m[1]; // strip off leading #
        const r = Number.parseInt(color.substring(0, 2), 16); // 255;
        const g = Number.parseInt(color.substring(2, 4), 16); // 255;
        const b = Number.parseInt(color.substring(4, 6), 16); // 255;
        this._backgroundColor = { r, g, b };
        return this;
    }

    public toBuffer(): Promise<Buffer> {
        const { width, height } = this.getSize();
        return sharp({
            create: {
                width,
                height,
                channels: 4,
                background: this._backgroundColor,
            },
        })
            .png()
            .toBuffer();
    }
}
