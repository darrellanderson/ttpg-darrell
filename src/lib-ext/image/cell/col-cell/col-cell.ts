import { AbstractCell, CellChild } from "../abstract-cell/abstract-cell";

/**
 * Layout cells in a column.
 */
export class ColCell extends AbstractCell {
    constructor(children: Array<AbstractCell>, spacing: number = 0) {
        if (children.length === 0) {
            throw new Error("empty children");
        }
        let lastTop: number = 0;
        let maxWidth: number = 0;
        const childrenWithLayout: Array<CellChild> = children.map(
            (child, index) => {
                if (index > 0) {
                    lastTop += spacing;
                }
                const top: number = lastTop;
                const { width, height } = child.getSize();
                lastTop += height;
                maxWidth = Math.max(maxWidth, width);
                return { child, left: 0, top };
            }
        );
        super(maxWidth, lastTop, childrenWithLayout);
    }

    public toBuffer(): Promise<Buffer> {
        return this._renderChildren();
    }
}
