import {
    AbstractCell,
    CellSize,
    CellSnapPoint,
    UVPosition,
} from "./abstract-cell";

class MyCell extends AbstractCell {
    public toBuffer(): Promise<Buffer> {
        return this._renderChildren();
    }
}

it("static getMaxSize", () => {
    const maxSize: CellSize = AbstractCell.getMaxSize([
        new MyCell(1, 2),
        new MyCell(2, 1),
    ]);
    expect(maxSize).toEqual({ width: 2, height: 2 });
});

it("constructor/getSize", () => {
    const size: { width: number; height: number } = new MyCell(1, 2).getSize();
    expect(size).toEqual({ width: 1, height: 2 });
});

it("constructor (negative size)", () => {
    expect(() => {
        new MyCell(-1, -1);
    }).toThrow();
});

it("constructor (children)", () => {
    const grandChild = new MyCell(1, 1);
    const child = new MyCell(1, 1, [{ child: grandChild, left: 1, top: 2 }]);
    const myCell = new MyCell(1, 1, [{ child, left: 10, top: 20 }]);

    expect(myCell.getLocalPosition()).toEqual({ left: 0, top: 0 });
    expect(myCell.getGlobalPosition()).toEqual({ left: 0, top: 0 });

    expect(child.getLocalPosition()).toEqual({ left: 10, top: 20 });
    expect(child.getGlobalPosition()).toEqual({ left: 10, top: 20 });

    expect(grandChild.getLocalPosition()).toEqual({ left: 1, top: 2 });
    expect(grandChild.getGlobalPosition()).toEqual({ left: 11, top: 22 });
});

it("getChildren", () => {
    const child1 = new MyCell(1, 1);
    const child2 = new MyCell(1, 1);
    const children = new MyCell(1, 1, [
        { child: child1, left: 0, top: 0 },
        { child: child2, left: 0, top: 0 },
    ]).getChildren();
    expect(children).toEqual([child1, child2]);
});

it("getChildren (empty)", () => {
    const children = new MyCell(1, 1).getChildren();
    expect(children).toEqual([]);
});

it("child already has a parent", () => {
    const child = new MyCell(1, 1);
    new MyCell(1, 1, [{ child, left: 0, top: 0 }]);
    expect(() => {
        new MyCell(1, 1, [{ child, left: 0, top: 0 }]);
    }).toThrow();
});

it("getCenterUV", () => {
    const child1 = new MyCell(1, 1);
    const child2 = new MyCell(1, 1);
    new MyCell(2, 1, [
        { child: child1, left: 0, top: 0 },
        { child: child2, left: 1, top: 0 },
    ]);
    let uv: UVPosition;
    uv = child1.getCenterUV();
    expect(uv).toEqual({ u: 0.25, v: 0.5 });
    uv = child2.getCenterUV();
    expect(uv).toEqual({ u: 0.75, v: 0.5 });
});

it("snap points", () => {
    const child1 = new MyCell(1, 1).addSnapPoint({ tags: ["c1"] }); // default center
    const child2 = new MyCell(1, 1)
        .addSnapPoint({
            tags: ["c2"],
            left: 0.2,
            top: 0.4,
        })
        .addSnapPoint({ rotation: 90 });
    const snapPoints: Array<CellSnapPoint> = new MyCell(2, 1, [
        { child: child1, left: 0, top: 0 },
        { child: child2, left: 1, top: 0 },
    ]).getSnapPoints();
    expect(snapPoints).toEqual([
        { left: 0.5, tags: ["c1"], top: 0.5, rotation: 0 },
        { left: 1.2, tags: ["c2"], top: 0.4, rotation: 0 },
    ]);
});
