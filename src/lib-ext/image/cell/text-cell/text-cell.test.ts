import sharp from "sharp";
import { TextCell } from "./text-cell";

const TEXT: string = "hello";
const WIDTH: number = 100;
const HEIGHT: number = 20;

it("constructor, getSize", () => {
    const cellSize: { width: number; height: number } = new TextCell(
        WIDTH,
        HEIGHT,
        TEXT
    ).getSize();
    expect(cellSize).toEqual({ width: WIDTH, height: HEIGHT });
});

it("toBuffer", async () => {
    const promise: Promise<Buffer> = new TextCell(
        WIDTH,
        HEIGHT,
        TEXT
    ).toBuffer();
    const buffer: Buffer = await promise;
    expect(buffer).toBeDefined();
});

it("verify size", async () => {
    const promise: Promise<Buffer> = new TextCell(
        WIDTH,
        HEIGHT,
        TEXT
    ).toBuffer();
    const buffer: Buffer = await promise;
    const metadata = await sharp(buffer).metadata();
    expect(metadata.width).toEqual(WIDTH);
    expect(metadata.height).toEqual(HEIGHT);
});

it("setters", () => {
    new TextCell(WIDTH, HEIGHT, TEXT)
        .setTextColor("black")
        .setFont("my-font")
        .setFontSize(19)
        .setFontStyle("my-style");
});
