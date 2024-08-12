import { Color } from "@tabletop-playground/api";
import { ColorLib } from "./color-lib";

describe("parseColor", () => {
    let colorLib: ColorLib;

    beforeEach(() => {
        colorLib = new ColorLib();
    });

    test("parseColor parses a color", () => {
        const color = colorLib.parseColor("#ff0000");
        expect(color).toEqual(new Color(1, 0, 0, 1));
    });

    test("parseColor parses a color (3)", () => {
        const color = colorLib.parseColor("#f00");
        expect(color).toEqual(new Color(1, 0, 0, 1));
    });

    test("parseColor parses a color (3)", () => {
        const color = colorLib.parseColor("#ff000000");
        expect(color).toEqual(new Color(1, 0, 0, 0));
    });

    test("parseColor returns undefined when the input is invalid", () => {
        expect(colorLib.parseColor("invalid")).toBeUndefined();
    });

    test("parseColor returns undefined when the input does not match the regex", () => {
        expect(colorLib.parseColor("#gggggg")).toBeUndefined();
    });

    test("parseColorOrThrow parses a color", () => {
        const color = colorLib.parseColorOrThrow("#ff0000");
        expect(color).toEqual(new Color(1, 0, 0, 1));
    });

    test("parseColorOrThrow throws an error when the input is invalid", () => {
        expect(() => colorLib.parseColorOrThrow("invalid")).toThrowError();
    });

    test("parseColorOrThrow throws an error when the input does not match the regex", () => {
        expect(() => colorLib.parseColorOrThrow("#gggggg")).toThrowError();
    });
});

it("colorToObjectColor", () => {
    const colorLib: ColorLib = new ColorLib();
    const color: Color = colorLib.parseColorOrThrow("#a800d0");
    expect(color.toHex()).toBe("A800D0FF");

    const objColor: Color = colorLib.colorToObjectColor(color);
    expect(objColor.toHex()).toBe("8101B0FF");
});

it("colorToObjectColor", () => {
    const colorLib: ColorLib = new ColorLib();
    const color: Color = colorLib.parseColorOrThrow("#a800d0");
    expect(color.toHex()).toBe("A800D0FF");

    const widgetColor: Color = colorLib.colorToWidgetColor(color);
    expect(widgetColor.toHex()).toBe("6600ACFF");
});
