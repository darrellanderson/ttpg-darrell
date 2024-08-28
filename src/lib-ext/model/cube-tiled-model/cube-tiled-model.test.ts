import { CubeTiledModel } from "./cube-tiled-model";

it("toModel", () => {
    const obj: string = new CubeTiledModel().toModel();
    expect(obj).toBeDefined();
});
