import { GameObject } from "@tabletop-playground/api";
import { MockGameObject, MockVector } from "ttpg-mock";

import { Atop } from "./atop";

it("isAtop", () => {
    const obj: GameObject = new MockGameObject();
    const atop: Atop = new Atop(obj);

    // Object is 1x1x1 so extent is 0.5
    expect(atop.isAtop(new MockVector(0, 0, 0))).toBe(true);
    expect(atop.isAtop(new MockVector(1, 0, 0))).toBe(false);
});

it("isAtop (scaled)", () => {
    const obj: GameObject = new MockGameObject({ scale: [3, 3, 3] });
    const atop: Atop = new Atop(obj);

    expect(atop.isAtop(new MockVector(0, 0, 0))).toBe(true);
    expect(atop.isAtop(new MockVector(1, 0, 0))).toBe(true);
    expect(atop.isAtop(new MockVector(2, 0, 0))).toBe(false);
});
