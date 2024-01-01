import { GameObject, SnapPoint, world } from "@tabletop-playground/api";
import { GarbageHandler } from "./garbage-container";
import { NSID } from "../nsid/nsid";

/**
 * Recycle an object to a specific snap point with the matching tag.
 */
export class SimpleToSnapPointHandler implements GarbageHandler {
    private readonly _recycleObjectNsids: Set<string> = new Set<string>();
    private _matNsid: string = "";
    private _snapPointTag: string = "";
    private _cachedSnapPoint: SnapPoint | undefined;

    public addRecycleObjectNsid(nsid: string): this {
        this._recycleObjectNsids.add(nsid);
        return this;
    }

    public setMatNsid(nsid: string): this {
        this._matNsid = nsid;
        return this;
    }

    public setSnapPointTag(tag: string): this {
        this._snapPointTag = tag;
        return this;
    }

    public canRecycle(obj: GameObject): boolean {
        const nsid = NSID.get(obj);
        return this._recycleObjectNsids.has(nsid);
    }

    public recycle(obj: GameObject): boolean {
        const snapPoint = this._getSnapPoint();
        if (!snapPoint) {
            return false;
        }

        // Reject if something already snapped there.
        const otherObj: GameObject | undefined = snapPoint.getSnappedObject();
        if (otherObj && otherObj.getSnappedToPoint() === snapPoint) {
            return false;
        }

        obj.setPosition(snapPoint.getGlobalPosition().add([0, 0, 10]), 1);
        obj.snapToGround(); // get in range
        obj.snap();
        return true;
    }

    _getSnapPoint(): SnapPoint | undefined {
        // Use cache if valid.
        if (
            this._cachedSnapPoint &&
            this._cachedSnapPoint.getParentObject()?.isValid()
        ) {
            return this._cachedSnapPoint;
        }

        // Search for mat.
        const skipContained = true;
        for (const obj of world.getAllObjects(skipContained)) {
            const nsid = NSID.get(obj);
            if (nsid !== this._matNsid) {
                continue;
            }
            for (const snapPoint of obj.getAllSnapPoints()) {
                if (snapPoint.getTags().includes(this._snapPointTag)) {
                    this._cachedSnapPoint = snapPoint;
                    return snapPoint;
                }
            }
        }
        return undefined;
    }
}
