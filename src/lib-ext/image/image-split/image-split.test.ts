import sharp from "sharp";
import { ImageSplit, ImageSplitChunk } from "./image-split";

it("constructor", () => {
    new ImageSplit(Buffer.from(""), 1);
});

it("split", async () => {
    let pixelArray: Uint8ClampedArray;

    // Create a 1x1 image with rgb same-values.
    const px = (c: number): Promise<Buffer> => {
        return sharp({
            create: {
                width: 1,
                height: 1,
                channels: 4,
                background: { r: c, g: c, b: c, alpha: 255 },
            },
        })
            .png()
            .toBuffer();
    };
    const testPx: Buffer = await px(1);
    pixelArray = new Uint8ClampedArray(await sharp(testPx).raw().toBuffer());
    expect(pixelArray.length).toEqual(4);
    expect(pixelArray.at(0)).toEqual(1);
    expect(pixelArray.at(1)).toEqual(1);
    expect(pixelArray.at(2)).toEqual(1);
    expect(pixelArray.at(3)).toEqual(255);

    // Create a 2x2 image with [1,3],6,9] rgb values.
    const squareBuffer: Buffer = await sharp({
        create: {
            width: 2,
            height: 2,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 255 },
        },
    })
        .composite([
            {
                left: 0,
                top: 0,
                input: await px(1),
            },
            {
                left: 1,
                top: 0,
                input: await px(3),
            },
            {
                left: 0,
                top: 1,
                input: await px(6),
            },
            {
                left: 1,
                top: 1,
                input: await px(9),
            },
        ])
        .png()
        .toBuffer();
    pixelArray = new Uint8ClampedArray(
        await sharp(squareBuffer).raw().toBuffer()
    );
    expect(pixelArray.length).toEqual(16);
    expect(pixelArray.at(0)).toEqual(1);
    expect(pixelArray.at(4)).toEqual(3);
    expect(pixelArray.at(8)).toEqual(6);
    expect(pixelArray.at(12)).toEqual(9);

    const splitChunks: Array<ImageSplitChunk> = await new ImageSplit(
        squareBuffer,
        1
    ).split();
    expect(splitChunks.length).toEqual(4);

    const nextChunk = (): ImageSplitChunk => {
        const chunk: ImageSplitChunk | undefined = splitChunks.shift();
        if (!chunk) {
            throw new Error("empty");
        }
        return chunk;
    };
    let chunk: ImageSplitChunk;

    // top-left
    chunk = nextChunk();
    expect(chunk.col).toEqual(0);
    expect(chunk.row).toEqual(0);
    expect(chunk.px).toEqual({
        left: 0,
        top: 0,
        right: 1,
        bottom: 1,
    });
    expect(chunk.uv).toEqual({
        left: 0,
        top: 0,
        right: 0.5,
        bottom: 0.5,
    });
    pixelArray = new Uint8ClampedArray(
        await sharp(chunk.buffer).raw().toBuffer()
    );
    expect(pixelArray.at(0)).toEqual(1);

    // bottom-left
    chunk = nextChunk();
    expect(chunk.col).toEqual(0);
    expect(chunk.row).toEqual(1);
    expect(chunk.px).toEqual({
        left: 0,
        top: 1,
        right: 1,
        bottom: 2,
    });
    expect(chunk.uv).toEqual({
        left: 0,
        top: 0.5,
        right: 0.5,
        bottom: 1,
    });
    pixelArray = new Uint8ClampedArray(
        await sharp(chunk.buffer).raw().toBuffer()
    );
    expect(pixelArray.at(0)).toEqual(6);

    // top-right
    chunk = nextChunk();
    expect(chunk.col).toEqual(1);
    expect(chunk.row).toEqual(0);
    expect(chunk.px).toEqual({
        left: 1,
        top: 0,
        right: 2,
        bottom: 1,
    });
    expect(chunk.uv).toEqual({
        left: 0.5,
        top: 0,
        right: 1,
        bottom: 0.5,
    });
    pixelArray = new Uint8ClampedArray(
        await sharp(chunk.buffer).raw().toBuffer()
    );
    expect(pixelArray.at(0)).toEqual(3);

    // bottom-right
    chunk = nextChunk();
    expect(chunk.col).toEqual(1);
    expect(chunk.row).toEqual(1);
    expect(chunk.px).toEqual({
        left: 1,
        top: 1,
        right: 2,
        bottom: 2,
    });
    expect(chunk.uv).toEqual({
        left: 0.5,
        top: 0.5,
        right: 1,
        bottom: 1,
    });
    pixelArray = new Uint8ClampedArray(
        await sharp(chunk.buffer).raw().toBuffer()
    );
    expect(pixelArray.at(0)).toEqual(9);
});
