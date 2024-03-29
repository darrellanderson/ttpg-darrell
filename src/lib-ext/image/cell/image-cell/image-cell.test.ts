import path from "path";
import sharp from "sharp";
import { ImageCell } from "./image-cell";

const FILE: string = path.join(__dirname, "test.jpg");
const WIDTH: number = 54;
const HEIGHT: number = 64;

it("constructor, getSize", () => {
    const cellSize: { width: number; height: number } = new ImageCell(
        WIDTH,
        HEIGHT,
        FILE
    ).getSize();
    expect(cellSize).toEqual({ width: WIDTH, height: HEIGHT });
});

it("toBuffer", async () => {
    const promise: Promise<Buffer> = new ImageCell(
        WIDTH,
        HEIGHT,
        FILE
    ).toBuffer();
    const buffer: Buffer = await promise;
    expect(buffer).toBeInstanceOf(Buffer);
});

it("toBuffer (size mismatch)", async () => {
    const buffer = await new ImageCell(1, 2, FILE).toBuffer();
    const metadata = await sharp(buffer).metadata();
    expect(metadata.width).toEqual(1); // resized
    expect(metadata.height).toEqual(2);
});

it("static from", async () => {
    const imageCell: ImageCell = await ImageCell.from(FILE);
    const cellSize: { width: number; height: number } = imageCell.getSize();
    expect(cellSize).toEqual({ width: WIDTH, height: HEIGHT });
});

it("verify size", async () => {
    const buffer = await new ImageCell(WIDTH, HEIGHT, FILE).toBuffer();
    const metadata = await sharp(buffer).metadata();
    expect(metadata.width).toEqual(WIDTH);
    expect(metadata.height).toEqual(HEIGHT);
});

it("setters", () => {
    new ImageCell(WIDTH, HEIGHT, FILE)
        .setAlpha(0.5)
        .setGrayscale(true)
        .setTint("#ff0000");
});

it("invalid alpha", () => {
    const imageCell = new ImageCell(WIDTH, HEIGHT, FILE);
    expect(() => {
        imageCell.setAlpha(-1);
    }).toThrow();
    expect(() => {
        imageCell.setAlpha(2);
    }).toThrow();
});

it("invalid tint", () => {
    const imageCell = new ImageCell(WIDTH, HEIGHT, FILE);
    expect(() => {
        imageCell.setTint("ff0000"); // missing #
    }).toThrow();
});

it("toBuffer (alpha, grayscale, tint)", async () => {
    const promise: Promise<Buffer> = new ImageCell(WIDTH, HEIGHT, FILE)
        .setAlpha(0.9)
        .setGrayscale(true)
        .setTint("#ff0000")
        .toBuffer();
    await promise;
});
