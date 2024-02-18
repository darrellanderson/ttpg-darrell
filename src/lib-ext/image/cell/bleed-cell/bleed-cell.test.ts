import sharp from "sharp";
import { AbstractCell } from "../abstract-cell/abstract-cell";
import { BleedCell } from "./bleed-cell";

class MyCell extends AbstractCell {
    public toBuffer(): Promise<Buffer> {
        return this._renderChildren();
    }
}

it("constructor", () => {
    const innerCell = new MyCell(1, 2);
    const bleedCell = new BleedCell(innerCell, 3, 4);
    expect(bleedCell.getSize()).toEqual({ width: 7, height: 10 });
});

it("constructor (invalid)", () => {
    const innerCell = new MyCell(1, 2);
    expect(() => {
        new BleedCell(innerCell, -1, 0);
    }).toThrow();
});

it("toBuffer", async () => {
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

    class SquareCell extends AbstractCell {
        constructor() {
            super(2, 2);
        }
        public toBuffer(): Promise<Buffer> {
            return new Promise<Buffer>((resolve): void => {
                resolve(squareBuffer);
            });
        }
    }
    const squareCell = new SquareCell();
    expect(squareCell.getSize()).toEqual({ width: 2, height: 2 });

    const bleedCell = new BleedCell(squareCell, 3, 3);
    expect(bleedCell.getSize()).toEqual({ width: 8, height: 8 });
    const bleedBuffer: Buffer = await bleedCell.toBuffer();

    pixelArray = new Uint8ClampedArray(
        await sharp(bleedBuffer).raw().toBuffer()
    );
    expect(pixelArray.length).toEqual(8 * 8 * 4);

    // Extract every fourth value (and check each pixel is same r=g=b)
    const values: Array<number> = [];
    for (let i = 0; i < pixelArray.length; i += 4) {
        const value: number | undefined = pixelArray.at(i);
        if (value !== undefined) {
            values.push(value);
        }
        expect(value).toBeDefined();
        expect(pixelArray.at(i + 1)).toEqual(value);
        expect(pixelArray.at(i + 2)).toEqual(value);
        expect(pixelArray.at(i + 3)).toEqual(255);
    }

    const rows: Array<string> = [];
    for (let i = 0; i < values.length; i += 8) {
        rows.push(values.slice(i, i + 8).join(""));
    }

    expect(rows).toEqual([
        "00013000",
        "00013000",
        "00013000",
        "11113333",
        "66669999",
        "00069000",
        "00069000",
        "00069000",
    ]);
});
