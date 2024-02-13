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
    const bleedCell = new BleedCell(innerCell, 3);
    expect(bleedCell.getSize()).toEqual({ width: 7, height: 8 });
});

it("toBuffer", async () => {
    // Create a 2x2 image with [1,2],[3,4] rgb values.
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
                input: await px(2),
            },
            {
                left: 0,
                top: 1,
                input: await px(3),
            },
            {
                left: 1,
                top: 1,
                input: await px(4),
            },
        ])
        .png()
        .toBuffer();
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

    const bleedCell = new BleedCell(squareCell, 1);
    //expect(bleedCell.getSize()).toEqual({ width: 6, height: 6 });
    const bleedBuffer: Buffer = await bleedCell.toBuffer();

    const pixelBuffer: Buffer = await sharp(bleedBuffer).raw().toBuffer();
    const pixelArray = new Uint8ClampedArray(pixelBuffer);
    //expect(pixelArray.length).toEqual(144);

    // Extract every fourth value (and check each pixel is same r=g=b)
    const values: Array<number> = [];
    for (let i = 0; i < pixelArray.length; i += 4) {
        const value: number | undefined = pixelArray.at(i);
        if (value) {
            values.push(value);
        }
        expect(value).toBeDefined();
        expect(pixelArray.at(i + 1)).toEqual(value);
        expect(pixelArray.at(i + 2)).toEqual(value);
        expect(pixelArray.at(i + 3)).toEqual(255);
    }
    console.log(values.slice(0, 6));

    expect(values.slice(0, 6)).toEqual([0, 0, 1, 2, 0, 0]);

    expect(values).toEqual([
        ...[0, 0, 1, 2, 0, 0],
        ...[0, 0, 1, 2, 0, 0],
        ...[1, 1, 1, 2, 2, 2],
        ...[3, 3, 3, 4, 4, 4],
        ...[0, 0, 3, 4, 0, 0],
        ...[0, 0, 3, 4, 0, 0],
    ]);
});
