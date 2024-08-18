import { Color } from "@tabletop-playground/api";

export const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

type RegressionChannel = {
    intercept: number;
    coefs: [
        r1: number,
        g1: number,
        b1: number,
        r2: number,
        g2: number,
        b2: number,
    ];
    score: number;
};
type RegressionRGB = {
    r: RegressionChannel;
    g: RegressionChannel;
    b: RegressionChannel;
    score: number;
};

const PLASTIC: RegressionRGB = {
    r: {
        intercept: 0.0766,
        coefs: [0.5645, -0.0367, 0.052, 0.2791, 0.2155, -0.1261],
        score: 0.9272,
    },
    g: {
        intercept: 0.097,
        coefs: [-0.0703, 0.4939, 0.2167, 0.0627, 0.4718, -0.2707],
        score: 0.9766,
    },
    b: {
        intercept: 0.0401,
        coefs: [-0.0279, 0.0403, 0.8571, 0.0279, 0.08, 0.035],
        score: 0.9631,
    },
    score: 0.9272,
};
const WIDGET: RegressionRGB = {
    r: {
        intercept: -0.127,
        coefs: [0.2367, -0.2194, 0.3499, 0.8011, 0.5352, -0.4461],
        score: 0.9671,
    },
    g: {
        intercept: 0.1,
        coefs: [0.1499, -0.4533, 0.144, -0.2057, 1.531, -0.1811],
        score: 0.9758,
    },
    b: {
        intercept: 0.0785,
        coefs: [0.16, -0.255, -0.1359, -0.2357, 0.3107, 1.241],
        score: 0.981,
    },
    score: 0.9671,
};

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

    _toRawColor(color: Color, regression: RegressionRGB): Color {
        const r: number = color.r;
        const g: number = color.g;
        const b: number = color.b;

        const getChannelColor = (channel: RegressionChannel): number => {
            return (
                channel.intercept +
                channel.coefs[0] * r +
                channel.coefs[1] * g +
                channel.coefs[2] * b +
                channel.coefs[3] * r * r +
                channel.coefs[4] * g * g +
                channel.coefs[5] * b * b
            );
        };

        let r2: number = getChannelColor(regression.r);
        let g2: number = getChannelColor(regression.g);
        let b2: number = getChannelColor(regression.b);

        r2 = Math.min(1, Math.max(0, r2));
        g2 = Math.min(1, Math.max(0, g2));
        b2 = Math.min(1, Math.max(0, b2));
        return new Color(r2, g2, b2, 1);
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
        return this._toRawColor(color, PLASTIC);
    }

    /**
     * Given a desired color, convert it to an widget color that will
     * match the desired color when rendered in the game.
     *
     * @param color
     * @returns
     */
    colorToWidgetColor(color: Color): Color {
        return this._toRawColor(color, WIDGET);
    }
}
