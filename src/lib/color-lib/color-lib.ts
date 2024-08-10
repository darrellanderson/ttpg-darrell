import { Color } from "@tabletop-playground/api";

export const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export class ColorLib {
    private readonly _hexColorRegex: RegExp = new RegExp(HEX_COLOR_REGEX);

    parseColor(hexColor: string): Color | undefined {
        const m: RegExpMatchArray | null = hexColor.match(this._hexColorRegex);
        const hexStr: string = m?.[1] ?? "";
        if (!m) {
            return undefined;
        }
        if (hexStr.length !== 3 && hexStr.length !== 6 && hexStr.length !== 8) {
            return undefined;
        }

        let r = 0;
        let g = 0;
        let b = 0;
        let a = 1;
        if (hexStr.length === 3) {
            r = Number.parseInt(hexStr.substring(0, 1), 16) / 15;
            g = Number.parseInt(hexStr.substring(1, 2), 16) / 15;
            b = Number.parseInt(hexStr.substring(2, 3), 16) / 15;
        } else {
            r = Number.parseInt(hexStr.substring(0, 2), 16) / 255;
            g = Number.parseInt(hexStr.substring(2, 4), 16) / 255;
            b = Number.parseInt(hexStr.substring(4, 6), 16) / 255;
        }
        if (hexStr.length === 8) {
            a = Number.parseInt(hexStr.substring(6, 8), 16) / 255;
        }
        return new Color(r, g, b, a);
    }

    parseColorOrThrow(hexColor: string): Color {
        const color: Color | undefined = this.parseColor(hexColor);
        if (!color) {
            throw new Error(`bad hexColor "${hexColor}"`);
        }
        return color;
    }

    /**
     * Given a desired color, convert it to an object color that will
     * match the desired color when rendered in the game.
     *
     * Computed with object roughness=1, metallic=0.
     *
     * @param color
     * @returns
     */
    colorToObjectColor(color: Color): Color {
        const r: number = color.r;
        const g: number = color.g;
        const b: number = color.b;

        let r2, g2, b2: number;

        r2 = r * 0.885651 + g * 0.193954 + b * -0.037329 + -0.006564;
        g2 = r * 0.073605 + g * 0.992809 + b * -0.040581 + -0.016532;
        b2 = r * 0.040627 + g * 0.132084 + b * 0.887353 + -0.004529;

        r2 = Math.min(1, Math.max(0, r2));
        g2 = Math.min(1, Math.max(0, g2));
        b2 = Math.min(1, Math.max(0, b2));
        return new Color(r2, g2, b2, 1);
    }

    /**
     * Given a desired color, convert it to an widget color that will
     * match the desired color when rendered in the game.
     *
     * @param color
     * @returns
     */
    colorToWidgetColor(color: Color): Color {
        const r: number = color.r;
        const g: number = color.g;
        const b: number = color.b;

        let r2, g2, b2: number;

        r2 = r * 0.936863 + g * 0.147071 + b * -0.076044 + -0.101074;
        g2 = r * -0.00588 + g * 1.024239 + b * -0.016933 + -0.0985;
        b2 = r * -0.000127 + g * 0.077907 + b * 1.001909 + -0.131443;

        r2 = Math.min(1, Math.max(0, r2));
        g2 = Math.min(1, Math.max(0, g2));
        b2 = Math.min(1, Math.max(0, b2));
        return new Color(r2, g2, b2, 1);
    }
}
