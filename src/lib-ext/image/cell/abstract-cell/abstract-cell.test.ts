import { AbstractCell } from "./abstract-cell";

class MyCell extends AbstractCell {
    public toBuffer(): Promise<Buffer> {
        throw new Error("Method not implemented.");
    }
}

it("constructor/getSize", () => {
    const size: { width: number; height: number } = new MyCell(1, 2).getSize();
    expect(size).toEqual({ width: 1, height: 2 });
});
