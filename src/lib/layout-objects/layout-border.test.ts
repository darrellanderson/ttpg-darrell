import { LayoutBorder } from "./layout-border";
import { LayoutObjects, LayoutObjectsSize } from "./layout-objects";

it("constructor", () => {
    const layoutObjects: LayoutObjects = new LayoutObjects();
    const borderSize: number = 5;
    const layoutBorder: LayoutBorder = new LayoutBorder(
        layoutObjects,
        borderSize
    );
    const size: LayoutObjectsSize = layoutBorder.calculateSize();
    expect(size).toEqual({ w: 10, h: 10 });
});
