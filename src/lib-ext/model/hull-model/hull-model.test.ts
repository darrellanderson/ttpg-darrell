import { HullModel, HullVector3d } from "./hull-model";

it("__convexHull", () => {
    const hull: Array<HullVector3d> = HullModel.__convexHull([
        { x: -1, y: -1, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: -1, y: 1, z: 0 },
        { x: 1, y: -1, z: 0 },
        { x: 0, y: 0, z: 0 },
    ]);
    expect(hull).toEqual([
        { x: -1, y: -1, z: 0 },
        { x: -1, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 1, y: -1, z: 0 },
    ]);
});

it("padHull", () => {
    const hull: Array<HullVector3d> = [
        { x: -1, y: -1, z: 0 },
        { x: -1, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 1, y: -1, z: 0 },
    ];
    const paddedHull: Array<HullVector3d> = new HullModel(hull, 0)
        .padHull(0.1, 4)
        .getHull();

    expect(paddedHull).toEqual([
        { x: -1.1, y: -1, z: 0 },
        { x: -1.1, y: 1, z: 0 },
        { x: -1, y: 1.1, z: 0 },
        { x: 1, y: 1.1, z: 0 },
        { x: 1.1, y: 1, z: 0 },
        { x: 1.1, y: -1, z: 0 },
        { x: 1, y: -1.1, z: 0 },
        { x: -1, y: -1.1, z: 0 },
    ]);
});

it("quantizeHull", () => {
    const hull: Array<HullVector3d> = [
        { x: -1.1, y: -1.1, z: 0 },
        { x: -1.1, y: 1.1, z: 0 },
        { x: 1.1, y: 1.1, z: 0 },
        { x: 1.1, y: -1.1, z: 0 },
    ];
    const quantizedHull: Array<HullVector3d> = new HullModel(hull, 0)
        .quantizeHull(0.2)
        .cleanHull()
        .getHull();

    expect(quantizedHull).toEqual([
        { x: -1.2, y: -1.2, z: 0 },
        { x: -1.2, y: 1.2, z: 0 },
        { x: 1.2, y: 1.2, z: 0 },
        { x: 1.2, y: -1.2, z: 0 },
    ]);
});

it("toModel", () => {
    const hull: Array<HullVector3d> = [
        { x: -1, y: -1, z: 0 },
        { x: -1, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 1, y: -1, z: 0 },
    ];
    const model: string = new HullModel(hull, 1).toModel();
    console.log(
        model
            .split("\n")
            .map((line) => `"${line}",`)
            .join("\n")
    );
    expect(model.split("\n")).toEqual([
        "# Hull, 4 sides",
        "",
        "# Top vertices",
        "v -1 0.5 1",
        "v 1 0.5 1",
        "v 1 0.5 -1",
        "v -1 0.5 -1",
        "",
        "# Bottom vertices",
        "v -1 -0.5 1",
        "v 1 -0.5 1",
        "v 1 -0.5 -1",
        "v -1 -0.5 -1",
        "",
        "# Top normal",
        "vn 0 1 0",
        "",
        "# Bottom normal",
        "vn 0 -1 0",
        "",
        "# Side normals",
        "vn 0 0 1",
        "vn 1 0 0",
        "vn 0 0 -1",
        "vn -1 0 0",
        "",
        "# Top faces",
        "f 1//1 2//1 4//1",
        "f 2//1 3//1 4//1",
        "",
        "# Bottom faces",
        "f 8//2 6//2 5//2",
        "f 8//2 7//2 6//2",
        "",
        "# Side faces",
        "f 1//3 5//3 2//3",
        "f 2//3 5//3 6//3",
        "f 2//4 6//4 3//4",
        "f 3//4 6//4 7//4",
        "f 3//5 7//5 4//5",
        "f 4//5 7//5 8//5",
        "f 4//6 8//6 1//6",
        "f 1//6 8//6 5//6",
        "f 5//7 9//7 2//7",
        "f 2//7 9//7 6//7",
    ]);
});
