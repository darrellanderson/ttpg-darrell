import { AbstractModel } from "../abstract-model/abstract-model";
import { CUBE_MODEL_WITHOUT_TOP } from "./cube-tiled-model.data";

export class CubeTiledModel extends AbstractModel {
    public static readonly ASSET_FILENAME = "uv-cube-tiled.obj";

    private readonly _tileCount: number = 10;

    toModel(): string {
        const parts: Array<string> = [CUBE_MODEL_WITHOUT_TOP, ""];

        // Add tiled top.  UVs are 1,2,3,4.
        const vIdx = 9; // first tiled top vertex index

        for (let j = 0; j <= this._tileCount; j++) {
            for (let i = 0; i <= this._tileCount; i++) {
                const x: number =
                    Math.round((i / this._tileCount - 0.5) * 10000) / 10000;
                const y: number =
                    Math.round((-j / this._tileCount + 0.5) * 10000) / 10000;
                parts.push(`v ${x} 0.5 ${y}`);
            }
        }

        for (let y = 0; y < this._tileCount; y++) {
            for (let x = 0; x < this._tileCount; x++) {
                const v0: number = vIdx + x + y * (this._tileCount + 1);
                const a: number = v0;
                const b: number = v0 + 1;
                const c: number = v0 + this._tileCount + 1;
                const d: number = v0 + this._tileCount + 2;
                parts.push(`f ${a}/1/1 ${b}/2/1 ${c}/3/1 # ${x},${y}`);
                parts.push(`f ${b}/2/1 ${d}/4/1 ${c}/3/1`);
            }
        }

        return parts.join("\n");
    }
}
