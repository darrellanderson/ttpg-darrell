import {
    Dice,
    Player,
    Rotator,
    SnapPoint,
    Vector,
} from "@tabletop-playground/api";

const snappedHandler = (
    dice: Dice,
    player: Player,
    snapPoint: SnapPoint,
    grabPosition: Vector | [x: number, y: number, z: number],
    grabRotation: Rotator | [pitch: number, yaw: number, roll: number]
): void => {
    // Snap point flipped to first face, get yaw.
    const yaw = dice.getRotation().yaw;

    // Read face value from what it was when grabbed.
    dice.setRotation(grabRotation);
    const faceIndex = dice.getCurrentFaceIndex();

    // Set face (resets rotation to native), rotate yaw in that face axis.
    dice.setCurrentFace(faceIndex);
    dice.setRotation(dice.getRotation().compose([0, yaw, 0]));
};

/**
 * Preserve current face while applying snap point rotation.
 */
export class DiceSnapRotation {
    constructor(dice: Dice) {
        if (!dice || !(dice instanceof Dice)) {
            throw new Error("not Dice");
        }
        dice.onSnapped.add(snappedHandler);
    }
}
