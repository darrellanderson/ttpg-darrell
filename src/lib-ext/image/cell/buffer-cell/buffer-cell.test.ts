import { BufferCell } from "./buffer-cell";

it("constructor", () => {
    new BufferCell(1, 1, Buffer.from(""));
});

it("toBuffer", async () => {
    const buffer: Buffer = Buffer.from("");
    const out: Buffer = await new BufferCell(1, 1, buffer).toBuffer();
    expect(out).toBe(buffer);
});
