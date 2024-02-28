import { GameObject, Player, Vector, world } from "@tabletop-playground/api";
import { NSID } from "../nsid/nsid";
import { IGlobal } from "../global/i-global";
import { GarbageContainer } from "../game-object/garbage/garbage-container";
import { DeletedItemsContainer } from "../game-object/deleted-items-container/deleted-items-container";
import { Spawn } from "../spawn/spawn";

export type SwapSplitCombineRule = {
    src: {
        nsids: Array<string>;
        count: number;
    };
    dst: {
        nsid: string;
        count: number;
    };
    repeat: boolean;
};

/**
 * Replace one or more objects with others.  Applies the first matching rule.
 *
 * Useful to replace currency items with upper/lower versions.
 */
export class SwapSplitCombine implements IGlobal {
    private readonly _nsids: Set<string> = new Set<string>();
    private readonly _rules: Array<SwapSplitCombineRule>;
    private readonly _playerSlotToInProgressObjIdSet: {
        [key: number]: Set<string>;
    } = {};

    private readonly _primaryActionHandler: (
        obj: GameObject,
        player: Player
    ) => void = (obj: GameObject, player: Player): void => {
        this._go(obj, player);
    };

    private readonly _objectCreatedHandler: (obj: GameObject) => void = (
        obj: GameObject
    ): void => {
        const nsid: string = NSID.get(obj);
        if (this._nsids.has(nsid)) {
            obj.onPrimaryAction.add(this._primaryActionHandler);
        }
    };

    constructor(rules: Array<SwapSplitCombineRule>) {
        this._rules = rules;

        for (const rule of rules) {
            for (const nsid of rule.src.nsids) {
                this._nsids.add(nsid);
            }
        }
    }

    /**
     * Add "r" handler to relevant objects.
     */
    init(): void {
        for (const obj of world.getAllObjects()) {
            this._objectCreatedHandler(obj);
        }
    }

    _go(rObj: GameObject, player: Player): void {
        // Event fires for each selected object, suppress extra calls.
        const playerSlot: number = player.getSlot();
        let inProgressObjIdSet: Set<string> | undefined =
            this._playerSlotToInProgressObjIdSet[playerSlot];
        if (!inProgressObjIdSet) {
            inProgressObjIdSet = new Set<string>();
            this._playerSlotToInProgressObjIdSet[playerSlot] =
                inProgressObjIdSet;
        }
        if (inProgressObjIdSet.has(rObj.getId())) {
            return; // already working on it
        }

        // Group by NSIDs.
        const nsidToObjs: { [key: string]: Array<GameObject> } =
            this._getHoveredAndSelectedObjs(rObj, player);

        // Update in-progress objects, clear next frame.
        for (const objs of Object.values(nsidToObjs)) {
            for (const obj of objs) {
                inProgressObjIdSet.add(obj.getId());
            }
        }
        process.nextTick(() => {
            delete this._playerSlotToInProgressObjIdSet[playerSlot];
        });

        this._applyRules(nsidToObjs, player);
    }

    _getHoveredAndSelectedObjs(
        rObj: GameObject,
        player: Player
    ): { [key: string]: Array<GameObject> } {
        // Get selected objects, add the "r" object player was hovering over.
        const objs: Array<GameObject> = player.getSelectedObjects();
        if (!objs.includes(rObj)) {
            objs.push(rObj);
        }

        // Group by NSID.
        const nsidToObjs: { [key: string]: Array<GameObject> } = {};
        for (const obj of objs) {
            const nsid: string = NSID.get(obj);
            let nsidObjs: Array<GameObject> | undefined = nsidToObjs[nsid];
            if (!nsidObjs) {
                nsidObjs = [];
                nsidToObjs[nsid] = nsidObjs;
            }
            nsidObjs.push(obj);
        }
        return nsidToObjs;
    }

    /**
     * Apply the first matching rule.
     *
     * @param nsidToObjs
     * @param player
     */
    _applyRules(
        nsidToObjs: { [key: string]: Array<GameObject> },
        player: Player
    ): void {
        for (const rule of this._rules) {
            let count = 0;
            for (const nsid of rule.src.nsids) {
                const objs: Array<GameObject> | undefined = nsidToObjs[nsid];
                count += objs?.length ?? 0;
            }
            if (count >= rule.src.count) {
                this._applyRule(rule, nsidToObjs, player);
            }
        }
    }

    _applyRule(
        rule: SwapSplitCombineRule,
        nsidToObjs: { [key: string]: Array<GameObject> },
        player: Player
    ) {
        // Gather src objects.
        let srcObjs: Array<GameObject> = [];
        for (const nsid of rule.src.nsids) {
            srcObjs.push(...(nsidToObjs[nsid] ?? []));
        }

        // Calculate how many times to apply rule, trim
        // to exact src objects to recycle.
        const applyCount = rule.repeat
            ? Math.floor(srcObjs.length / rule.src.count)
            : 1;
        srcObjs = srcObjs.splice(0, applyCount * rule.src.count);

        // Recycle src objects.
        for (const obj of srcObjs) {
            if (!GarbageContainer.tryRecycle(obj)) {
                DeletedItemsContainer.destroyWithoutCopying(obj);
            }
        }

        // Create dst objects.
        const pos: Vector = player.getCursorPosition();
        pos.z = world.getTableHeight() + 10;
        for (let i = 0; i < applyCount; i++) {
            for (let j = 0; j < rule.dst.count; j++) {
                const dstObj: GameObject = Spawn.spawnOrThrow(
                    rule.dst.nsid,
                    pos
                );
                dstObj.snapToGround();

                const currentRotation = true;
                const includeGeometry = false;
                pos.y +=
                    dstObj.getExtent(currentRotation, includeGeometry).y / 2;
            }
        }
    }
}
