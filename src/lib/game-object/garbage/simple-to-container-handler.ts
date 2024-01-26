import { Container, GameObject } from "@tabletop-playground/api";
import { GarbageHandler } from "./garbage-container";
import { NSID } from "../../nsid/nsid";
import { Find } from "../../find/find";

/**
 * Recycle object(s) to a container, optionally matching owning slot.
 */
export class SimpleToContainerHandler implements GarbageHandler {
    private readonly _recycleObjectNsids: Set<string> = new Set<string>();
    private readonly _find: Find = new Find();

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
        const playerSlot: number | undefined = this._requirePlayerSlot
            ? obj.getOwningPlayerSlot()
            : undefined;
        const container: Container | undefined = this._find.findContainer(
            this._containerNsid,
            playerSlot
        );
        if (!container) {
            return false;
        }
        const index = 0;
        const showAnimation = true;
        container.addObjects([obj], index, showAnimation);
        return true;
    }
}
