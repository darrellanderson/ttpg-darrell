import { AbstractCell, CellSize } from "../abstract-cell/abstract-cell";
import { SolidCell } from "../solid-cell/solid-cell";

export class PaddedCell extends AbstractCell {
    private readonly _background: SolidCell;

    constructor(child: AbstractCell, padding: number) {
        let { width, height }: CellSize = child.getSize();
        width += 2 * padding;
        height += 2 * padding;

        const background: SolidCell = new SolidCell(width, height, "#ffffff");

        super(width, height, [
            { child: background, left: 0, top: 0 },
            { child, left: padding, top: padding },
        ]);
        this._background = background;
    }

    setColor(color: string): this {
        this._background.setColor(color);
        return this;
    }

    public toBuffer(): Promise<Buffer> {
        return super._renderChildren();
    }
}
