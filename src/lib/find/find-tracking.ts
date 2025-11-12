import {
    Card,
    GameObject,
    globalEvents,
    world,
} from "@tabletop-playground/api";
import { OnCardBecameSingletonOrDeck } from "../event";
import { NSID } from "../nsid";

/**
 * Find, but only for pre-tracked nsids.
 *
 * Monitors object (and card singleton) creation and destruction to keep an
 * up-to-date set.
 *
 * Unlike find this can track multiple objects with the same nsid.
 */
export class FindTracking {
    private readonly _trackNsids: Set<string> = new Set();
    private readonly _nsidToObjIds: Map<string, Set<string>> = new Map();

    private readonly _onObjectCreated = (obj: GameObject): void => {
        const nsid: string = NSID.get(obj);
        const objId: string = obj.getId();
        const objIds: Set<string> | undefined = this._nsidToObjIds.get(nsid);
        if (objIds) {
            objIds.add(objId);
        }
    };

    private readonly _onObjectDestroyed = (obj: GameObject): void => {
        const nsid: string = NSID.get(obj);
        const objId: string = obj.getId();
        const objIds: Set<string> | undefined = this._nsidToObjIds.get(nsid);
        if (objIds) {
            objIds.delete(objId);
        }
    };

    private readonly _onSingletonCardCreated = (card: Card): void => {
        const nsid: string = NSID.get(card);
        const objId: string = card.getId();
        const objIds: Set<string> | undefined = this._nsidToObjIds.get(nsid);
        if (objIds) {
            objIds.add(objId);
        }
    };

    private readonly _onSingletonCardMadeDeck = (
        card: Card,
        oldNsid: string
    ): void => {
        const objId: string = card.getId();
        const objIds: Set<string> | undefined = this._nsidToObjIds.get(oldNsid);
        if (objIds) {
            objIds.delete(objId);
        }
    };

    /**
     * Rebuild the entire tracking map from scratch.
     * Similar cost to reseeding a single nsid (full scan anyhow).
     */
    _seedNsidToObjIds(): void {
        this._nsidToObjIds.clear();
        const skipContained: boolean = false;
        for (const obj of world.getAllObjects(skipContained)) {
            const nsid: string = NSID.get(obj);
            if (this._trackNsids.has(nsid)) {
                let objIds: Set<string> | undefined =
                    this._nsidToObjIds.get(nsid);
                if (!objIds) {
                    objIds = new Set<string>();
                    this._nsidToObjIds.set(nsid, objIds);
                }
                objIds.add(obj.getId());
            }
        }
    }

    constructor() {
        globalEvents.onObjectCreated.add(this._onObjectCreated);
        globalEvents.onObjectDestroyed.add(this._onObjectDestroyed);
        OnCardBecameSingletonOrDeck.onSingletonCardCreated.add(
            this._onSingletonCardCreated
        );
        OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add(
            this._onSingletonCardMadeDeck
        );
    }

    destroy(): void {
        globalEvents.onObjectCreated.remove(this._onObjectCreated);
        globalEvents.onObjectDestroyed.remove(this._onObjectDestroyed);
        OnCardBecameSingletonOrDeck.onSingletonCardCreated.remove(
            this._onSingletonCardCreated
        );
        OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.remove(
            this._onSingletonCardMadeDeck
        );
        this._nsidToObjIds.clear();
        this._trackNsids.clear();
    }

    trackNsid(nsid: string): void {
        if (!this._trackNsids.has(nsid)) {
            this._trackNsids.add(nsid);
            this._nsidToObjIds.clear();
        }
    }

    trackNsids(nsids: Array<string>): void {
        nsids.forEach((nsid) => this._trackNsids.add(nsid));
    }

    find(nsid: string): Array<GameObject> {
        if (!this._trackNsids.has(nsid)) {
            throw new Error(
                `FindTracking.find called for untracked nsid: ${nsid}`
            );
        }

        let objIds: Set<string> | undefined = this._nsidToObjIds.get(nsid);
        if (!objIds) {
            // Lazy seed.  If any one is missing reseed all.
            this._seedNsidToObjIds();
        }
        objIds = this._nsidToObjIds.get(nsid);
        if (!objIds) {
            return [];
        }

        const objs: Array<GameObject> = [];
        for (const objId of objIds) {
            const obj: GameObject | undefined = world.getObjectById(objId);
            if (obj && obj.isValid()) {
                objs.push(obj);
            }
        }
        return objs;
    }

    findCards(nsid: string): Array<Card> {
        const objs: Array<GameObject> = this.find(nsid);
        const cards: Array<Card> = [];
        for (const obj of objs) {
            if (obj instanceof Card) {
                cards.push(obj);
            }
        }
        return cards;
    }
}
