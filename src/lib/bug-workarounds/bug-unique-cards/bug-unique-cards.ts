import { Card, Player, globalEvents, world } from "@tabletop-playground/api";
import { IGlobal } from "../../global/i-global";
import { CardUtil } from "../../card-util/card-util";
import { DeletedItemsContainer } from "../../game-object/deleted-items-container/deleted-items-container";
import { ErrorHandler } from "../../error-handler/error-handler";
import { NSID } from "../../nsid";

/**
 * Monitor all decks expecting no NSID (metadata) repeats.
 * Prune extra cards if found.
 */
export class BugUniqueCards implements IGlobal {
    private readonly _cardUtil = new CardUtil();

    private readonly _onInsertedHandler: (
        deck: Card,
        insertedCard: Card,
        position: number,
        player?: Player
    ) => void = (deck: Card): void => {
        process.nextTick(() => {
            this._processDeck(deck);
        });
    };

    init(): void {
        const skipContained = false;
        for (const obj of world.getAllObjects(skipContained)) {
            if (obj instanceof Card) {
                obj.onInserted.add(this._onInsertedHandler);
            }
        }
        globalEvents.onObjectCreated.add((obj) => {
            if (obj instanceof Card) {
                obj.onInserted.add(this._onInsertedHandler);
            }
        });
    }

    _processDeck(deck: Card): void {
        const seen: Set<string> = new Set<string>();
        const removed: Card | undefined = this._cardUtil.filterCards(
            deck,
            (nsid: string): boolean => {
                // Return true to remove.
                if (nsid.length > 0 && seen.has(nsid)) {
                    return true;
                }
                seen.add(nsid);
                return false;
            }
        );
        if (removed) {
            const removeCount: number = removed.getStackSize();
            const removeNsids: Array<string> = NSID.getDeck(removed);
            const residueCount: number = deck.getStackSize();
            DeletedItemsContainer.destroyWithoutCopying(removed);
            const msg: string = `BugUniqueCards: removed ${removeCount} duplicates, ${residueCount} remain [first dup: "${removeNsids[0]}"]`;
            console.log(msg);
            ErrorHandler.onError.trigger(msg);
        }
    }
}
