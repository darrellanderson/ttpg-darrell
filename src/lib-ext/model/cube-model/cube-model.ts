import { AbstractModel } from "../abstract-model/abstract-model";
import { CUBE_MODEL } from "./cube-model.data";

export class CubeModel extends AbstractModel {
    public static readonly ASSET_FILENAME = "uv-cube.obj";

    toModel(): string {
        return CUBE_MODEL;
    }
}
