import { AbstractCell } from "../abstract-cell/abstract-cell";

export class RowCell extends AbstractCell {
    constructor(children: Array<AbstractCell>, spacing: number = 0) {
        let lastRight: number = 0;
        let maxHeight: number = 0;
        const childrenWithLayout: Array<{
            child: AbstractCell;
            left: number;
            top: number;
        }> = children.map((child, index) => {
            if (index > 0) {
                lastRight += spacing;
            }
            const left: number = lastRight;
            const { width, height } = child.getSize();
            lastRight += width;
            maxHeight = Math.max(maxHeight, height);
            return { child, left, top: 0 };
        });
        super(lastRight, maxHeight, childrenWithLayout);
    }

    public toBuffer(): Promise<Buffer> {
        return this._renderChildren();
    }
}
