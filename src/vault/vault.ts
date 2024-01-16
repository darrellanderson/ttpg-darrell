/**
 * Store arbitrarily large opaque data.
 * Data may overflow object size limit.
 */

import {
    Container,
    GameObject,
    ObjectType,
    world,
} from "@tabletop-playground/api";

const BLOCK_SIZE = 900; // setSavedData limit 1023 (vault metadata is extra!)
const BLOCKS_PER_OBJ = Math.floor((65536 - 2000) / (BLOCK_SIZE + 30)); // object size limit 64 KB

const KEY_VAULT_ROOT = "__VaultRoot__"; // find root container
const KEY_FREELIST = "__VaultFreeList__";

const KEY_NEXT_OBJECT_ID = "o";
const KEY_NEXT_BLOCK_INDEX = "i";
const KEY_BLOCK_DATA = "d";

type VaultBlockLocation = {
    obj: GameObject;
    index: number;
};

type VaultBlock = {
    data: string;
    next?: VaultBlockLocation;
};

/**
 * Store arbitrarily large opaque data.
 *
 * Creates a container, stored data gets broken up into chunks and spread
 * across objects inside that container.  If data exceeds the single object
 * limits it chains to a new object.
 *
 * Different data keys can store inside a shared object, creating more
 * objects only when the existing set fills.
 *
 * This does suffer from internal fragmentation; storing many very small
 * data entries wastes space.
 */
export class Vault {
    private readonly _root: Container;

    constructor() {
        for (const obj of world.getAllObjects()) {
            if (!(obj instanceof Container)) {
                continue;
            }
            if (obj.getSavedData(KEY_VAULT_ROOT)) {
                this._root = obj;
                return;
            }
        }

        // If we get here the vault root does not exist.  Create it.
        const templateId = "A44BAA604E0ED034CD67FA9502214AA7"; // container
        const container = world.createObjectFromTemplate(
            templateId,
            [0, 0, -10]
        );
        if (!container || !(container instanceof Container)) {
            throw new Error("unable to create root container");
        }
        container.setObjectType(ObjectType.NonInteractive);
        container.setSavedData("yes", KEY_VAULT_ROOT);
        container.setSavedData("[]", KEY_FREELIST);
        this._root = container;
    }

    delete(dataId: string): void {
        const firstBlockLocation: VaultBlockLocation | undefined =
            this._getRootEntry(dataId);
        if (!firstBlockLocation) {
            return;
        }
        const blocks: VaultBlock[] = this._getChain(firstBlockLocation);
        this._releaseBlock(firstBlockLocation);
        for (const block of blocks) {
            if (block.next) {
                this._releaseBlock(block.next);
            }
        }
        this._root.setSavedData("", dataId);
    }

    set(dataId: string, data: string): void {
        this.delete(dataId);

        if (data.length === 0) {
            return;
        }

        const n = Math.ceil(data.length / BLOCK_SIZE);

        // Split data into chunks.
        const dataChunks: string[] = [];
        for (let i = 0; i < data.length; i += BLOCK_SIZE) {
            const end = Math.min(i + BLOCK_SIZE, data.length);
            dataChunks.push(data.substring(i, end));
        }

        // Reserve block locations.
        const blockLocations: VaultBlockLocation[] = [];
        for (let i = 0; i < dataChunks.length; i++) {
            blockLocations.push(this._allocBlock());
        }

        // Create chained blocks.
        const blocks: VaultBlock[] = [];
        for (let i = 0; i < n; i++) {
            const block: VaultBlock = {
                data: dataChunks[i],
            };
            if (i < dataChunks.length - 1) {
                block.next = blockLocations[i + 1];
            }
            blocks.push(block);
        }

        // Save blocks.
        for (let i = 0; i < n; i++) {
            const blockLocation: VaultBlockLocation = blockLocations[i];
            const block: VaultBlock = blocks[i];
            const blockEnc: { [key: string]: any } = {
                [KEY_BLOCK_DATA]: block.data,
            };
            if (i < dataChunks.length - 1) {
                const nextLocation = blockLocations[i + 1];
                blockEnc[KEY_NEXT_BLOCK_INDEX] = nextLocation.index;
                if (blockLocation.obj !== nextLocation.obj) {
                    blockEnc[KEY_NEXT_OBJECT_ID] = nextLocation.obj.getId();
                }
            }
            blockLocation.obj.setSavedData(
                JSON.stringify(blockEnc),
                blockLocation.index.toString()
            );
        }

        // Save root entry.
        const rootEnc = {
            [KEY_NEXT_OBJECT_ID]: blockLocations[0].obj.getId(),
            [KEY_NEXT_BLOCK_INDEX]: blockLocations[0].index,
        };
        this._root.setSavedData(JSON.stringify(rootEnc), dataId);
    }

    get(dataId: string): string | undefined {
        const firstBlockLocation: VaultBlockLocation | undefined =
            this._getRootEntry(dataId);
        if (!firstBlockLocation) {
            return undefined;
        }
        const blocks: VaultBlock[] = this._getChain(firstBlockLocation);
        return blocks.map((block) => block.data).join("");
    }

    private _getRootEntry(dataId: string): VaultBlockLocation | undefined {
        if (dataId === KEY_FREELIST) {
            throw new Error("cannot use freelist key as data id");
        }
        const blockLocationEncData = this._root.getSavedData(dataId);
        if (!blockLocationEncData || blockLocationEncData.length === 0) {
            return undefined;
        }
        const blockLocationEnc = JSON.parse(blockLocationEncData);
        if (
            blockLocationEnc[KEY_NEXT_OBJECT_ID] === undefined ||
            blockLocationEnc[KEY_NEXT_BLOCK_INDEX] === undefined
        ) {
            throw new Error("bad objId or block index");
        }
        const obj = world.getObjectById(blockLocationEnc[KEY_NEXT_OBJECT_ID]);
        if (!obj) {
            throw new Error("bad obj");
        }
        return { obj, index: blockLocationEnc[KEY_NEXT_BLOCK_INDEX] };
    }

    /**
     * Read all blocks starting with the given location.
     *
     * @param blockLocation
     * @param processor
     */
    private _getChain(blockLocation: VaultBlockLocation): VaultBlock[] {
        const blocks: VaultBlock[] = [];

        do {
            const blockEncData = blockLocation.obj.getSavedData(
                blockLocation.index.toString()
            );
            if (!blockEncData || blockEncData.length === 0) {
                throw new Error("bad blockEncData");
            }
            const blockEnc = JSON.parse(blockEncData);
            if (blockEnc[KEY_BLOCK_DATA] === undefined) {
                throw new Error("missing block data");
            }
            const block: VaultBlock = {
                data: blockEnc[KEY_BLOCK_DATA],
            };
            if (blockEnc[KEY_NEXT_BLOCK_INDEX]) {
                let obj: GameObject | undefined;
                if (blockEnc[KEY_NEXT_OBJECT_ID]) {
                    obj = world.getObjectById(blockEnc[KEY_NEXT_OBJECT_ID]);
                    if (!obj) {
                        throw new Error("bad objId");
                    }
                } else {
                    obj = blockLocation.obj;
                }
                block.next = {
                    obj,
                    index: blockEnc[KEY_NEXT_BLOCK_INDEX],
                };
                blockLocation = block.next; // iterate to next block
            }
            blocks.push(block);
        } while (blocks[blocks.length - 1].next);
        return blocks;
    }

    /**
     * Reserve a block (index within a store file).
     * If store has no more free slots remove it from root available list.
     *
     * @returns
     */
    private _allocBlock(): VaultBlockLocation {
        // Get a store with free slot(s).
        let store: GameObject | undefined = this._getStore();
        if (!store) {
            store = this._allocStore();
        }

        // Get a free index, remove from freelist.
        const freelistData = store.getSavedData(KEY_FREELIST);
        if (!freelistData || freelistData.length === 0) {
            throw new Error("bad freelistData");
        }
        const freelist: number[] = JSON.parse(freelistData);
        if (!Array.isArray(freelist)) {
            throw new Error("freelist is not an array");
        }
        if (freelist.length === 0) {
            throw new Error("freelist empty");
        }
        const blockIndex: number = freelist.shift() ?? -1;
        store.setSavedData(JSON.stringify(freelist), KEY_FREELIST);

        // If that was the last block, remove from available stores.
        if (freelist.length === 0) {
            this._removeStoreId(store.getId());
        }

        return {
            obj: store,
            index: blockIndex,
        };
    }

    /**
     * Release a block (index within a store file).
     * If the store is no longer in use delete it.
     *
     * @param blockLocation
     */
    private _releaseBlock(blockLocation: VaultBlockLocation): void {
        const store = blockLocation.obj;

        // Push to the freelist.
        const freelistData = store.getSavedData(KEY_FREELIST);
        if (!freelistData || freelistData.length === 0) {
            throw new Error("bad freelistData");
        }
        const freelist: number[] = JSON.parse(freelistData);
        if (!Array.isArray(freelist)) {
            throw new Error("freelist is not an array");
        }
        freelist.push(blockLocation.index);
        store.setSavedData(JSON.stringify(freelist), KEY_FREELIST);

        // If the freelist was empty, add to available stores.
        if (freelist.length === 1) {
            this._addStoreId(store.getId());
        }

        // If the freelist is everything, delete the store.
        if (freelist.length === BLOCKS_PER_OBJ) {
            this._releaseStore(store);
        }
    }

    private _addStoreId(objId: string): void {
        const rootStoreIdsData = this._root.getSavedData(KEY_FREELIST);
        if (!rootStoreIdsData || rootStoreIdsData.length === 0) {
            throw new Error("bad rootStoreData");
        }
        const rootStoreIds: string[] = JSON.parse(rootStoreIdsData);
        if (!Array.isArray(rootStoreIds)) {
            throw new Error("rootStoreData not array");
        }
        rootStoreIds.push(objId);
        this._root.setSavedData(JSON.stringify(rootStoreIds), KEY_FREELIST);
    }

    private _removeStoreId(objId: string): void {
        const rootStoreIdsData = this._root.getSavedData(KEY_FREELIST);
        if (!rootStoreIdsData || rootStoreIdsData.length === 0) {
            throw new Error("bad rootStoreData");
        }
        const rootStoreIds: string[] = JSON.parse(rootStoreIdsData);
        if (!Array.isArray(rootStoreIds)) {
            throw new Error("rootStoreData not array");
        }
        const idx = rootStoreIds.indexOf(objId);
        if (idx < 0) {
            throw new Error("file not in root freelist");
        }
        rootStoreIds.splice(idx, 1);
        this._root.setSavedData(JSON.stringify(rootStoreIds), KEY_FREELIST);
    }

    /**
     * Get a store from the list of stores with free slots.
     *
     * @returns
     */
    private _getStore(): GameObject | undefined {
        // Return entry from available stores.
        const rootStoreIdsData = this._root.getSavedData(KEY_FREELIST);
        if (!rootStoreIdsData || rootStoreIdsData.length === 0) {
            throw new Error("bad rootStoreData");
        }
        const rootStoreIds: string[] = JSON.parse(rootStoreIdsData);
        if (!Array.isArray(rootStoreIds)) {
            throw new Error("rootStoreData not array");
        }

        if (rootStoreIds.length > 0) {
            const objId = rootStoreIds[0];
            const obj = world.getObjectById(objId);
            if (!obj) {
                throw new Error("bad obj");
            }
            return obj;
        }

        return undefined;
    }

    /**
     * Create a new store, add to the list of stores with free slots.
     *
     * @returns
     */
    private _allocStore(): GameObject {
        // Create store object and place inside root container.
        const templateId = "83FDE12C4E6D912B16B85E9A00422F43"; // cube
        const obj = world.createObjectFromTemplate(templateId, [0, 0, 0]);
        if (!obj) {
            throw new Error("unable to create store");
        }
        this._root.addObjects([obj]);

        // Set free list.
        const freelist: number[] = [];
        for (let i = 0; i < BLOCKS_PER_OBJ; i++) {
            freelist.push(i);
        }
        obj.setSavedData(JSON.stringify(freelist), KEY_FREELIST);

        // Add to root freelist of available stores.
        this._addStoreId(obj.getId());
        return obj;
    }

    /**
     * Remove a store from the list of stores with free slots, then
     * delete the store object.
     *
     * @param obj
     */
    private _releaseStore(obj: GameObject) {
        // Remove from root freelist of available stores.
        this._removeStoreId(obj.getId());

        // Destroy store object.
        obj.destroy();
    }
}
