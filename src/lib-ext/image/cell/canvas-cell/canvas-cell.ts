import { AbstractCell, CellChild } from "../abstract-cell/abstract-cell";

export class CanvasCell extends AbstractCell {
    constructor(width: number, height: number, children: Array<CellChild>) {
        if (children.length === 0) {
            throw new Error("empty children");
        }
        super(width, height, children);
    }

    public toBuffer(): Promise<Buffer> {
        return this._renderChildren();
    }
}
