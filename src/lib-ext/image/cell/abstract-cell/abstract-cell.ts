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
    constructor(
        width: number,
        height: number,
        children?: Array<{ child: AbstractCell; left: number; top: number }>
    ) {
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

    public getChildren(): AbstractCell[] {
        return this._children ? [...this._children] : [];
    }

    public getLocalPosition(): { left: number; top: number } {
        return { left: this._localPosition.left, top: this._localPosition.top };
    }

    public getGlobalPosition(): { left: number; top: number } {
        let left: number = this._localPosition.left;
        let top: number = this._localPosition.top;
        if (this._parent) {
            const parentGlobalPosition = this._parent.getGlobalPosition();
            left += parentGlobalPosition.left;
            top += parentGlobalPosition.top;
        }
        return { left, top };
    }

    public getSize(): { width: number; height: number } {
        return { width: this._width, height: this._height };
    }

    public abstract toBuffer(): Promise<Buffer>;
}
