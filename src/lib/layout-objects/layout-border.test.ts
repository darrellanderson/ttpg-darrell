import { LayoutBorder } from "./layout-border";
import { LayoutObjects, LayoutObjectsSize } from "./layout-objects";

it("constructor", () => {
    const layoutObjects: LayoutObjects = new LayoutObjects()
        .setOverrideWidth(1)
        .setOverrideHeight(2);
    const borderSize: number = 5;
    const layoutBorder: LayoutBorder = new LayoutBorder(
        layoutObjects,
        borderSize
    );
    const size: LayoutObjectsSize = layoutBorder.calculateSize();
    expect(size).toEqual({ w: 11, h: 12 });
});
