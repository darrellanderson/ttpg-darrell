import { Card, GameObject, Vector } from "@tabletop-playground/api";

export class Facing {
    static isFaceUp(obj: GameObject): boolean {
        if (obj instanceof Card) {
            return obj.isFaceUp();
        }
        const up: Vector = obj
            .getRotation()
            .getUpVector()
            .clampVectorMagnitude(1, 1);
        const dot: number = up.dot([0, 0, 1]);
        return dot > 0.8;
    }
}
