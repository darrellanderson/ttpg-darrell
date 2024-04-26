import monotoneChainConvexHull from "monotone-chain-convex-hull";
import {
    AbstractModel,
    ObjVertexForFace,
} from "../abstract-model/abstract-model";

export type HullVector3d = { x: number; y: number; z: number };

export class HullModel extends AbstractModel {
    private _hull: Array<HullVector3d>;
    private _height: number = 0;
    private _padding: number = 0;
    private _pixelSize: number = 0;

    /**
     * Given an arbitrary collection of points, create a clockwise-winging
     * XY hull (clear Z).
     *
     * @param points
     * @returns {Array<HullVector3d>} padded hull
     */
    static __convexHull(points: Array<HullVector3d>): Array<HullVector3d> {
        type XY = [x: number, y: number];
        const xyInput: Array<XY> = points.map((point): XY => {
            return [point.x, point.y];
        });
        const xyOutput: Array<XY> = monotoneChainConvexHull(xyInput);
        return xyOutput.map((xy): HullVector3d => {
            return { x: xy[0], y: xy[1], z: 0 };
        });
    }

    constructor(points: Array<HullVector3d>, height: number) {
        super();
        this._hull = HullModel.__convexHull(points);
        this._height = height;
    }

    getHull(): Array<HullVector3d> {
        return this._hull;
    }

    /**
     * Pad the hull by a given amount, creating a new hull.
     * Apply corner segments to smooth the hull.
     *
     * @param padding
     * @param cornerSegments
     * @returns
     */
    padHull(padding: number, cornerSegments: number): this {
        const hullPlus: Array<HullVector3d> = [...this._hull];
        const deltaPhi = (Math.PI * 2) / cornerSegments;
        for (const point of this._hull) {
            for (let i = 0; i < cornerSegments; i++) {
                const phi = deltaPhi * i;
                const x = padding * Math.cos(phi);
                const y = padding * Math.sin(phi);
                hullPlus.push({ x: point.x + x, y: point.y + y, z: 0 });
            }
        }
        this._hull = HullModel.__convexHull(hullPlus);
        return this;
    }

    /**
     * Quantize hull, "pixelating" then creating a hull from pixel corners.
     * This can significantly reduce the number of edges in the hull,
     * especially for curves.  Hull will grow by a portion of pixel size.
     */
    quantizeHull(pixelSize: number): this {
        const hullPlus: Array<HullVector3d> = [];
        for (const point of this._hull) {
            const x0: number = Math.floor(point.x / pixelSize) * pixelSize;
            const x1: number = Math.ceil(point.x / pixelSize) * pixelSize;
            const y0: number = Math.floor(point.y / pixelSize) * pixelSize;
            const y1: number = Math.ceil(point.y / pixelSize) * pixelSize;
            hullPlus.push({ x: x0, y: y0, z: 0 });
            hullPlus.push({ x: x1, y: y0, z: 0 });
            hullPlus.push({ x: x1, y: y1, z: 0 });
            hullPlus.push({ x: x0, y: y1, z: 0 });
        }
        this._hull = HullModel.__convexHull(hullPlus);
        return this;
    }

    cleanHull(): this {
        this._hull = this._hull.map((point) => {
            return {
                x: Math.round(point.x * 10000) / 10000,
                y: Math.round(point.y * 10000) / 10000,
                z: Math.round(point.z * 10000) / 10000,
            };
        });
        return this;
    }

    /**
     * Generate the side normals for each point, the next point should be split
     * and have the pervious point's normal followed by that point's normal.
     *
     * @param hull
     * @returns
     */
    static _getSideNormals(hull: Array<HullVector3d>): Array<HullVector3d> {
        // Perpendicular to clockwise segment:
        // (x, y) -> (y, -x)
        // Counter-clockwise:
        // (x, y) -> (-y, x)
        const normals: Array<HullVector3d> = [];
        const zero = { x: 0, y: 0, z: 0 };
        for (let i = 0; i < hull.length; i++) {
            const p0: HullVector3d = hull[i] ?? zero;
            const p1: HullVector3d = hull[(i + 1) % hull.length] ?? zero;
            const dx = p1.x - p0.x;
            const dy = p1.y - p0.y;
            const m = Math.max(Math.sqrt(dx * dx + dy * dy), Number.EPSILON);
            normals.push({ x: dy / m, y: -dx / m, z: 0 });
        }
        return normals;
    }

    static _toObjLineine(type: "v" | "vn", vertex: HullVector3d): string {
        // TTPG uses flipped X/Y, Z is up, OBJ Y is up.
        vertex.x = Math.round(vertex.x * 10000) / 10000;
        vertex.y = Math.round(vertex.y * 10000) / 10000;
        vertex.z = Math.round(vertex.z * 10000) / 10000;

        return `${type} ${vertex.y} ${vertex.z} ${vertex.x}`;
    }

    toModel(): string {
        let numNormals = 0;
        let numVertices = 0;

        // Reverse the hull to make the top face counterclockwise.
        const hull: Array<HullVector3d> = this._hull.reverse();

        const lines: Array<string> = [`# Hull, ${hull.length} sides`];

        lines.push("", "# Top vertices");
        const topVertices1BasedStart = numVertices + 1;
        numVertices += hull.length;
        hull.forEach((point): void => {
            const vertex: HullVector3d = {
                x: point.x,
                y: point.y,
                z: this._height / 2,
            };
            lines.push(HullModel._toObjLineine("v", vertex));
        });

        lines.push("", "# Bottom vertices");
        const botVertices1BasedStart = numVertices + 1;
        numVertices += hull.length;
        hull.forEach((point): void => {
            const vertex: HullVector3d = {
                x: point.x,
                y: point.y,
                z: -this._height / 2,
            };
            lines.push(HullModel._toObjLineine("v", vertex));
        });

        lines.push("", "# Top normal");
        const topNormal1BasedStart = numNormals + 1;
        numNormals += 1;
        const topNormal: HullVector3d = { x: 0, y: 0, z: 1 };
        lines.push(HullModel._toObjLineine("vn", topNormal));

        lines.push("", "# Bottom normal");
        const botNormal1BasedStart = numNormals + 1;
        numNormals += 1;
        const botNormal: HullVector3d = { x: 0, y: 0, z: -1 };
        lines.push(HullModel._toObjLineine("vn", botNormal));

        lines.push("", "# Side normals");
        const sideNormal1BasedStart = numNormals + 1;
        numNormals += hull.length;
        HullModel._getSideNormals(hull).forEach(
            (normal: HullVector3d): void => {
                lines.push(HullModel._toObjLineine("vn", normal));
            }
        );

        // Top faces.
        lines.push("", "# Top faces");
        const topFaceEntries: Array<ObjVertexForFace> = hull.map(
            (_, index): ObjVertexForFace => {
                const v: number = topVertices1BasedStart + index;
                //const vt: string = "";
                const vn: number = topNormal1BasedStart;
                return `${v}//${vn}`;
            }
        );
        lines.push(...AbstractModel.triangleStrip(topFaceEntries, true));

        // Bottom faces.
        lines.push("", "# Bottom faces");
        const botFaceEntries: Array<ObjVertexForFace> = hull.map(
            (_, index): ObjVertexForFace => {
                const v: number = botVertices1BasedStart + index;
                //const vt: string = "";
                const vn: number = botNormal1BasedStart;
                return `${v}//${vn}`;
            }
        );
        lines.push(...AbstractModel.triangleStrip(botFaceEntries, false));

        // Side faces.
        lines.push("", "# Side faces");
        for (let index = 0; index <= hull.length; index++) {
            const a: number = topVertices1BasedStart + index;
            const b: number =
                topVertices1BasedStart + ((index + 1) % hull.length);
            const c: number = botVertices1BasedStart + index;
            const d: number =
                botVertices1BasedStart + ((index + 1) % hull.length);
            const vn: number = sideNormal1BasedStart + index;
            const f0: Array<ObjVertexForFace> = [
                `${a}//${vn}`,
                `${c}//${vn}`,
                `${b}//${vn}`,
            ];
            const f1: Array<ObjVertexForFace> = [
                `${b}//${vn}`,
                `${c}//${vn}`,
                `${d}//${vn}`,
            ];
            lines.push("f " + f0.join(" "));
            lines.push("f " + f1.join(" "));
        }

        return lines.join("\n");
    }
}
