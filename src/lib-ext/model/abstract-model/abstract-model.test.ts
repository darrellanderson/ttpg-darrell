import { AbstractModel, ObjVertexForFace } from "./abstract-model"; // Import the AbstractModel class

it("getInsetForUVs", () => {
    const inset = AbstractModel.getInsetForUVs(4096, 1024);
    expect(inset).toEqual({ height: 1016, left: 16, top: 4, width: 4064 });
});

it("getOutsetForUVs", () => {
    const outset = AbstractModel.getOutsetForUVs(4064, 1016);
    expect(outset).toEqual({ height: 1024, left: 16, top: 4, width: 4096 });
});

it("triangle strip", () => {
    const verticies: Array<ObjVertexForFace> = ["1//", "2//", "3//", "4//"];
    const result = AbstractModel.triangleStrip(verticies, true);
    expect(result).toEqual(["f 1// 2// 4//", "f 2// 3// 4//"]);
});

it("triangle sides", () => {
    const topVerticies: Array<ObjVertexForFace> = ["1//", "2//", "3//", "4//"];
    const botVerticies: Array<ObjVertexForFace> = ["5//", "6//", "7//", "8//"];
    const result = AbstractModel.triangleSides(topVerticies, botVerticies);
    expect(result).toEqual([
        "f 1// 5// 6//",
        "f 6// 2// 1//",
        "f 2// 6// 7//",
        "f 7// 3// 2//",
        "f 3// 7// 8//",
        "f 8// 4// 3//",
        "f 4// 8// 5//",
        "f 5// 1// 4//",
    ]);
});
