import { MockGameObject, MockVector } from "ttpg-mock";
import { LayoutObjects } from "./layout-objects";
import {
    HorizontalAlignment,
    VerticalAlignment,
} from "@tabletop-playground/api";

it("calculateSize (1x1)", () => {
    const size = new LayoutObjects()
        .setIsVertical(false)
        .setHorizontalAlignment(HorizontalAlignment.Fill)
        .setVerticalAlignment(VerticalAlignment.Fill)
        .setChildDistance(1)
        .add(new MockGameObject({ _modelSize: [10, 10, 10] }))
        .calculateSize();
    expect(size).toEqual({ w: 10, h: 10 });
});

it("calculateSize (2x1)", () => {
    const size = new LayoutObjects()
        .setIsVertical(false)
        .setChildDistance(1)
        .add(new MockGameObject({ _modelSize: [10, 10, 10] }))
        .add(new MockGameObject({ _modelSize: [10, 10, 10] }))
        .calculateSize();
    expect(size).toEqual({ w: 21, h: 10 });
});

it("calculateSize (1x2)", () => {
    const size = new LayoutObjects()
        .setIsVertical(true)
        .setChildDistance(1)
        .add(new MockGameObject({ _modelSize: [10, 10, 10] }))
        .add(new MockGameObject({ _modelSize: [10, 10, 10] }))
        .calculateSize();
    expect(size).toEqual({ w: 10, h: 21 });
});

it("calculateSize (nested)", () => {
    const inner = new LayoutObjects()
        .setIsVertical(true)
        .setChildDistance(1)
        .add(new MockGameObject({ _modelSize: [10, 10, 10] }))
        .add(new MockGameObject({ _modelSize: [10, 10, 10] }))
        .add(new MockGameObject({ _modelSize: [10, 10, 10] }));
    const innerSize = inner.calculateSize();
    expect(innerSize).toEqual({ w: 10, h: 32 });

    const outer = new LayoutObjects()
        .setIsVertical(false)
        .setChildDistance(1)
        .add(new MockGameObject({ _modelSize: [10, 10, 10] }))
        .add(inner);
    const outerSize = outer.calculateSize();
    expect(outerSize).toEqual({ w: 21, h: 32 });
});

it("overrideHeight", () => {
    const layoutObjects = new LayoutObjects()
        .add(new MockGameObject({ _modelSize: [10, 10, 10] }))
        .setOverrideHeight(3);
    expect(layoutObjects.calculateSize()).toEqual({ w: 10, h: 3 });
    expect(layoutObjects.calculateChildrenSize()).toEqual({ w: 10, h: 10 });
});

it("overrideWidth", () => {
    const layoutObjects = new LayoutObjects()
        .add(new MockGameObject({ _modelSize: [10, 10, 10] }))
        .setOverrideWidth(3);
    expect(layoutObjects.calculateSize()).toEqual({ w: 3, h: 10 });
    expect(layoutObjects.calculateChildrenSize()).toEqual({ w: 10, h: 10 });
});

it("layout (1x1, origin)", () => {
    const obj1 = new MockGameObject({ _modelSize: [10, 10, 10] });
    const center = new MockVector(0, 0, 0);
    const yaw = 0;
    new LayoutObjects().add(obj1).doLayoutAtPoint(center, yaw);
    const want = new MockVector(0, 0, 0);
    expect(obj1.getPosition().toString()).toEqual(want.toString());
});

it("layout (1x1, offset)", () => {
    const obj1 = new MockGameObject({ _modelSize: [10, 10, 10] });
    const center = new MockVector(1, 2, 3);
    const yaw = 0;
    new LayoutObjects().add(obj1).doLayoutAtPoint(center, yaw);
    const want = new MockVector(1, 2, 0); // snapto ground
    expect(obj1.getPosition().toString()).toEqual(want.toString());
});

it("layout (2x1, origin)", () => {
    const obj1 = new MockGameObject({ _modelSize: [10, 10, 10] });
    const obj2 = new MockGameObject({ _modelSize: [10, 10, 10] });
    const center = new MockVector(0, 0, 0);
    const yaw = 0;
    new LayoutObjects()
        .setIsVertical(false)
        .add(obj1)
        .add(obj2)
        .setChildDistance(1)
        .doLayoutAtPoint(center, yaw);

    const want1 = new MockVector(0, -5.5, 0);
    const want2 = new MockVector(0, 5.5, 0);
    expect(obj1.getPosition().toString()).toEqual(want1.toString());
    expect(obj2.getPosition().toString()).toEqual(want2.toString());
});

it("layout (2x1, offset)", () => {
    const obj1 = new MockGameObject({ _modelSize: [10, 10, 10] });
    const obj2 = new MockGameObject({ _modelSize: [10, 10, 10] });
    const center = new MockVector(1, 2, 3);
    const yaw = 0;
    new LayoutObjects()
        .setIsVertical(false)
        .add(obj1)
        .add(obj2)
        .setChildDistance(1)
        .doLayoutAtPoint(center, yaw);
    const want1 = new MockVector(1, -3.5, 0); // snap to ground
    const want2 = new MockVector(1, 7.5, 0);
    expect(obj1.getPosition().toString()).toEqual(want1.toString());
    expect(obj2.getPosition().toString()).toEqual(want2.toString());
});

it("layout (2x1, origin, rot)", () => {
    const obj1 = new MockGameObject({ _modelSize: [10, 10, 10] });
    const obj2 = new MockGameObject({ _modelSize: [10, 10, 10] });
    const center = new MockVector(0, 0, 0);
    const yaw = 90;
    new LayoutObjects()
        .setIsVertical(false)
        .add(obj1)
        .add(obj2)
        .setChildDistance(1)
        .doLayoutAtPoint(center, yaw);

    const want1 = new MockVector(5.5, 0, 0);
    const want2 = new MockVector(-5.5, 0, 0);
    expect(obj1.getPosition().toString()).toEqual(want1.toString());
    expect(obj2.getPosition().toString()).toEqual(want2.toString());
});

it("after layout", () => {
    let count = 0;
    const after = () => {
        count++;
    };
    new LayoutObjects()
        .addAfterLayout(after)
        .doLayoutAtPoint(new MockVector(0, 0, 0), 0);
    expect(count).toEqual(1);
});
