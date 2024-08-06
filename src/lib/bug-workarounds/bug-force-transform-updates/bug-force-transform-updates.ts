import { GameObject, globalEvents, world } from "@tabletop-playground/api";
import { IGlobal } from "../../global/i-global";

export const DELTA: number = 0.021;

/**
 * Object transforms aren't getting replicated reliably.
 * When an object stops moving, force a few transform updates.
 */
export class BugForceTransformUpdates implements IGlobal {
    private readonly _idToRemainingPokeCount: Map<string, number> = new Map();

    // Only add if not already processing
    readonly _maybeStartPoking = (obj: GameObject): void => {
        const id: string = obj.getId();
        const count: number | undefined = this._idToRemainingPokeCount.get(id);
        if (count === undefined) {
            this._idToRemainingPokeCount.set(id, 3);
        }
    };

    init(): void {
        const linkObj = (obj: GameObject): void => {
            obj.onMovementStopped.add(this._maybeStartPoking);
            obj.onSnapped.add(this._maybeStartPoking);
        };
        for (const obj of world.getAllObjects()) {
            linkObj(obj);
        }
        globalEvents.onObjectCreated.add(linkObj);

        setInterval(() => {
            this.pokeAll();
        }, 100);
    }

    pokeAll(): void {
        for (const [id, count] of this._idToRemainingPokeCount) {
            const obj: GameObject | undefined = world.getObjectById(id);
            if (!obj || !obj.isValid() || count < -1 || obj.isHeld()) {
                this._idToRemainingPokeCount.delete(id);
            } else if (count >= 0) {
                this._idToRemainingPokeCount.set(id, count - 1);
                const dir = count % 2 === 1 ? 1 : -1;
                this.poke(obj, dir);
            }
        }
    }

    poke(obj: GameObject, dir: number): void {
        const pos = obj.getPosition();
        const rot = obj.getRotation();
        pos.x += dir * DELTA;
        rot.yaw += dir * DELTA;
        obj.setPosition(pos);
        obj.setRotation(rot);
    }
}
