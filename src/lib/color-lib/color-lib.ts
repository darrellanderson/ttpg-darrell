import { Color, world } from "@tabletop-playground/api";
import { COLORS, ColorsType } from "./colors.data";

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

    getColorsByName(colorName: string, index: number): ColorsType | undefined {
        const colorsArray: Array<ColorsType> | undefined = COLORS[colorName];
        return colorsArray?.[index];
    }

    getColorsByNameOrThrow(colorName: string, index: number): ColorsType {
        const color: ColorsType | undefined = this.getColorsByName(
            colorName,
            index
        );
        if (color === undefined) {
            throw new Error(`bad colorName "${colorName}" or index "${index}"`);
        }
        return color;
    }

    getColorsByPlayerSlot(playerSlot: number): ColorsType | undefined {
        const slotColor: Color = world.getSlotColor(playerSlot);
        const slotHex: string = "#" + slotColor.toHex().substring(0, 6);
        return this.getColorsByTarget(slotHex);
    }

    getColorsByPlayerSlotOrThrow(playerSlot: number): ColorsType {
        const color: ColorsType | undefined =
            this.getColorsByPlayerSlot(playerSlot);
        if (color === undefined) {
            throw new Error(`bad playerSlot "${playerSlot}"`);
        }
        return color;
    }

    getColorsByTarget(target: string): ColorsType | undefined {
        const targetColor: Color | undefined = this.parseColor(target);
        if (!targetColor) {
            return undefined;
        }

        let best: ColorsType | undefined;
        let bestD: number = Number.MAX_SAFE_INTEGER;

        for (const colorsArray of Object.values(COLORS)) {
            for (const colorsType of colorsArray) {
                const color: Color | undefined = this.parseColor(
                    colorsType.target
                );
                if (color) {
                    const dr = targetColor.r - color.r;
                    const dg = targetColor.g - color.g;
                    const db = targetColor.b - color.b;
                    const d = dr * dr + dg * dg + db * db;
                    if (d < bestD) {
                        best = colorsType;
                        bestD = d;
                    }
                }
            }
        }
        return best;
    }

    getColorsByTargetOrThrow(target: string): ColorsType {
        const color: ColorsType | undefined = this.getColorsByTarget(target);
        if (color === undefined) {
            throw new Error(`bad target "${target}"`);
        }
        return color;
    }

    getColorsLength(colorName: string): number | undefined {
        const colorsArray: Array<ColorsType> | undefined = COLORS[colorName];
        return colorsArray?.length;
    }

    getColorsLengthOrThrow(colorName: string): number {
        const length: number | undefined = this.getColorsLength(colorName);
        if (length === undefined) {
            throw new Error(`bad colorName "${colorName}"`);
        }
        return length;
    }
}
