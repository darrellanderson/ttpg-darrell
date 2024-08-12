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

        r2 =
            r * -0.090212 +
            g * 0.135286 +
            b * 0.123582 +
            r * r * 1.124705 +
            g * g * 0.123831 +
            b * b * -0.193775 +
            -0.000391;
        g2 =
            r * -0.25458 +
            g * -0.236624 +
            b * 0.099363 +
            r * r * 0.315725 +
            g * g * 1.447197 +
            b * b * -0.102766 +
            0;
        b2 =
            r * -0.255594 +
            g * 0.078942 +
            b * -0.137927 +
            r * r * 0.261007 +
            g * g * 0.039852 +
            b * b * 1.265389 +
            0;

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

        r2 =
            r * 0.548814 +
            g * 0.000942 +
            b * 0.033133 +
            r * r * 0.365465 +
            g * g * 0.213167 +
            b * b * -0.062314 +
            0;
        g2 =
            r * -0.161983 +
            g * 0.728589 +
            b * 0.177157 +
            r * r * 0.26046 +
            g * g * 0.295578 +
            b * b * -0.221565 +
            0;
        b2 =
            r * -0.149738 +
            g * 0.058053 +
            b * 0.621833 +
            r * r * 0.198881 +
            g * g * 0.063666 +
            b * b * 0.295005 +
            0.000169;

        r2 = Math.min(1, Math.max(0, r2));
        g2 = Math.min(1, Math.max(0, g2));
        b2 = Math.min(1, Math.max(0, b2));
        return new Color(r2, g2, b2, 1);
    }
}
