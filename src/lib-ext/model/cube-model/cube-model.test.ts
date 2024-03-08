import { CubeModel } from "./cube-model";

it("constructor", () => {
    new CubeModel();
});

it("toModel", () => {
    const model: string = new CubeModel().toModel();
    expect(model.length).toBeGreaterThan(0);
});
