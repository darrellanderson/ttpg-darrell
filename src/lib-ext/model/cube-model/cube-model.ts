import { CUBE_MODEL } from "./cube-model.data";

export class CubeModel {
    getInsetForUVs(
        width: number,
        height: number
    ): {
        left: number;
        top: number;
        width: number;
        height: number;
    } {
        const left: number = Math.round(width / 256);
        const top: number = Math.round(height / 256);
        return {
            left,
            top,
            width: width - left * 2, // consistent gutter sizes
            height: height - top * 2,
        };
    }

    toModel(): string {
        return CUBE_MODEL;
    }
}
