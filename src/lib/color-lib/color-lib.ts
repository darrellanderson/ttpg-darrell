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
            r * 0.548831 +
            g * 0.001021 +
            b * 0.033153 +
            r * r * 0.365455 +
            g * g * 0.213088 +
            b * b * -0.062333 +
            0;
        g2 =
            r * -0.161978 +
            g * 0.728566 +
            b * 0.177164 +
            r * r * 0.260457 +
            g * g * 0.295609 +
            b * b * -0.221567 +
            0;
        b2 =
            r * -0.149709 +
            g * 0.058069 +
            b * 0.621793 +
            r * r * 0.19885 +
            g * g * 0.063648 +
            b * b * 0.295044 +
            0.000169;

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
            r * -0.090176 +
            g * 0.135339 +
            b * 0.123576 +
            r * r * 1.124675 +
            g * g * 0.123794 +
            b * b * -0.193759 +
            -0.000391;
        g2 =
            r * -0.254546 +
            g * -0.236687 +
            b * 0.099332 +
            r * r * 0.315694 +
            g * g * 1.447283 +
            b * b * -0.102734 +
            0;
        b2 =
            r * -0.25566 +
            g * 0.07891 +
            b * -0.137923 +
            r * r * 0.261082 +
            g * g * 0.0399 +
            b * b * 1.265407 +
            0;

        r2 = Math.min(1, Math.max(0, r2));
        g2 = Math.min(1, Math.max(0, g2));
        b2 = Math.min(1, Math.max(0, b2));
        return new Color(r2, g2, b2, 1);
    }
}
