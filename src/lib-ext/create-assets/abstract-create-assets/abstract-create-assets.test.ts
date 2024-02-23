import { SolidCell } from "../../image/cell/solid-cell/solid-cell";
import { AbstractCreateAssets } from "./abstract-create-assets";

class MyAbstractCreateAssets extends AbstractCreateAssets {
    toFileData(): Promise<{ [key: string]: Buffer }> {
        return new Promise<{ [key: string]: Buffer }>((resolve) => {
            resolve({
                a: Buffer.from("a-data"),
                b: Buffer.from("b-data"),
            });
        });
    }
}

it("static encodeOutputBuffer", async () => {
    const filename = "test.jpg";
    let buffer: Buffer = await new SolidCell(1, 1, "#ff0000").toBuffer();
    buffer = await AbstractCreateAssets.encodeOutputBuffer(filename, buffer);
    expect(buffer).toBeDefined();
});

it("static encodeOutputBuffer (png)", async () => {
    const filename = "test.png";
    let buffer: Buffer = await new SolidCell(1, 1, "#ff0000").toBuffer();
    buffer = await AbstractCreateAssets.encodeOutputBuffer(filename, buffer);
    expect(buffer).toBeDefined();
});

it("jpg", async () => {
    const png: Buffer = await new SolidCell(1, 1, "#ff0000").toBuffer();
    expect(png.at(0)).toEqual(0x89);
    expect(png.at(1)).toEqual(0x50);
    expect(png.at(2)).toEqual(0x4e);
    expect(png.at(3)).toEqual(0x47);
    expect(png.at(4)).toEqual(0x0d);
    expect(png.at(5)).toEqual(0x0a);
    expect(png.at(6)).toEqual(0x1a);
    expect(png.at(7)).toEqual(0x0a);

    const jpg: Buffer = await MyAbstractCreateAssets.encodeOutputBuffer(
        "file.jpg",
        png
    );
    expect(jpg.at(0)).toEqual(255);
    expect(jpg.at(1)).toEqual(216);
    expect(jpg.at(2)).toEqual(255);
});
