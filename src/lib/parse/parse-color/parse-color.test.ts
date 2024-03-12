import { Color } from "@tabletop-playground/api";
import { ParseColor } from "./parse-color";

describe("ParseColor", () => {
    let parseColor: ParseColor;

    beforeEach(() => {
        parseColor = new ParseColor();
    });

    test("parseColor parses a color", () => {
        const color = parseColor.parseColor("#ff0000");
        expect(color).toEqual(new Color(1, 0, 0, 1));
    });

    test("parseColor parses a color (3)", () => {
        const color = parseColor.parseColor("#f00");
        expect(color).toEqual(new Color(1, 0, 0, 1));
    });

    test("parseColor parses a color (3)", () => {
        const color = parseColor.parseColor("#ff000000");
        expect(color).toEqual(new Color(1, 0, 0, 0));
    });

    test("parseColor returns undefined when the input is invalid", () => {
        expect(parseColor.parseColor("invalid")).toBeUndefined();
    });

    test("parseColor returns undefined when the input does not match the regex", () => {
        expect(parseColor.parseColor("#gggggg")).toBeUndefined();
    });

    test("parseColorOrThrow parses a color", () => {
        const color = parseColor.parseColorOrThrow("#ff0000");
        expect(color).toEqual(new Color(1, 0, 0, 1));
    });

    test("parseColorOrThrow throws an error when the input is invalid", () => {
        expect(() => parseColor.parseColorOrThrow("invalid")).toThrowError();
    });

    test("parseColorOrThrow throws an error when the input does not match the regex", () => {
        expect(() => parseColor.parseColorOrThrow("#gggggg")).toThrowError();
    });
});
