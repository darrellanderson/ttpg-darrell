import sharp from "sharp";
import { AbstractCell } from "../abstract-cell/abstract-cell";

export class RowCell extends AbstractCell {
    constructor(children: AbstractCell[], spacing: number = 0) {
        let lastRight: number = 0;
        let maxHeight: number = 0;
        const childrenWithLayout: Array<{
            child: AbstractCell;
            left: number;
            top: number;
        }> = children.map((child) => {
            const left: number = lastRight;
            const { width, height } = child.getSize();
            lastRight += width + spacing;
            maxHeight = Math.max(maxHeight, height);
            return { child, left, top: 0 };
        });
        super(lastRight, maxHeight, childrenWithLayout);
    }

    public toBuffer(): Promise<Buffer> {
        const { width, height }: { width: number; height: number } =
            this.getSize();
        return sharp({
            create: {
                width,
                height,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 1 },
            },
        }).toBuffer();
    }
}
