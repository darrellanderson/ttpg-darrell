import { SolidCell } from "./solid-cell";

it("constructor", () => {
    new SolidCell(1, 1, "#ff0000");
});

it("constructor (invalid color)", () => {
    expect(() => {
        new SolidCell(1, 1, "bad");
    }).toThrow();
});

it("verify color", async () => {
    const buffer: Buffer = await new SolidCell(1, 1, "#010305").toBuffer();
    expect(buffer).toBeDefined();

    // data is a Buffer of length (width * height * channels)
    // containing 8-bit RGB(A) pixel data.
    const r: number = buffer.readUint8(0);
    const g: number = buffer.readUint8(1);
    const b: number = buffer.readUint8(2);
    const a: number = buffer.readUint8(3);
    expect(r).toBeCloseTo(1);
    expect(g).toBeCloseTo(3);
    expect(b).toBeCloseTo(5);
    expect(a).toBeCloseTo(255);
});
