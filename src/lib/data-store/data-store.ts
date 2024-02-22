import {
    Container,
    GameObject,
    ObjectType,
    world,
} from "@tabletop-playground/api";
import { NamespacedId } from "../namespace-id/namespace-id";

const BLOCK_SIZE = 512; // setSavedData limit 1023 (json trimmings, metadata is extra!)
const BLOCK_METADATA_SIZE = 32; // be conservative
const OBJ_SIZE = 65536 - 20; // 64 KB max, leave room for json trimmings
const BLOCKS_PER_OBJ = Math.floor(
    OBJ_SIZE / (BLOCK_SIZE + BLOCK_METADATA_SIZE)
);

const KEY_FREELIST = "f";
const KEY_NEXT_OBJECT_ID = "o";
const KEY_NEXT_BLOCK_INDEX = "i";
const KEY_BLOCK_DATA = "d";

type DataBlockLocation = {
    obj: GameObject;
    index: number;
};

type DataBlock = {
    data: string;
    next?: DataBlockLocation;
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
export class DataStore {
    private readonly _root: Container;

    /**
     * constructor
     *
     * @param dataStoreId - each store MUST have a different id
     */
    constructor(dataStoreId: NamespacedId) {
        let rootObj: GameObject | undefined;

        // Check if this store is already registered.
        const globalKey = `__DataStore:${dataStoreId}__`;
        const rootObjId: string = world.getSavedData(globalKey);
        if (rootObjId && rootObjId.length > 0) {
            rootObj = world.getObjectById(rootObjId);
        }

        // If not, create a new root container.
        if (!rootObj) {
            const templateId = "A44BAA604E0ED034CD67FA9502214AA7"; // container
            rootObj = world.createObjectFromTemplate(templateId, [0, 0, -10]);
            if (rootObj) {
                rootObj.setObjectType(ObjectType.NonInteractive);
                rootObj.setSavedData("[]", KEY_FREELIST);
                world.setSavedData(rootObj.getId(), globalKey);
            }
        }

        if (!rootObj || !(rootObj instanceof Container)) {
            throw new Error(
                "DataStore unable to find or create root container"
            );
        }
        this._root = rootObj;
    }

    /**
     * Remove data.
     *
     * @param dataId
     * @returns
     */
    delete(dataId: NamespacedId): void {
        const firstBlockLocation: DataBlockLocation | undefined =
            this._getRootEntry(dataId);
        if (!firstBlockLocation) {
            return;
        }
        const blocks: DataBlock[] = this._getChain(firstBlockLocation);
        this._releaseBlock(firstBlockLocation);
        for (const block of blocks) {
            if (block.next) {
                this._releaseBlock(block.next);
            }
        }
        this._root.setSavedData("", dataId);
    }

    /**
     * Add or replace data.
     *
     * @param dataId
     * @param data
     * @returns
     */
    set(dataId: NamespacedId, data: string): void {
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
        const blockLocations: DataBlockLocation[] = [];
        for (let i = 0; i < dataChunks.length; i++) {
            blockLocations.push(this._allocBlock());
        }

        // Create chained blocks.
        const blocks: DataBlock[] = [];
        for (let i = 0; i < n; i++) {
            const data: string | undefined = dataChunks[i];
            if (data) {
                const block: DataBlock = {
                    data,
                };
                if (i < dataChunks.length - 1) {
                    block.next = blockLocations[i + 1];
                }
                blocks.push(block);
            }
        }

        // Save blocks.
        for (let i = 0; i < n; i++) {
            const blockLocation: DataBlockLocation | undefined =
                blockLocations[i];
            if (!blockLocation) {
                throw new Error("missing block location");
            }
            const block: DataBlock | undefined = blocks[i];
            if (!block) {
                throw new Error("missing block");
            }
            const blockEnc: { [key: string]: string | number } = {
                [KEY_BLOCK_DATA]: block.data,
            };
            if (i < dataChunks.length - 1) {
                const nextLocation: DataBlockLocation | undefined =
                    blockLocations[i + 1];
                if (!nextLocation) {
                    throw new Error("missing next");
                }
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
        const id: string | undefined = blockLocations[0]?.obj.getId();
        const index: number | undefined = blockLocations[0]?.index;
        if (id === undefined || index === undefined) {
            throw new Error("missing root");
        }
        const rootEnc = {
            [KEY_NEXT_OBJECT_ID]: id,
            [KEY_NEXT_BLOCK_INDEX]: index,
        };
        this._root.setSavedData(JSON.stringify(rootEnc), dataId);
    }

    /**
     * Get data.
     *
     * @param dataId
     * @returns
     */
    get(dataId: NamespacedId): string | undefined {
        const firstBlockLocation: DataBlockLocation | undefined =
            this._getRootEntry(dataId);
        if (!firstBlockLocation) {
            return undefined;
        }
        const blocks: DataBlock[] = this._getChain(firstBlockLocation);
        return blocks.map((block) => block.data).join("");
    }

    /**
     * Get the first data block location for the data entry.
     *
     * @param dataId
     * @returns
     */
    private _getRootEntry(dataId: NamespacedId): DataBlockLocation | undefined {
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
    private _getChain(blockLocation: DataBlockLocation): DataBlock[] {
        const blocks: DataBlock[] = [];

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
            const block: DataBlock = {
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
        } while (blocks[blocks.length - 1]?.next);
        return blocks;
    }

    /**
     * Reserve a block (index within a store file).
     * If store has no more free slots remove it from root available list.
     *
     * @returns
     */
    private _allocBlock(): DataBlockLocation {
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
            this._removeStoreFromAvailable(store);
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
    private _releaseBlock(blockLocation: DataBlockLocation): void {
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
            this._addStoreToAvailable(store);
        }

        // If the freelist is everything, delete the store.
        if (freelist.length === BLOCKS_PER_OBJ) {
            this._releaseStore(store);
        }
    }

    /**
     * Add store to available with-capacity list (store has more room).
     *
     * @param obj
     */
    private _addStoreToAvailable(obj: GameObject): void {
        const rootStoreIdsData = this._root.getSavedData(KEY_FREELIST);
        if (!rootStoreIdsData || rootStoreIdsData.length === 0) {
            throw new Error("bad rootStoreData");
        }
        const rootStoreIds: string[] = JSON.parse(rootStoreIdsData);
        if (!Array.isArray(rootStoreIds)) {
            throw new Error("rootStoreData not array");
        }
        rootStoreIds.push(obj.getId());
        this._root.setSavedData(JSON.stringify(rootStoreIds), KEY_FREELIST);
    }

    /**
     * Remove store from available with-capcity list (store is full).
     *
     * @param obj
     */
    private _removeStoreFromAvailable(obj: GameObject): void {
        const rootStoreIdsData = this._root.getSavedData(KEY_FREELIST);
        if (!rootStoreIdsData || rootStoreIdsData.length === 0) {
            throw new Error("bad rootStoreData");
        }
        const rootStoreIds: string[] = JSON.parse(rootStoreIdsData);
        if (!Array.isArray(rootStoreIds)) {
            throw new Error("rootStoreData not array");
        }
        const idx = rootStoreIds.indexOf(obj.getId());
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
            const objId: string | undefined = rootStoreIds[0];
            if (!objId) {
                throw new Error("missing objId");
            }
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
        this._addStoreToAvailable(obj);
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
        this._removeStoreFromAvailable(obj);

        // Destroy store object.
        obj.destroy();
    }
}
