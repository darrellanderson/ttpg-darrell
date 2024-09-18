import { DrawingLine, Vector, world } from "@tabletop-playground/api";
import { LayoutObjects, LayoutObjectsSize } from "./layout-objects";

export class LayoutBorder extends LayoutObjects {
    private _playerSlot: number = 0;
    private _outlineWidth: number = 1;

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

    setOutlineWidth(width: number): LayoutBorder {
        this._outlineWidth = width;
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

        const topLeft: Vector = center.add(new Vector(extent.x, -extent.y, 0));
        const topRight: Vector = center.add(new Vector(extent.x, extent.y, 0));
        const botRight: Vector = center.add(new Vector(-extent.x, extent.y, 0));
        const botLeft: Vector = center.add(new Vector(-extent.x, -extent.y, 0));

        const line: DrawingLine = new DrawingLine();
        line.points = [topLeft, topRight, botRight, botLeft, topLeft];
        line.thickness = this._outlineWidth;
        line.color = world.getSlotColor(this._playerSlot);
        line.tag = lineTag;
        world.addDrawingLine(line);
    }
}
