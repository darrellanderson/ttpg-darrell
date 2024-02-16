import { CubeModel } from "./cube-model";

it("constructor", () => {
    new CubeModel();
});

it("getInsetForUVs", () => {
    const inset = CubeModel.getInsetForUVs(4096, 1024);
    expect(inset).toEqual({ height: 1016, left: 16, top: 4, width: 4064 });
});

it("", () => {
    const outset = CubeModel.getOutsetForUVs(4064, 1016);
    expect(outset).toEqual({ height: 1024, left: 16, top: 4, width: 4096 });
});

it("toModel", () => {
    const model: string = new CubeModel().toModel();
    expect(model.length).toBeGreaterThan(0);
});
