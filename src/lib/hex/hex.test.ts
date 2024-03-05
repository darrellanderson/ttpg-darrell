import { Vector } from "@tabletop-playground/api";
import { HEX_LAYOUT_FLAT, HEX_LAYOUT_POINTY, Hex, HexType } from "./hex";

const HALF_SIZE: number = 5.77735 * 1.5;
const HEX: Hex = new Hex(HEX_LAYOUT_POINTY, HALF_SIZE);

it("static neighbors", () => {
    const hex = "<0,0,0>";
    const neighbors = Hex.neighbors(hex);
    expect(neighbors).toEqual([
        "<1,0,-1>",
        "<1,-1,0>",
        "<0,-1,1>",
        "<-1,0,1>",
        "<-1,1,0>",
        "<0,1,-1>",
    ]);
});

it("static _hexFromString (invalid HexType)", () => {
    expect(() => {
        Hex._hexFromString("nope" as HexType);
    }).toThrow();
});

it("static _hexFromString (number mismatch)", () => {
    expect(() => {
        Hex._hexFromString("<0,0,1>");
    }).toThrow();
});

it("constructor", () => {
    new Hex(HEX_LAYOUT_POINTY, HALF_SIZE);
});

it("fromPosition", () => {
    const pos: Vector = new Vector(0, 0, 0);
    let hex: HexType = HEX.fromPosition(pos);
    expect(hex).toEqual("<0,0,0>");

    // Z does not matter.
    pos.z = 10;
    hex = HEX.fromPosition(pos);
    expect(hex).toEqual("<0,0,0>");

    // +Y, two rings east.
    pos.x = 0;
    pos.y = HALF_SIZE * 3;
    hex = HEX.fromPosition(pos);
    expect(hex).toEqual("<-1,2,-1>");
});

it("toPosition", () => {
    let hex: HexType = "<0,0,0>";
    let pos: Vector = HEX.toPosition(hex);
    expect(pos.x).toEqual(0);
    expect(pos.y).toEqual(0);
    expect(pos.z).toEqual(0);

    // +Y, two rings east.
    hex = "<-1,2,-1>";
    pos = HEX.toPosition(hex);
    expect(pos.x).toBeCloseTo(0);
    expect(pos.y).toBeCloseTo(HALF_SIZE * 3);
    expect(pos.z).toEqual(0);
});

it("to/from grid (pointy)", () => {
    const pointy = new Hex(HEX_LAYOUT_POINTY, 1);
    for (let q = -10; q <= 10; q++) {
        for (let r = -10; r <= 10; r++) {
            const s = -(q + r);
            const hex: HexType = Hex._hexToString(q, r, s);
            const pos: Vector = pointy.toPosition(hex);
            const hex2: HexType = pointy.fromPosition(pos);
            const pos2: Vector = pointy.toPosition(hex2);
            expect(hex2).toEqual(hex);
            expect(pos2.toString()).toEqual(pos.toString());
        }
    }
});

it("to/from grid (flat)", () => {
    const flat = new Hex(HEX_LAYOUT_FLAT, 1);
    for (let q = -10; q <= 10; q++) {
        for (let r = -10; r <= 10; r++) {
            const s = -(q + r);
            const hex: HexType = Hex._hexToString(q, r, s);
            const pos: Vector = flat.toPosition(hex);
            const hex2: HexType = flat.fromPosition(pos);
            const pos2: Vector = flat.toPosition(hex2);
            expect(hex2).toEqual(hex);
            expect(pos2.toString()).toEqual(pos.toString());
        }
    }
});

it("corners", () => {
    const hex: HexType = "<0,0,0>";
    const corners: Array<Vector> = HEX.corners(hex);
    expect(corners.length).toEqual(6);

    const top = (HALF_SIZE * Math.sqrt(3)) / 2;
    const halfRight = HALF_SIZE / 2;
    const right = HALF_SIZE;
    const halfLeft = -halfRight;
    const left = -right;
    const bottom = -top;

    // top-right
    expect(corners[0]?.x).toBeCloseTo(top);
    expect(corners[0]?.y).toBeCloseTo(halfRight);

    // top-left
    expect(corners[1]?.x).toBeCloseTo(top);
    expect(corners[1]?.y).toBeCloseTo(halfLeft);

    // left
    expect(corners[2]?.x).toBeCloseTo(0);
    expect(corners[2]?.y).toBeCloseTo(left);

    // bottom-left
    expect(corners[3]?.x).toBeCloseTo(bottom);
    expect(corners[3]?.y).toBeCloseTo(halfLeft);

    // bottom-right
    expect(corners[4]?.x).toBeCloseTo(bottom);
    expect(corners[4]?.y).toBeCloseTo(halfRight);

    // bottom-left
    expect(corners[5]?.x).toBeCloseTo(0);
    expect(corners[5]?.y).toBeCloseTo(right);
});

it("to/from cartesian", () => {
    const hexToCartesian: { [key: HexType]: { left: number; top: number } } = {
        // Origin.
        "<0,0,0>": { left: 0, top: 0 },

        // Distance 1.
        "<1,0,-1>": { left: 0, top: 1 }, // north
        "<1,-1,0>": { left: -1, top: 0 }, // northwest
        "<0,-1,1>": { left: -1, top: -1 }, // southwest
        "<-1,0,1>": { left: 0, top: -1 }, // south
        "<-1,1,0>": { left: 1, top: -1 }, // southeast
        "<0,1,-1>": { left: 1, top: 0 }, // northeast

        // Distance 2.
        "<2,0,-2>": { left: 0, top: 2 }, // north
        "<2,-2,0>": { left: -2, top: 1 }, // northwest
        "<0,-2,2>": { left: -2, top: -1 }, // southwest
        "<-2,0,2>": { left: 0, top: -2 }, // south
        "<-2,2,0>": { left: 2, top: -1 }, // southeast
        "<0,2,-2>": { left: 2, top: 1 }, // northeast
    };
    for (const [hex, cartesian] of Object.entries(hexToCartesian)) {
        const outCart: { left: number; top: number } = HEX.toCartesian(
            hex as HexType
        );
        const outHex: HexType = HEX.fromCartesian(outCart);
        expect(outCart).toEqual(cartesian);
        expect(outHex).toEqual(hex);
    }
});
