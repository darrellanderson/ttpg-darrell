import { Color, Vector, world } from "@tabletop-playground/api";

export type PolygonBoundingBox = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};

/**
 * Manage a polygon in the XY plane.
 */
export class Polygon {
    private readonly _polygon: Array<Vector>;
    private readonly _boundingBox: PolygonBoundingBox;

    constructor(points: Array<Vector>) {
        this._polygon = points;
        this._boundingBox = {
            left: Number.MAX_VALUE,
            top: Number.MAX_VALUE,
            right: Number.MIN_VALUE,
            bottom: Number.MIN_VALUE,
        };
        for (const point of points) {
            this._boundingBox.left = Math.min(point.x, this._boundingBox.left);
            this._boundingBox.top = Math.min(point.y, this._boundingBox.top);
            this._boundingBox.right = Math.max(
                point.x,
                this._boundingBox.right
            );
            this._boundingBox.bottom = Math.max(
                point.y,
                this._boundingBox.bottom
            );
        }
    }

    /**
     * Briefly draw the polygon assuming world space coordinates.
     */
    drawDebug(): void {
        const p: Array<Vector> = this._polygon;
        const color: Color = new Color(1, 0, 0);
        const duration: number = 10;
        const thickness: number = 0.1;
        for (let i = 0; i < p.length; i++) {
            world.drawDebugLine(
                p[i] ?? new Vector(0, 0, 0),
                p[(i + 1) % p.length] ?? new Vector(0, 0, 0),
                color,
                duration,
                thickness
            );
        }
    }

    /**
     * Get polygon vertices.
     *
     * @returns {Array.<Vector>} List of vertices.
     */
    getPoints(): Array<Vector> {
        return this._polygon;
    }

    /**
     * Get polygon bounding box.
     *
     * @returns {Object} Dictionary from { left, top, right, bottom } to numbers.
     */
    getBoundingBox(): PolygonBoundingBox {
        return this._boundingBox;
    }

    /**
     * Is the point within the polygon's XY frame?
     *
     * @param {Vector} point
     * @param {number} pos.x
     * @param {number} pos.y
     * @param {number} pos.z
     * @returns {boolean} True if point inside polygon
     */
    contains(point: Vector): boolean {
        // Fast-reject based on bounding box.
        if (
            point.x < this._boundingBox.left ||
            point.y < this._boundingBox.top ||
            point.x > this._boundingBox.right ||
            point.y > this._boundingBox.bottom
        ) {
            return false;
        }

        // Ray-casting method.  A point is in a polygon if a line from the
        // point to infinity crosses the polygon an odd number of times.
        // @see https://www.algorithms-and-technologies.com/point_in_polygon/javascript
        let odd: boolean = false;

        // For each edge (In this case for each point of the polygon and the previous one)
        for (
            let i = 0, j = this._polygon.length - 1;
            i < this._polygon.length;
            i++
        ) {
            // If a line from the point into infinity crosses this edge (one point above, one below)
            if (
                (this._polygon[i]?.y ?? 0) > point.y !==
                    (this._polygon[j]?.y ?? 0) > point.y &&
                // ...and the edge does not cross our Y corrdinate before our x coordinate (but between our x coordinate and infinity)
                point.x <
                    (((this._polygon[j]?.x ?? 0) - (this._polygon[i]?.x ?? 0)) *
                        (point.y - (this._polygon[i]?.y ?? 0))) /
                        ((this._polygon[j]?.y ?? 0) -
                            (this._polygon[i]?.y ?? 0)) +
                        (this._polygon[i]?.x ?? 0)
            ) {
                // Invert odd
                odd = !odd;
            }
            j = i;
        }
        // If the number of crossings was odd, the point is in the polygon
        return odd;
    }

    /**
     * Create a new polygon with an inset version of this one.
     *
     * @param {number} amount
     * @returns {Polygon} Inset polygon
     */
    inset(amount: number): Polygon {
        const lineIntersection = function (
            a: { x: number; y: number },
            b: { x: number; y: number },
            c: { x: number; y: number },
            d: { x: number; y: number }
        ): { x: number; y: number } {
            // Translate so A is at the origin.
            //A = { x : 0, y : 0 }
            const B = { x: b.x - a.x, y: b.y - a.y };
            let C = { x: c.x - a.x, y: c.y - a.y };
            let D = { x: d.x - a.x, y: d.y - a.y };

            const distAB = Math.hypot(B.x, B.y);

            // Rotate so B is on the positive X axis.
            const cos = B.x / distAB;
            const sin = B.y / distAB;
            //B = { x : distAB, y : 0 }
            C = { x: C.x * cos + C.y * sin, y: C.y * cos - C.x * sin };
            D = { x: D.x * cos + D.y * sin, y: D.y * cos - D.x * sin };

            // Get intersection on the AB x axis line.
            const ABx = D.x + ((C.x - D.x) * D.y) / (D.y - C.y);

            // Reverse rotation, translation.
            return { x: a.x + ABx * cos, y: a.y + ABx * sin };
        };

        const insetCorner = function (
            prev: { x: number; y: number },
            cur: { x: number; y: number },
            next: { x: number; y: number }
        ): { x: number; y: number } {
            // Get line segments (preserve winding direction) and distances.
            const d1 = { x: cur.x - prev.x, y: cur.y - prev.y };
            const dist1 = Math.hypot(d1.x, d1.y);
            const d2 = { x: next.x - cur.x, y: next.y - cur.y };
            const dist2 = Math.hypot(d2.x, d2.y);
            if (dist1 <= 0 || dist2 <= 0) {
                return cur; // require non-zero edges
            }

            // Inset line segments prev->cur and cur->next.
            const inset1 = {
                x: (d1.y * amount) / dist1,
                y: (-d1.x * amount) / dist1,
            };
            const prev1 = {
                x: (prev?.x ?? 0) + inset1.x,
                y: (prev?.y ?? 0) + inset1.y,
            };
            const prev2 = { x: cur.x + inset1.x, y: cur.y + inset1.y };
            const inset2 = {
                x: (d2.y * amount) / dist2,
                y: (-d2.x * amount) / dist2,
            };
            const next1 = { x: cur.x + inset2.x, y: cur.y + inset2.y };
            const next2 = { x: next.x + inset2.x, y: next.y + inset2.y };

            // If both inset line segments share an endpoint, lines are colinear.
            if (prev2.x == next1.x && prev2.y == next1.y) {
                return next1;
            }

            // Otherwise get intersection point.
            return lineIntersection(prev1, prev2, next1, next2);
        };

        // Copy the first Z everywhere.
        const z = this._polygon[0]?.z ?? 0;
        const insetPoints = [];
        const numVertices = this._polygon.length;
        for (let i = 0; i < numVertices; i++) {
            const prevPt: { x: number; y: number } | undefined =
                this._polygon[(i + numVertices - 1) % numVertices];
            const curPt: { x: number; y: number } | undefined =
                this._polygon[i];
            const nextPt: { x: number; y: number } | undefined =
                this._polygon[(i + 1) % numVertices];
            if (prevPt && curPt && nextPt) {
                const xy = insetCorner(prevPt, curPt, nextPt);
                insetPoints.push(new Vector(xy.x, xy.y, z));
            }
        }

        return new Polygon(insetPoints);
    }
}
