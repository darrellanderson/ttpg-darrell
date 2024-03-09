import sharp from "sharp";
import { SolidCell } from "../solid-cell/solid-cell";
import { PaddedCell } from "./padded-cell";

it("constructor, size", () => {
    const innerCell = new SolidCell(10, 15, "#000000");
    const paddedCell = new PaddedCell(innerCell, 5);
    const size = paddedCell.getSize();
    expect(size).toEqual({ width: 20, height: 25 });
});

it("background color", async () => {
    const innerCell = new SolidCell(1, 1, "#000000");
    const paddedCell = new PaddedCell(innerCell, 1).setColor("#ff0000");
    const buffer = await paddedCell.toBuffer();

    // Extract raw RGBA pixel values.
    const pixelBuffer: Buffer = await sharp(buffer).raw().toBuffer();
    const pixelArray = new Uint8ClampedArray(pixelBuffer);
    expect(pixelArray.length).toEqual(36); // 3x3 pixels, 4 bytes per pixel

    // data is a Buffer of length (width * height * channels)
    // containing 8-bit RGB(A) pixel data.
    const r: number | undefined = pixelArray.at(0);
    const g: number | undefined = pixelArray.at(1);
    const b: number | undefined = pixelArray.at(2);
    const a: number | undefined = pixelArray.at(3);
    expect(r).toBeCloseTo(255);
    expect(g).toBeCloseTo(0);
    expect(b).toBeCloseTo(0);
    expect(a).toBeCloseTo(255);
});
