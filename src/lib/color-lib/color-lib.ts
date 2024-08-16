import { Color } from "@tabletop-playground/api";

export const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

// multivariateLinearRegression from src/lib-ext/color-mapping/color-mapping.data.ts
type RGB = [number, number, number];
const PLASTIC_TO_RAW_COLOR: Array<RGB> = [
    [0.841358460237672, -0.013108375536332595, -0.011247688669399292],
    [0.18940476375788595, 0.9188285086136809, 0.11692068575029335],
    [-0.07201052309532319, -0.05137631855162739, 0.8940890841056348],
    [0.02971955627557943, 0.07210017274215108, 0.024357355949243598],
];
const WIDGET_TO_RAW_COLOR: Array<RGB> = [
    [1.0112993474793672, -0.06290310130591337, -0.06941585954311336],
    [0.3003253755435189, 1.0567967707507098, 0.05179696702148906],
    [-0.062188132243505834, -0.017770573277682722, 0.9435839674631517],
    [-0.24024577034604455, -0.10386971615865725, -0.025508920630368692],
];

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

    _toRawColor(color: Color, regression: Array<RGB>): Color {
        const input: RGB = [color.r, color.g, color.b];
        const output: RGB = [0, 0, 0];

        // Seed with intercept.
        const rgb: RGB | undefined = regression[3];
        if (rgb) {
            for (let i = 0; i < 3; i++) {
                const weight: number | undefined = rgb[i];
                if (weight !== undefined) {
                    output[i] = weight;
                }
            }
        }

        // Apply weight matrix.
        for (let i = 0; i < 3; i++) {
            const inValue: number | undefined = input[i];
            const weightRow: RGB | undefined = regression[i];
            if (inValue !== undefined && weightRow !== undefined) {
                for (let j = 0; j < 3; j++) {
                    const outValue = output[j];
                    const weight: number | undefined = weightRow[j];
                    if (outValue !== undefined && weight !== undefined) {
                        output[j] = outValue + weight * inValue;
                    }
                }
            }
        }

        let r2: number = output[0];
        let g2: number = output[1];
        let b2: number = output[2];

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
        return this._toRawColor(color, PLASTIC_TO_RAW_COLOR);
    }

    /**
     * Given a desired color, convert it to an widget color that will
     * match the desired color when rendered in the game.
     *
     * @param color
     * @returns
     */
    colorToWidgetColor(color: Color): Color {
        return this._toRawColor(color, WIDGET_TO_RAW_COLOR);
    }
}
