import { GameObject, Vector } from "@tabletop-playground/api";

/**
 * Is a position within an object's XY space? (account for scale and rotaton)
 * Becomes invalid if object size/scale changes.
 */
export class Atop {
    private readonly _obj: GameObject;
    private readonly _scaledExtent: Vector;

    constructor(obj: GameObject) {
        this._obj = obj;
        this._scaledExtent = obj.getExtent(false, false);

        // GameObject.getExtent accounts for scale.
        // worldToLocal undoes scale.
        // Compute extent is unscaled local space.
        const scale: Vector = obj.getScale();
        this._scaledExtent.x /= scale.x;
        this._scaledExtent.y /= scale.y;
    }

    isAtop(pos: Vector): boolean {
        const local: Vector = this._obj.worldPositionToLocal(pos);
        return (
            Math.abs(local.x) <= this._scaledExtent.x &&
            Math.abs(local.y) <= this._scaledExtent.y
        );
    }
}
