import {
    AbstractModel,
    ObjVertexForFace,
} from "../abstract-model/abstract-model";

type Vector = { x: number; y: number; z: number };

export class HullModel extends AbstractModel {
    private readonly _hull: Array<Vector>;

    constructor(points: Array<Vector>, height: number) {
        super();
    }

    /**
     * Given an arbitrary collection of points, create a hull.
     *
     * @param points
     * @returns {Array<Vector>} padded hull
     */
    static _getHull(points: Array<Vector>): Array<Vector> {
        // TODO XXX
    }

    /**
     * Pad a hull, adding curves to the corners.
     *
     * @param points
     * @param padding
     */
    static _padHull(
        hull: Array<Vector>,
        padding: number,
        cornerSegments: number
    ): Array<Vector> {
        // TODO XXX
    }

    /**
     * Quantize hull, "pixelating" then creating a hull from pixel corners.
     * This can significantly reduce the number of edges in the hull,
     * especially for curves.  Hull will grow by a portion of pixel size.
     *
     * @param hull
     * @returns
     */
    static _quantizeHull(
        hull: Array<Vector>,
        pixelSize: number
    ): Array<Vector> {}

    // TODO not quite, need to split vericies per face
    static _getSideNormals(hull: Array<Vector>): Array<Vector> {
        return hull.map((point): Vector => {
            const length = Math.sqrt(point.x * point.x + point.y * point.y);
            if (length === 0) {
                return { x: 0, y: 0, z: 0 };
            }
            return {
                x: Math.round((point.x / length) * 1000) / 1000,
                y: Math.round((point.y / length) * 1000) / 1000,
                z: 0,
            };
        });
    }

    static _toVertexLine(vertex: Vector): string {
        // TTPG uses flipped X/Y, Z is up, OBJ Y is up.
        vertex.x = Math.round(vertex.x * 10000) / 10000;
        vertex.y = Math.round(vertex.y * 10000) / 10000;
        vertex.z = Math.round(vertex.z * 10000) / 10000;

        return `v ${vertex.y} ${vertex.z} ${vertex.x}`;
    }

    toModel(): string {
        const lines: Array<string> = [`# Hull, ${this._numSides} sides`];

        const topCircle: Array<{ x: number; y: number; z: number }> =
            this._getCircle(true);
        const botCircle: Array<{ x: number; y: number; z: number }> =
            this._getCircle(false);

        // Vertices.
        lines.push("");
        lines.push("# Top vertices");
        topCircle.forEach((vertex) => {
            lines.push(this._toVertexLine(vertex));
        });
        lines.push("");
        lines.push("# Bottom vertices");
        botCircle.forEach((vertex) => {
            lines.push(this._toVertexLine(vertex));
        });

        // Faces.
        const topFaceEntries: Array<ObjVertexForFace> = topCircle.map(
            (vertex, index): ObjVertexForFace => {
                return `${index + 1}//`;
            }
        );
        const botFaceEntries: Array<ObjVertexForFace> = botCircle.map(
            (vertex, index): ObjVertexForFace => {
                return `${this._numSides + index + 1}//`;
            }
        );

        lines.push(
            "",
            "# Top triangles",
            ...AbstractModel.triangleStrip(topFaceEntries, true),
            "",
            "# Bottom triangles",
            ...AbstractModel.triangleStrip(botFaceEntries, false),
            "",
            "# Side triangles",
            ...AbstractModel.triangleSides(topFaceEntries, botFaceEntries)
        );

        return lines.join("\n");
    }
}
