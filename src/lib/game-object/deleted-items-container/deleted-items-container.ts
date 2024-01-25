import {
    Card,
    Container,
    GameObject,
    globalEvents,
    refContainer,
    world,
} from "@tabletop-playground/api";
import { NSID } from "../../nsid/nsid";

/**
 * Add this to a container to make a copy of deleted objects.
 *
 * Watch out for cards getting deleted because they are joining a deck.
 */
export class DeletedItemsContainer {
    public static IGNORE_TAG = "_deleted_items_ignore_";

    private readonly _container: Container;
    private readonly _oneTimeSkipObjIds: Set<string> = new Set<string>();
    private readonly _skipNsids: Set<string> = new Set<string>();

    static ignoreWhenDestroyed(obj: GameObject) {
        const tags: string[] = obj.getTags();
        tags.push(this.IGNORE_TAG);
        obj.setTags(tags);
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
            this._oneTimeSkipObjIds.add(insertedCard.getId());
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

    addSkipNsids(nsids: string[]) {
        for (const nsid of nsids) {
            this._skipNsids.add(nsid);
        }
        return this;
    }

    _onObjectDestroyed(obj: GameObject) {
        const id = obj.getId();
        if (this._oneTimeSkipObjIds.has(id)) {
            this._oneTimeSkipObjIds.delete(id);
            return; // card deleted because added to a deck
        }

        const nsid: string = NSID.get(obj);
        if (this._skipNsids.has(nsid)) {
            return; // user ignored via NSID
        }

        if (obj.getTags().includes(DeletedItemsContainer.IGNORE_TAG)) {
            return; // user ignored via tag
        }

        if (obj.getTemplateId() === this._container.getTemplateId()) {
            return; // do not keep other versions of this object
        }

        console.log(`onObjectDestroyed: "${obj.getId()}"`);
        const json: string = obj.toJSONString();
        const clone: GameObject | undefined = world.createObjectFromJSON(
            json,
            [0, 0, 0]
        );
        if (clone) {
            this._container.addObjects([clone]);
        }
    }
}

new DeletedItemsContainer(refContainer);
