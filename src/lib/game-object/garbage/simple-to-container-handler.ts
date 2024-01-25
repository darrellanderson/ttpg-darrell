import { Container, GameObject, world } from "@tabletop-playground/api";
import { GarbageHandler } from "./garbage-container";
import { NSID } from "../../nsid/nsid";

/**
 * Recycle object(s) to a container, optionally matching owning slot.
 */
export class SimpleToContainerHandler implements GarbageHandler {
    private readonly _playerSlotToContainer: { [key: number]: Container } = {};
    private readonly _recycleObjectNsids: Set<string> = new Set<string>();
    private _requirePlayerSlot: boolean = false;
    private _containerNsid: string = "";

    public addRecycleObjectNsid(nsid: string): this {
        this._recycleObjectNsids.add(nsid);
        return this;
    }

    public setContainerNsid(nsid: string): this {
        this._containerNsid = nsid;
        return this;
    }

    public setRequireOwningPlayerSlot(value: boolean): this {
        this._requirePlayerSlot = value;
        return this;
    }

    // --------------------------------

    public canRecycle(obj: GameObject): boolean {
        const nsid = NSID.get(obj);
        return this._recycleObjectNsids.has(nsid);
    }

    public recycle(obj: GameObject): boolean {
        const container = this._getContainer(obj);
        if (!container) {
            return false;
        }
        const index = 0;
        const showAnimation = true;
        container.addObjects([obj], index, showAnimation);
        return true;
    }

    _getContainer(obj: GameObject): Container | undefined {
        const isMatch = (container: Container): boolean => {
            if (!container.isValid()) {
                return false; // deleted!
            }

            const containerNsid: string = NSID.get(container);
            if (containerNsid !== this._containerNsid) {
                return false; // wrong container type
            }

            if (this._requirePlayerSlot) {
                const objSlot = obj.getOwningPlayerSlot();
                const containerSlot = container.getOwningPlayerSlot();
                if (objSlot !== containerSlot) {
                    return false; // wrong owning player slot
                }
            }

            return true;
        };

        // Use cache if valid.
        const cacheKey = this._requirePlayerSlot
            ? obj.getOwningPlayerSlot()
            : -1;
        const cached = this._playerSlotToContainer[cacheKey];
        if (cached && isMatch(cached)) {
            return cached;
        }

        // Search for container.
        const skipContained = true;
        for (const obj of world.getAllObjects(skipContained)) {
            if (!(obj instanceof Container)) {
                continue;
            }
            if (isMatch(obj)) {
                this._playerSlotToContainer[cacheKey] = obj;
                return obj;
            }
        }
        return undefined;
    }
}
