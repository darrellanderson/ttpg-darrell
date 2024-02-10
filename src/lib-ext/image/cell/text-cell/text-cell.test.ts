import sharp from "sharp";
import { TextCell } from "./text-cell";

const TEXT: string = "hello";
const WIDTH: number = 100;
const HEIGHT: number = 20;

it("constructor, getSize", () => {
    const cellSize = new TextCell(TEXT, WIDTH, HEIGHT).getCellSize();
    expect(cellSize).toEqual({ w: WIDTH, h: HEIGHT });
});

it("toBuffer", async () => {
    const promise: Promise<Buffer> = new TextCell(
        TEXT,
        WIDTH,
        HEIGHT
    ).toBuffer();
    const buffer: Buffer = await promise;
    expect(buffer).toBeDefined();
});

it("verify size", async () => {
    const promise: Promise<Buffer> = new TextCell(
        TEXT,
        WIDTH,
        HEIGHT
    ).toBuffer();
    const buffer: Buffer = await promise;
    const metadata = await sharp(buffer).metadata();
    expect(metadata.width).toEqual(WIDTH);
    expect(metadata.height).toEqual(HEIGHT);
});

it("setters", () => {
    new TextCell(TEXT, WIDTH, HEIGHT)
        .setFont("my-font")
        .setFontSize(19)
        .setFontStyle("my-style");
});
