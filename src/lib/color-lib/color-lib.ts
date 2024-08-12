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
            r * -0.0902095325985418 +
            g * 0.13529200886427478 +
            b * 0.12358104118425324 +
            r * r * 1.1247037549494685 +
            g * g * 0.12382579853439336 +
            b * b * -0.1937725065563627 +
            -0.09950361133477958;
        g2 =
            r * -0.25458168224775274 +
            g * -0.23662262440300025 +
            b * 0.09936146757400728 +
            r * r * 0.3157282712938037 +
            g * g * 1.4471966406254066 +
            b * b * -0.10276370037530605 +
            -0.021178519598628043;
        b2 =
            r * -0.2555956705318538 +
            g * 0.07894334765236367 +
            b * -0.13792469943191013 +
            r * r * 0.2610095645718642 +
            g * g * 0.03985318195098798 +
            b * b * 1.2653880093969054 +
            -0.016018974164296318;

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
            r * 0.5488134621500121 +
            g * 0.0009417953587216267 +
            b * 0.033135988668633605 +
            r * r * 0.3654662993866032 +
            g * g * 0.21316829595160297 +
            b * b * -0.062316302183577005 +
            0.02370758768841924;
        g2 =
            r * -0.16198076023524963 +
            g * 0.7285896654135345 +
            b * 0.17715918142331255 +
            r * r * 0.26045932533178323 +
            g * g * 0.29557961818501094 +
            b * b * -0.22156622826895 +
            -0.0014416892418535054;
        b2 =
            r * -0.14974048157579797 +
            g * 0.058049709971899136 +
            b * 0.6218316431412642 +
            r * r * 0.19888467914689917 +
            g * g * 0.0636706824508024 +
            b * b * 0.2950080637594291 +
            0.04326095329843915;

        r2 = Math.min(1, Math.max(0, r2));
        g2 = Math.min(1, Math.max(0, g2));
        b2 = Math.min(1, Math.max(0, b2));
        return new Color(r2, g2, b2, 1);
    }
}
