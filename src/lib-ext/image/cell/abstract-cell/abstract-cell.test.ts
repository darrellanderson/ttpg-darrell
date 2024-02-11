import { AbstractCell } from "./abstract-cell";

class MyCell extends AbstractCell {
    public toBuffer(): Promise<Buffer> {
        throw new Error("Method not implemented.");
    }
}

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
