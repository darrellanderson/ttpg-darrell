import sharp from "sharp";

export type CellSize = {
    width: number;
    height: number;
};

export type CellPosition = {
    left: number;
    top: number;
};

export type CellChild = { child: AbstractCell; left: number; top: number };

export abstract class AbstractCell {
    private readonly _width: number;
    private readonly _height: number;
    private readonly _children: AbstractCell[] | undefined;
    private _parent: AbstractCell | undefined;
    private _localPosition = { left: 0, top: 0 };

    /**
     * Constructor.
     *
     * Require children at constructor time, getSize does not change
     * so we can do layout now.
     *
     * @param children
     */
    constructor(width: number, height: number, children?: Array<CellChild>) {
        if (width < 0 || height < 0) {
            throw new Error("negative size");
        }
        this._width = width;
        this._height = height;
        if (children) {
            this._children = [];
            for (const { child, left, top } of children) {
                if (child._parent) {
                    throw new Error("child already added elsewhere");
                }
                child._parent = this;
                this._children.push(child);
                child._localPosition = { left, top };
            }
        }
    }

    public getCenterUV(): { u: number; v: number } {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let root: AbstractCell = this;
        while (root._parent) {
            root = root._parent;
        }
        const rootSize: { width: number; height: number } = root.getSize();

        const thisPos: { left: number; top: number } = this.getGlobalPosition();
        const thisSize: { width: number; height: number } = this.getSize();
        const thisCenterPos: { left: number; top: number } = {
            left: thisPos.left + thisSize.width / 2,
            top: thisPos.top + thisSize.height / 2,
        };
        return {
            u: thisCenterPos.left / rootSize.width,
            v: thisCenterPos.top / rootSize.height,
        };
    }

    public getChildren(): Array<AbstractCell> {
        return this._children ? [...this._children] : [];
    }

    public getLocalPosition(): CellPosition {
        return { left: this._localPosition.left, top: this._localPosition.top };
    }

    public getGlobalPosition(): CellPosition {
        let left: number = this._localPosition.left;
        let top: number = this._localPosition.top;
        if (this._parent) {
            const parentGlobalPosition = this._parent.getGlobalPosition();
            left += parentGlobalPosition.left;
            top += parentGlobalPosition.top;
        }
        return { left, top };
    }

    public getSize(): CellSize {
        return { width: this._width, height: this._height };
    }

    public abstract toBuffer(): Promise<Buffer>;

    /**
     * For cell group styles, render children in order.
     *
     * @returns
     */
    protected _renderChildren(): Promise<Buffer> {
        const { width, height }: CellSize = this.getSize();

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
                resolve(image.png().toBuffer());
            });
        });
    }
}
