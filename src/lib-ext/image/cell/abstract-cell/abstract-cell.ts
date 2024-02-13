import sharp from "sharp";

export type CellSize = {
    width: number;
    height: number;
};

export type CellPosition = {
    left: number;
    top: number;
};

export type UVPosition = {
    u: number;
    v: number;
};

export type CellChild = { child: AbstractCell; left: number; top: number };

/**
 * Create images from one or more cells.
 *
 * Fix size in the constructor, do not resize cells afterward!
 *
 * Cells may not be shared, they can have one one parent.
 */
export abstract class AbstractCell {
    private readonly _width: number;
    private readonly _height: number;
    private readonly _children: AbstractCell[] | undefined;
    private _parent: AbstractCell | undefined;
    private _localPosition = { left: 0, top: 0 };

    /**
     * Calculate the max width and height of cells.
     *
     * @param cells
     * @returns
     */
    static getMaxSize(cells: Array<AbstractCell>): CellSize {
        const maxSize: CellSize = { width: 0, height: 0 };
        for (const cell of cells) {
            const size: { width: number; height: number } = cell.getSize();
            maxSize.width = Math.max(maxSize.width, size.width);
            maxSize.height = Math.max(maxSize.height, size.height);
        }
        return maxSize;
    }
    /**
     * Constructor.
     *
     * Require children at constructor time, getSize does not change
     * so we can do layout now.
     *
     * @param children
     */
    constructor(width: number, height: number, children?: Array<CellChild>) {
        if (width <= 0 || height <= 0) {
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

    /**
     * Get the UV [0:1] coordinates of the center of this cell
     * with respect to the root cell size.
     *
     * @returns
     */
    public getCenterUV(): UVPosition {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let root: AbstractCell = this;
        while (root._parent) {
            root = root._parent;
        }
        const rootSize: CellSize = root.getSize();

        const thisPos: CellPosition = this.getGlobalPosition();
        const thisSize: CellSize = this.getSize();
        const thisCenterPos: CellPosition = {
            left: thisPos.left + thisSize.width / 2,
            top: thisPos.top + thisSize.height / 2,
        };
        return {
            u: thisCenterPos.left / rootSize.width,
            v: thisCenterPos.top / rootSize.height,
        };
    }

    /**
     * Get children.
     *
     * @returns
     */
    public getChildren(): Array<AbstractCell> {
        return this._children ? [...this._children] : [];
    }

    /**
     * Get position relative to the direct parent cell.
     *
     * @returns
     */
    public getLocalPosition(): CellPosition {
        return { left: this._localPosition.left, top: this._localPosition.top };
    }

    /**
     * Get position relative to the root cell, potentially several
     * cells outward.
     *
     * @returns
     */
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

    /**
     * Get (immutable) cell size.
     *
     * @returns
     */
    public getSize(): CellSize {
        return { width: this._width, height: this._height };
    }

    /**
     * Render cell to PNG image.
     */
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
