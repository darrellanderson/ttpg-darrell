import path from "path";
import { ImageCell } from "./image-cell";
import sharp from "sharp";

const FILE: string = path.join(__dirname, "test.jpg");
const WIDTH: number = 54;
const HEIGHT: number = 64;

it("constructor, getSize", () => {
    const cellSize = new ImageCell(FILE, WIDTH, HEIGHT).getCellSize();
    expect(cellSize).toEqual({ w: WIDTH, h: HEIGHT });
});

it("constructor (missing image)", () => {
    expect(() => {
        new ImageCell("no-such-file.jpg", 1, 1);
    }).toThrow('no file "no-such-file.jpg"');
});

it("toBuffer", async () => {
    const promise: Promise<Buffer> = new ImageCell(
        FILE,
        WIDTH,
        HEIGHT
    ).toBuffer();
    const buffer: Buffer = await promise;
    expect(buffer).toBeInstanceOf(Buffer);
});

it("toBuffer (size mismatch)", async () => {
    const promise: Promise<Buffer> = new ImageCell(FILE, 1, 2).toBuffer();
    let error: string | undefined;
    const buffer: Buffer | void = await promise.catch((e) => {
        error = e;
    });
    expect(buffer).not.toBeInstanceOf(Buffer);
    expect(error).toEqual("size mimatch (observed 54x64, expected 1x2)");
});

it("static from", async () => {
    const imageCell: ImageCell = await ImageCell.from(FILE);
    const cellSize = imageCell.getCellSize();
    expect(cellSize).toEqual({ w: WIDTH, h: HEIGHT });
});

it("verify size", async () => {
    const buffer = await new ImageCell(FILE, WIDTH, HEIGHT).toBuffer();
    const metadata = await sharp(buffer).metadata();
    expect(metadata.width).toEqual(WIDTH);
    expect(metadata.height).toEqual(HEIGHT);
});
