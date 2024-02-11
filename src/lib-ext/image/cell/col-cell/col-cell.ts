import { AbstractCell } from "../abstract-cell/abstract-cell";

export class ColCell extends AbstractCell {
    constructor(children: Array<AbstractCell>, spacing: number = 0) {
        let lastTop: number = 0;
        let maxWidth: number = 0;
        const childrenWithLayout: Array<{
            child: AbstractCell;
            left: number;
            top: number;
        }> = children.map((child) => {
            const top: number = lastTop;
            const { width, height } = child.getSize();
            lastTop += height + spacing;
            maxWidth = Math.max(maxWidth, width);
            return { child, left: 0, top };
        });
        super(maxWidth, lastTop, childrenWithLayout);
    }

    public toBuffer(): Promise<Buffer> {
        return this._renderChildren();
    }
}
