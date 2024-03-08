export type OffsetAndSize = {
    left: number;
    top: number;
    width: number;
    height: number;
};

export type ObjVertexForFace = `${number}/${number | ""}/${number | ""}`;

export abstract class AbstractModel {
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

    static triangleStrip(
        vertices: Array<ObjVertexForFace>,
        isTop: boolean
    ): Array<string> {
        const lines: Array<string> = [];
        let nextLeft: number = 0;
        let nextRight: number = vertices.length - 1;
        let goLeft: boolean = true;

        while (nextLeft + 1 < nextRight) {
            let a: number, b: number, c: number;
            if (goLeft) {
                a = nextLeft;
                b = nextLeft + 1;
                c = nextRight;
                nextLeft = b;
                goLeft = false;
            } else {
                a = nextLeft;
                b = nextRight - 1;
                c = nextRight;
                nextRight = b;
                goLeft = true;
            }
            if (!isTop) {
                [a, c] = [c, a];
            }
            lines.push(["f", vertices[a], vertices[b], vertices[c]].join(" "));
        }

        return lines;
    }

    static triangleSides(
        topVerticies: Array<ObjVertexForFace>,
        botVerticies: Array<ObjVertexForFace>
    ): Array<string> {
        const lines: Array<string> = [];
        for (let i = 0; i < topVerticies.length; i++) {
            const a = i; // top
            const b = a; // bottom
            const d = (i + 1) % topVerticies.length; // top
            const c = d; // bottom
            lines.push(
                ["f", topVerticies[a], botVerticies[b], botVerticies[c]].join(
                    " "
                )
            );
            lines.push(
                ["f", botVerticies[c], topVerticies[d], topVerticies[a]].join(
                    " "
                )
            );
        }
        return lines;
    }

    abstract toModel(): string;
}
