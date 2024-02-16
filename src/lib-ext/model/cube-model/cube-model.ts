import { CUBE_MODEL } from "./cube-model.data";

export type OffsetAndSize = {
    left: number;
    top: number;
    width: number;
    height: number;
};

export class CubeModel {
    /**
     * Given a size, calculate the inset bounds for the UV mapped space.
     *
     * @param width
     * @param height
     * @returns
     */
    static getInsetForUVs(width: number, height: number): OffsetAndSize {
        const left: number = Math.floor(width / 256);
        const top: number = Math.floor(height / 256);
        return {
            left,
            top,
            width: width - left * 2, // consistent gutter sizes
            height: height - top * 2,
        };
    }

    /**
     * Given a size, calculate the outset bounds after applying UV gutters.
     */
    static getOutsetForUVs(width: number, height: number): OffsetAndSize {
        // outer = inner * 256/254
        // left = outer - inner / 2
        const outerWidth: number = (width * 256) / 254; // non-integer
        const left: number = Math.floor((outerWidth - width) / 2);

        const outerHeight: number = (height * 256) / 254; // non-integer
        const top: number = Math.floor((outerHeight - height) / 2);

        return { left, top, width: width + left * 2, height: height + top * 2 };
    }

    toModel(): string {
        return CUBE_MODEL;
    }
}
