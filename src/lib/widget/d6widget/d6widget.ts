import {
    Canvas,
    ImageWidget,
    LayoutBox,
    Widget,
} from "@tabletop-playground/api";

/**
 * Show a single D6 face as a square widget.
 *
 * Do not extend a widget class, the class shell can be lost when retrieving
 * via getChild, etc.  Use an explicit getWidget method for the widget.
 */
export class D6Widget {
    private readonly _imageWidget: ImageWidget;
    private readonly _canvas: Canvas;
    private readonly _layoutBox: LayoutBox;

    /**
     * Constructor.
     */
    constructor() {
        this._imageWidget = new ImageWidget();
        this._canvas = new Canvas().addChild(this._imageWidget, 0, 0, 1, 1);
        this._layoutBox = new LayoutBox().setChild(this._canvas);

        this.setSize(50);
        this.setFace(0);
    }

    /**
     * Set the widget / single-face image size.
     *
     * @param size
     * @returns self, for chaining
     */
    setSize(size: number): this {
        this._layoutBox.setOverrideHeight(size).setOverrideWidth(size);
        this._imageWidget.setImageSize(size * 3, size * 3);
        return this;
    }

    /**
     * Set the 3x3 dice face sheet:
     *
     * [ - 1 - ]
     * [ 2 3 6 ]
     * [ 5 4 - ]
     *
     * @param textureName
     * @param texturePackageId
     * @returns self, for chaining
     */
    setDiceImage(textureName: string, texturePackageId?: string): this {
        this._imageWidget.setImage(textureName, texturePackageId);
        return this;
    }

    /**
     * Set which face is visible in the widget.
     *
     * @param index
     * @returns self, for chaining
     */
    setFace(index: number): this {
        const colRow: { [key: string]: number }[] = [
            { col: 1, row: 0 }, // 1
            { col: 0, row: 1 }, // 2
            { col: 1, row: 1 }, // 3
            { col: 1, row: 2 }, // 4
            { col: 0, row: 2 }, // 5
            { col: 2, row: 1 }, // 6
        ];
        const { col, row } = colRow[index];
        if (typeof col !== "number" || typeof row !== "number") {
            throw new Error("bad index");
        }

        // Shift the image so the visible portion is col/row of the 3x3.
        const s: number = this._layoutBox.getOverrideWidth();
        const x: number = col * -s;
        const y: number = row * -s;

        this._canvas.updateChild(this._imageWidget, x, y, s * 3, s * 3);
        return this;
    }

    /**
     * Get a widget suitable for UI.
     *
     * @returns Widget
     */
    getWidget(): Widget {
        return this._layoutBox;
    }
}
