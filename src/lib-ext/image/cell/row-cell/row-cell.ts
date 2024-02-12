import { AbstractCell, CellChild } from "../abstract-cell/abstract-cell";

/**
 * Layout cells in a row.
 */
export class RowCell extends AbstractCell {
    constructor(children: Array<AbstractCell>, spacing: number = 0) {
        if (children.length === 0) {
            throw new Error("empty children");
        }
        let lastRight: number = 0;
        let maxHeight: number = 0;
        const childrenWithLayout: Array<CellChild> = children.map(
            (child, index) => {
                if (index > 0) {
                    lastRight += spacing;
                }
                const left: number = lastRight;
                const { width, height } = child.getSize();
                lastRight += width;
                maxHeight = Math.max(maxHeight, height);
                return { child, left, top: 0 };
            }
        );
        super(lastRight, maxHeight, childrenWithLayout);
    }

    public toBuffer(): Promise<Buffer> {
        return this._renderChildren();
    }
}
