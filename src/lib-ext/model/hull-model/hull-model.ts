import monotoneChainConvexHull from "monotone-chain-convex-hull";
import {
    AbstractModel,
    ObjVertexForFace,
} from "../abstract-model/abstract-model";

type Vector3d = { x: number; y: number; z: number };

export class HullModel extends AbstractModel {
    private readonly _points: Array<Vector3d>;
    private readonly _height: number;
    private _padding: number = 0;
    private _pixelSize: number = 0;

    constructor(points: Array<Vector3d>, height: number) {
        super();

        this._points = points;
        this._height = height;
    }

    setPadding(padding: number): this {
        this._padding = padding;
        return this;
    }

    setPixelSize(pixelSize: number): this {
        this._pixelSize = pixelSize;
        return this;
    }

    /**
     * Given an arbitrary collection of points, create an XY hull (clear Z).
     *
     * @param points
     * @returns {Array<Vector3d>} padded hull
     */
    static _getHull(points: Array<Vector3d>): Array<Vector3d> {
        type XY = [x: number, y: number];
        const xyInput: Array<XY> = points.map((point): XY => {
            return [point.x, point.y];
        });
        const xyOutput: Array<XY> = monotoneChainConvexHull(xyInput);
        return xyOutput.map((xy): Vector3d => {
            return { x: xy[0], y: xy[1], z: 0 };
        });
    }

    /**
     * Pad a hull, adding curves to the corners (clear Z).
     *
     * @param points
     * @param padding
     */
    static _padHull(
        hull: Array<Vector3d>,
        padding: number,
        cornerSegments: number
    ): Array<Vector3d> {
        const hullPlus: Array<Vector3d> = [...hull];

        const deltaPhi = Math.PI / 2 / cornerSegments;
        for (const point of hull) {
            for (let i = 0; i < cornerSegments; i++) {
                const phi = deltaPhi * i;
                const x = padding * Math.cos(phi);
                const y = padding * Math.sin(phi);
                hullPlus.push({ x: point.x + x, y: point.y + y, z: 0 });
            }
        }

        return HullModel._getHull(hullPlus);
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
        hull: Array<Vector3d>,
        pixelSize: number
    ): Array<Vector3d> {
        const invPixelSize: number = 1 / pixelSize;
        const hullPlus: Array<Vector3d> = [];
        for (const point of hull) {
            const x0: number = Math.floor(point.x * invPixelSize);
            const x1: number = Math.ceil(point.x * invPixelSize);
            const y0: number = Math.floor(point.y * invPixelSize);
            const y1: number = Math.ceil(point.y * invPixelSize);
            hullPlus.push({ x: x0, y: y0, z: 0 });
            hullPlus.push({ x: x1, y: y0, z: 0 });
            hullPlus.push({ x: x1, y: y1, z: 0 });
            hullPlus.push({ x: x0, y: y1, z: 0 });
        }
        return HullModel._getHull(hullPlus);
    }

    /**
     * Generate the side normals for each point, the next point should be split
     * and have the pervious point's normal followed by that point's normal.
     *
     * @param hull
     * @returns
     */
    static _getSideNormals(hull: Array<Vector3d>): Array<Vector3d> {
        // Perpendicular to clockwise segment:
        // (x, y) -> (y, -x)
        // Counter-clockwise:
        // (x, y) -> (-y, x)
        const normals: Array<Vector3d> = [];
        const zero = { x: 0, y: 0, z: 0 };
        for (let i = 0; i < hull.length; i++) {
            const p0: Vector3d = hull[i] ?? zero;
            const p1: Vector3d = hull[(i + 1) % hull.length] ?? zero;
            const dx = p1.x - p0.x;
            const dy = p1.y - p0.y;
            const m = Math.max(Math.sqrt(dx * dx + dy * dy), Number.EPSILON);
            normals.push({ x: dy / m, y: -dx / m, z: 0 });
        }
        return normals;
    }

    static _toObjLineine(type: "v" | "vn", vertex: Vector3d): string {
        // TTPG uses flipped X/Y, Z is up, OBJ Y is up.
        vertex.x = Math.round(vertex.x * 10000) / 10000;
        vertex.y = Math.round(vertex.y * 10000) / 10000;
        vertex.z = Math.round(vertex.z * 10000) / 10000;

        return `${type} ${vertex.y} ${vertex.z} ${vertex.x}`;
    }

    toModel(): string {
        let hull: Array<Vector3d> = HullModel._getHull(this._points);
        hull = HullModel._padHull(hull, this._padding, 16);
        hull = HullModel._quantizeHull(hull, this._pixelSize);

        const lines: Array<string> = [`# Hull, ${this._numSides} sides`];

        const top: Array<Vector3d> = hull.map((point): Vector3d => {
            return {
                x: point.x,
                y: point.y,
                z: this._height / 2,
            };
        });
        const bot: Array<Vector3d> = hull.map((point): Vector3d => {
            return {
                x: point.x,
                y: point.y,
                z: -this._height / 2,
            };
        });
        const topNormal: Vector3d = { x: 0, y: 0, z: 1 };
        const botNormal: Vector3d = {
            x: 0,
            y: 0,
            z: -1,
        };
        const sideNormals: Array<Vector3d> = HullModel._getSideNormals(hull);

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
