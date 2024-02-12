import { AbstractCell } from "../abstract-cell/abstract-cell";
import { CanvasCell } from "./canvas-cell";

class MyCell extends AbstractCell {
    public toBuffer(): Promise<Buffer> {
        return new Promise<Buffer>(() => {
            return Buffer.from("");
        });
    }
}

it("constructor", () => {
    new CanvasCell(1, 1, [{ child: new MyCell(1, 1), left: 0, top: 0 }]);
});

it("constructor (empty)", () => {
    expect(() => {
        new CanvasCell(1, 1, []);
    }).toThrow();
});

it("toBuffer", () => {
    new CanvasCell(1, 1, [
        { child: new MyCell(1, 1), left: 0, top: 0 },
    ]).toBuffer();
});
