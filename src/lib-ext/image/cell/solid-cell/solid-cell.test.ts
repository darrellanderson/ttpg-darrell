import sharp from "sharp";
import { SolidCell } from "./solid-cell";

it("constructor", () => {
    new SolidCell(1, 1, "#ff0000");
});

it("constructor (invalid color)", () => {
    expect(() => {
        new SolidCell(1, 1, "bad");
    }).toThrow();
});

it("verify color", async () => {
    const buffer: Buffer = await new SolidCell(1, 1, "#010305").toBuffer();
    expect(buffer).toBeDefined();

    // Extract raw RGBA pixel values.
    const pixelBuffer: Buffer = await sharp(buffer).raw().toBuffer();
    const pixelArray = new Uint8ClampedArray(pixelBuffer);
    expect(pixelArray.length).toEqual(4);

    // data is a Buffer of length (width * height * channels)
    // containing 8-bit RGB(A) pixel data.
    const r: number | undefined = pixelArray.at(0);
    const g: number | undefined = pixelArray.at(1);
    const b: number | undefined = pixelArray.at(2);
    const a: number | undefined = pixelArray.at(3);
    expect(r).toBeCloseTo(1);
    expect(g).toBeCloseTo(3);
    expect(b).toBeCloseTo(5);
    expect(a).toBeCloseTo(255);
});
