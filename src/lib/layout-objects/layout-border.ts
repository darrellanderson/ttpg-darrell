import { DrawingLine, Vector, world } from "@tabletop-playground/api";
import { LayoutObjects, LayoutObjectsSize } from "./layout-objects";

export class LayoutBorder extends LayoutObjects {
    private _playerSlot: number = 0;
    private _linewidth: number = 1;

    constructor(layoutObjects: LayoutObjects, padding: number) {
        super();

        const size: LayoutObjectsSize = layoutObjects.calculateSize();
        this.add(layoutObjects)
            .setOverrideWidth(size.w + padding * 2)
            .setOverrideHeight(size.h + padding * 2);

        this.addAfterLayout(() => {
            this._addBorder();
        });
    }

    setPlayerSlot(playerSlot: number): LayoutBorder {
        this._playerSlot = playerSlot;
        return this;
    }

    setWidth(width: number): LayoutBorder {
        this._linewidth = width;
        return this;
    }

    _addBorder(): void {
        const lineTag: string = "player-area-" + this._playerSlot;

        for (const line of world.getDrawingLines()) {
            if (line.tag === lineTag) {
                world.removeDrawingLineObject(line);
            }
        }

        const center: Vector = this.getCenter();
        center.z = world.getTableHeight() + 0.02;
        const wh: { w: number; h: number } = this.calculateSize();
        const extent: Vector = new Vector(wh.h, wh.w, 0).multiply(0.5);
        let topLeft: Vector = center.add(new Vector(extent.x, -extent.y, 0));
        let topRight: Vector = center.add(new Vector(extent.x, extent.y, 0));
        let botRight: Vector = center.add(new Vector(-extent.x, extent.y, 0));
        let botLeft: Vector = center.add(new Vector(-extent.x, -extent.y, 0));

        const d = 6;
        topLeft = topLeft.add(new Vector(d, -d, 0));
        topRight = topRight.add(new Vector(d, d, 0));
        botLeft = botLeft.add(new Vector(-d, -d, 0));
        botRight = botRight.add(new Vector(-d, d, 0));

        const line: DrawingLine = new DrawingLine();
        line.points = [topLeft, topRight, botRight, botLeft, topLeft];
        line.thickness = this._linewidth;
        line.color = world.getSlotColor(this._playerSlot);
        line.tag = lineTag;
        world.addDrawingLine(line);
    }
}
