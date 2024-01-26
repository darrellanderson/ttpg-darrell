import { GameObject, SnapPoint } from "@tabletop-playground/api";
import { GarbageHandler } from "./garbage-container";
import { NSID } from "../../nsid/nsid";
import { Rotator } from "ttpg-mock";
import { Find } from "../../find/find";

/**
 * Recycle an object to a specific snap point with the matching tag.
 * Requires snap point not already occupied.
 * Expects snap point is unique; does not look beyond first match.
 */
export class SimpleToSnapPointHandler implements GarbageHandler {
    private readonly _recycleObjectNsids: Set<string> = new Set<string>();
    private readonly _find: Find = new Find();

    private _snapPointTag: string = "";
    private _preSnapRotation: Rotator | undefined;

    public addRecycleObjectNsid(nsid: string): this {
        this._recycleObjectNsids.add(nsid);
        return this;
    }

    public setSnapPointTag(tag: string): this {
        this._snapPointTag = tag;
        return this;
    }

    public setPreSnapRotation(rot: Rotator): this {
        this._preSnapRotation = rot;
        return this;
    }

    // --------------------------------

    public canRecycle(obj: GameObject): boolean {
        const nsid = NSID.get(obj);
        return this._recycleObjectNsids.has(nsid);
    }

    public recycle(obj: GameObject): boolean {
        const snapPoint: SnapPoint | undefined = this._find.findSnapPointByTag(
            this._snapPointTag
        );
        if (!snapPoint) {
            return false;
        }

        // Reject if something already snapped there.
        const otherObj: GameObject | undefined = snapPoint.getSnappedObject();
        if (otherObj && otherObj.getSnappedToPoint() === snapPoint) {
            return false;
        }

        obj.setPosition(snapPoint.getGlobalPosition().add([0, 0, 10]), 1);
        if (this._preSnapRotation) {
            obj.setRotation(this._preSnapRotation);
        }
        obj.snapToGround(); // get in range
        obj.snap();
        return true;
    }
}
