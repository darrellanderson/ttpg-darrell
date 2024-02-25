import { AbstractCell } from "../abstract-cell/abstract-cell";
import { ResizeCell } from "./resize-cell";
import { SolidCell } from "../solid-cell/solid-cell";
import sharp from "sharp";

it("constructor", () => {
    const cell: AbstractCell = new SolidCell(10, 20, "#ff0000");
    new ResizeCell(1, 2, cell);
});

it("toBuffer", async () => {
    const cell: AbstractCell = new SolidCell(10, 20, "#ff0000");
    const buffer: Buffer = await new ResizeCell(1, 2, cell).toBuffer();
    expect(buffer).toBeDefined();

    const metadata = await sharp(buffer).metadata();
    expect(metadata.width).toEqual(1);
    expect(metadata.height).toEqual(2);
});

it("snap points", () => {
    const cell: AbstractCell = new SolidCell(10, 20, "#ff0000").addSnapPoint({
        left: 5,
        top: 10,
    });
    const snapPoints = new ResizeCell(1, 2, cell).getSnapPoints();
    expect(snapPoints).toEqual([{ left: 0.5, rotation: 0, tags: [], top: 1 }]);
});
