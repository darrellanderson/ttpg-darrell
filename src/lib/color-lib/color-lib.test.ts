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
    expect(objColor.toHex()).toBe("4D00A8FF");
});

it("colorToWidgetColor", () => {
    const colorLib: ColorLib = new ColorLib();
    const color: Color = colorLib.parseColorOrThrow("#a800d0");
    expect(color.toHex()).toBe("A800D0FF");

    const widgetColor: Color = colorLib.colorToWidgetColor(color);
    expect(widgetColor.toHex()).toBe("8701BBFF");
});

it("colorToWidgetColor2", () => {
    const colorLib: ColorLib = new ColorLib();
    const color: Color = colorLib.parseColorOrThrow("#2e2626");
    expect(color.toHex()).toBe("2E2626FF");

    const widgetColor: Color = colorLib.colorToWidgetColor(color);
    expect(widgetColor.toHex()).toBe("8701BBFF");
});

it("x", () => {
    const colorLib: ColorLib = new ColorLib();
    const color: Color = new Color(0, 0.749, 0);
    const objColor: Color = colorLib.colorToObjectColor(color);
    expect([objColor.r, objColor.g, objColor.b]).toEqual([0, 0.749, 0]);
    expect(objColor.toHex()).toBe("4D00A8FF");
});

it("x2", () => {
    const colorLib: ColorLib = new ColorLib();
    const color: Color = new Color(0, 0.149, 0.149);
    const objColor: Color = colorLib.colorToWidgetColor(color);
    expect([objColor.r, objColor.g, objColor.b]).toEqual([0, 0.749, 0]);
    expect(objColor.toHex()).toBe("4D00A8FF");
});
