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

    test("getColorsByName returns a color", () => {
        const color = colorLib.getColorsByName("red", 0);
        expect(color?.target).toEqual("#FF0505");
    });

    test("getColorsByNameOrThrow", () => {
        colorLib.getColorByNameOrThrow("red", 0);
        expect(() => colorLib.getColorByNameOrThrow("invalid", 0)).toThrow();
    });

    test("getColorsLength returns the length of the colors array", () => {
        const length = colorLib.getColorsLength("red");
        expect(length).toEqual(5);
    });

    test("getColorsLengthOrThrow ", () => {
        colorLib.getColorsLengthOrThrow("red");
        expect(() => colorLib.getColorsLengthOrThrow("invalid")).toThrow();
    });
});
