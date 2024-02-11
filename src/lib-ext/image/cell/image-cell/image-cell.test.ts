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

it("constructor (missing image)", () => {
    expect(() => {
        new ImageCell(1, 1, "no-such-file.jpg");
    }).toThrow('no file "no-such-file.jpg"');
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
    const promise: Promise<Buffer> = new ImageCell(1, 2, FILE).toBuffer();
    let error: string | undefined;
    const buffer: Buffer | void = await promise.catch((e) => {
        error = e;
    });
    expect(buffer).not.toBeInstanceOf(Buffer);
    expect(error).toEqual("size mimatch (observed 54x64, expected 1x2)");
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
