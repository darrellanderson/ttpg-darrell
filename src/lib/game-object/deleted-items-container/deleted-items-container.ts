import {
    Card,
    Container,
    GameObject,
    globalEvents,
    world,
} from "@tabletop-playground/api";
import { NSID } from "../../nsid/nsid";

/**
 * Add the obj version of this to a container to make a copy of deleted objects.
 */
export class DeletedItemsContainer {
    public static IGNORE_TAG = "_deleted_items_ignore_";
    private static readonly _ignoreNSIDs: Set<string> = new Set<string>();

    private readonly _container: Container;
    private readonly _oneTimeSkipObjIds: Set<string> = new Set<string>();

    /**
     * Destroy the object without adding to a deleted items container.
     *
     * @param obj
     */
    static destroyWithoutCopying(obj: GameObject): void {
        const tags: Array<string> = obj.getTags();
        tags.push(this.IGNORE_TAG);
        obj.setTags(tags);
        obj.destroy();
    }

    /**
     * Never copy these deleted items.
     *
     * @param nsids
     */
    static ignoreNSIDs(nsids: Array<string>): void {
        for (const nsid of nsids) {
            DeletedItemsContainer._ignoreNSIDs.add(nsid);
        }
    }

    constructor(container: Container) {
        if (!container || !(container instanceof Container)) {
            throw new Error("missing/bad container");
        }
        this._container = container;

        // Clone destroyed objects and add to container.
        const onDestroyed: (obj: GameObject) => void = (obj) => {
            this._onObjectDestroyed(obj);
        };
        globalEvents.onObjectDestroyed.add(onDestroyed);
        container.onDestroyed.add(() => {
            globalEvents.onObjectDestroyed.remove(onDestroyed);
        });

        // Watch out for cards getting added to decks.
        const onInserted = (
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            card: Card,
            insertedCard: Card
        ) => {
            // Setting a tag or object saved data is not present on the version
            // seen by onDestroyed.  Rather than adding a flag to the object,
            // keep a short memory and ignore the destroyed.
            const id = insertedCard.getId();
            this._oneTimeSkipObjIds.add(id);
        };
        const onCreated = (obj: GameObject) => {
            if (obj instanceof Card) {
                obj.onInserted.add(onInserted);
            }
        };
        const skipContained: boolean = false;
        for (const obj of world.getAllObjects(skipContained)) {
            onCreated(obj);
        }
        globalEvents.onObjectCreated.add(onCreated);
        container.onDestroyed.add(() => {
            globalEvents.onObjectCreated.remove(onCreated);
        });
    }

    _onObjectDestroyed(obj: GameObject) {
        const id = obj.getId();
        if (this._oneTimeSkipObjIds.has(id)) {
            this._oneTimeSkipObjIds.delete(id);
            return; // card deleted because added to a deck
        }

        const nsid: string = NSID.get(obj);
        if (DeletedItemsContainer._ignoreNSIDs.has(nsid)) {
            return; // user ignored via NSID
        }

        if (obj.getTags().includes(DeletedItemsContainer.IGNORE_TAG)) {
            return; // user ignored via tag
        }

        if (obj.getTemplateId() === this._container.getTemplateId()) {
            return; // do not keep other versions of this object
        }

        const json: string = obj.toJSONString(); // empty if deleted by script (?)
        if (json.length > 0) {
            const clone: GameObject | undefined = world.createObjectFromJSON(
                json,
                [0, 0, 0]
            );
            if (clone) {
                this._container.addObjects([clone]);
            }
        }
    }
}
