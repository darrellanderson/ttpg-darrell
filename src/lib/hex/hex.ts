import { Vector, world } from "@tabletop-playground/api";

export type HexLayoutType = {
    // F(orward) translates hex to position.
    f0: number;
    f1: number;
    f2: number;
    f3: number;
    // B(ackward) translates position to hex.
    b0: number;
    b1: number;
    b2: number;
    b3: number;
    // Angle to first corner.
    startAngle: number;
};

// Transforms for flat-top hex grid.
export const HEX_LAYOUT_FLAT: HexLayoutType = {
    // F(orward) translates hex to position.
    f0: 3.0 / 2.0,
    f1: 0.0,
    f2: Math.sqrt(3.0) / 2.0,
    f3: Math.sqrt(3.0),
    // B(ackward) translates position to hex.
    b0: 2.0 / 3.0,
    b1: 0.0,
    b2: -1.0 / 3.0,
    b3: Math.sqrt(3.0) / 3.0,
    // Angle to first corner.
    startAngle: 0.0,
} as const;

// Transforms for pointy-top hex grid.
export const HEX_LAYOUT_POINTY: HexLayoutType = {
    // F(orward) translates hex to position.
    f0: HEX_LAYOUT_FLAT.f3,
    f1: HEX_LAYOUT_FLAT.f2,
    f2: HEX_LAYOUT_FLAT.f1,
    f3: HEX_LAYOUT_FLAT.f0,

    // B(ackward) translates position to hex.
    b0: HEX_LAYOUT_FLAT.b3,
    b1: HEX_LAYOUT_FLAT.b2,
    b2: HEX_LAYOUT_FLAT.b1,
    b3: HEX_LAYOUT_FLAT.b0,
    // Angle to first corner.
    startAngle: 0.5,
} as const;

// Half of hex width, 11.547cm
//const HALF_SIZE: number = 5.77735 * 1.5;
//const M: HexLayoutType = LAYOUT_POINTY;

/**
 * Heavily distilled hex math based on RedBlobGames excellent hex docs.
 * "Hex" values are strings for easy use as keys and comparison.
 */
export class Hex {
    private readonly _hexLayoutType: HexLayoutType;
    private readonly _halfSize: number;
    private readonly _tableHeight: number;

    /**
     * Get adjacent hexes.
     * First is "above", winding counterclockwise.
     *
     * @param {string} hex - Hex as "<q,r,s>" string
     * @return {Array} list of hex strings
     */
    static neighbors(hex: string): Array<string> {
        const [q, r, s] = Hex._hexFromString(hex);
        return [
            Hex._hexToString(q + 1, r + 0, s - 1),
            Hex._hexToString(q + 1, r - 1, s + 0),
            Hex._hexToString(q + 0, r - 1, s + 1),
            Hex._hexToString(q - 1, r + 0, s + 1),
            Hex._hexToString(q - 1, r + 1, s + 0),
            Hex._hexToString(q + 0, r + 1, s - 1),
        ];
    }

    /**
     * Hex is a static-only class, do not instantiate it.
     */
    constructor(layout: HexLayoutType, halfSize: number) {
        this._hexLayoutType = layout;
        this._halfSize = halfSize;
        this._tableHeight = world.getTableHeight();
    }

    static _hexFromString(hex: string): [q: number, r: number, s: number] {
        const m = hex.match(/^<(-?\d+),(-?\d+),(-?\d+)>$/);
        if (!m || m.length < 3) {
            throw new Error("match error");
        }
        const q: number = parseFloat(m[1] ?? "0");
        const r: number = parseFloat(m[2] ?? "0");
        const s: number = parseFloat(m[3] ?? "0");
        if (Math.round(q + r + s) !== 0) {
            throw new Error(`q + r + s must be 0 ("${hex}")`);
        }
        return [q, r, s];
    }

    static _hexToString(q: number, r: number, s: number): string {
        return `<${q},${r},${s}>`;
    }

    /**
     * Get hex at position.
     *
     * @param {Vector} pos - Cartesian position on XY surface
     * @param {number} pos.x
     * @param {number} pos.y
     * @param {number} pos.z
     * @returns {string} hex as "<q,r,s>" string
     */
    fromPosition(pos: Vector): string {
        const M = this._hexLayoutType;

        // Fractional hex position.
        const x = pos.x / this._halfSize;
        const y = pos.y / this._halfSize;
        const q = M.b0 * x + M.b1 * y;
        const r = M.b2 * x + M.b3 * y;
        const s = -q - r;

        // Round to grid aligned hex.
        let qi = Math.round(q);
        let ri = Math.round(r);
        let si = Math.round(s);
        const q_diff = Math.abs(qi - q);
        const r_diff = Math.abs(ri - r);
        const s_diff = Math.abs(si - s);
        if (q_diff > r_diff && q_diff > s_diff) {
            qi = -ri - si;
        } else {
            if (r_diff > s_diff) {
                ri = -qi - si;
            } else {
                si = -qi - ri;
            }
        }

        return Hex._hexToString(qi, ri, si);
    }

    /**
     * Get position from hex.
     *
     * @param {string} hex - Hex as "<q,r,s>" string
     * @returns {Vector} position
     */
    toPosition(hex: string): Vector {
        const M = this._hexLayoutType;
        const [q, r] = Hex._hexFromString(hex);

        const x = (M.f0 * q + M.f1 * r) * this._halfSize;
        const y = (M.f2 * q + M.f3 * r) * this._halfSize;
        const z = this._tableHeight;
        return new Vector(x, y, z);
    }

    /**
     * Get positions of hex corners.
     * First at "top right", winding counterclockwise.
     *
     * @param {string} hex - Hex as "<q,r,s>" string
     * @return {Array} list of position Vectors
     */
    corners(hex: string): Array<Vector> {
        const M = this._hexLayoutType;
        const center = this.toPosition(hex);
        const result = [];
        const z = this._tableHeight;
        for (let i = 0; i < 6; i++) {
            const phi = (2 * Math.PI * (M.startAngle - i)) / 6;
            const x = center.x + this._halfSize * Math.cos(phi);
            const y = center.y + this._halfSize * Math.sin(phi);
            result.push(new Vector(x, y, z));
        }
        return result;
    }
}
