import { Vector } from "@tabletop-playground/api";
import { Polygon } from "./polygon";

it("constructor", () => {
    new Polygon([]);
});

it("add", () => {
    const p = new Polygon([new Vector(1, 2, 3), new Vector(4, 5, 6)]);
    const points = p.getPoints();
    expect(points.length).toBe(2);
});

it("contains", () => {
    const p = new Polygon([
        new Vector(0, 0, 0),
        new Vector(0, 2, 0),
        new Vector(2, 2, 0),
        new Vector(2, 0, 0),
    ]);
    expect(p.contains(new Vector(1, 1, 0))).toBe(true);
    expect(p.contains(new Vector(3, 1, 0))).toBe(false);
});

it("inset", () => {
    const p: Polygon = new Polygon([
        new Vector(0, 0, 0),
        new Vector(1, 1, 0),
        new Vector(2, 0, 0),
    ]);
    const insetP: Polygon = p.inset(0.1);

    // Make sure original unchanged.
    let points: Array<Vector> = p.getPoints();
    expect(points.map((p: Vector): string => p.toString())).toEqual([
        "(X=0,Y=0,Z=0)",
        "(X=1,Y=1,Z=0)",
        "(X=2,Y=0,Z=0)",
    ]);

    // Check inset.
    points = insetP.getPoints();

    expect(points.map((p: Vector): string => p.toString())).toEqual([
        "(X=0.241,Y=0.1,Z=0)",
        "(X=1,Y=0.859,Z=0)",
        "(X=1.759,Y=0.1,Z=0)",
    ]);
});
