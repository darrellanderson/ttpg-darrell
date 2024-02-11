import sharp from "sharp";
import { AbstractCell } from "../abstract-cell/abstract-cell";

export class RowCell extends AbstractCell {
    constructor(children: Array<AbstractCell>, spacing: number = 0) {
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

        const image = sharp({
            create: {
                width,
                height,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 },
            },
        });

        const children: Array<AbstractCell> = this.getChildren();
        const promises: Array<Promise<Buffer>> = children.map((child) =>
            child.toBuffer()
        );
        return new Promise<Buffer>((resolve) => {
            Promise.all(promises).then((buffers: Array<Buffer>) => {
                const composite: Array<{
                    input: Buffer;
                    left: number;
                    top: number;
                }> = [];
                buffers.map((buffer, index) => {
                    const child: AbstractCell | undefined = children[index];
                    if (child) {
                        const { left, top } = child.getLocalPosition();
                        composite.push({ input: buffer, left, top });
                    }
                });
                image.composite(composite);
                resolve(image.toBuffer());
            });
        });
    }
}
