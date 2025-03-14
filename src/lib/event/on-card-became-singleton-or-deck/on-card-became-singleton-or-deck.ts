/**
 * Global events trigger when either:
 *
 * 1. A singleton card gets added to a deck/second card.
 *
 * 2. A singleton card gets removed from a deck.
 *
 * 3. A deck has its second-last card removed, making that deck a singleton.
 *
 * Scripts may wish to offer context menu items for singleton cards, but
 * not when they become a deck (or vice versa).
 *
 * If one adds a listener during global init, it will be called next frame with
 * with in-game singleton cards and decks.
 */

import {
    Card,
    GameObject,
    GameWorld,
    Player,
    globalEvents,
    world,
} from "@tabletop-playground/api";
import { TriggerableMulticastDelegate } from "../triggerable-multicast-delegate/triggerable-multicast-delegate";
import { IGlobal } from "../../global/i-global";
import { NSID } from "../../nsid/nsid";

export class OnCardBecameSingletonOrDeck implements IGlobal {
    public static readonly onSingletonCardCreated =
        new TriggerableMulticastDelegate<
            (card: Card, player?: Player) => void
        >();
    public static readonly onSingletonCardMadeDeck =
        new TriggerableMulticastDelegate<
            (card: Card, oldNsid: string, player?: Player) => void
        >();

    private static readonly _onInsertedHandler = (
        deck: Card,
        _insertedCard: Card,
        position: number,
        player?: Player
    ) => {
        // This handler is only installed on singleton cards, and other card(s)
        // have already been added to deck before calling this.  So remove
        // this handler, and signal the card is now a deck.
        process.nextTick(() => {
            if (deck.isValid() && deck.getStackSize() > 1) {
                deck.onInserted.remove(
                    OnCardBecameSingletonOrDeck._onInsertedHandler
                );
                deck.onRemoved.remove(
                    OnCardBecameSingletonOrDeck._onRemovedHandler
                );
                deck.onRemoved.add(
                    OnCardBecameSingletonOrDeck._onRemovedHandler
                );

                // Tested in TTPG, with face up and down decks.
                const nsids: Array<string> = NSID.getDeck(deck);
                const oldNsid: string | undefined =
                    nsids[position === 1 ? 0 : nsids.length - 1];
                if (oldNsid !== undefined) {
                    OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.trigger(
                        deck,
                        oldNsid,
                        player
                    );
                }
            }
        });
    };

    static _onRemovedHandler = (
        deck: Card,
        _removedCard: Card,
        _position: number,
        player?: Player
    ) => {
        // Called after card is removed.
        // Removed card get seen by the onCreated handler.
        process.nextTick(() => {
            if (deck.getStackSize() === 1) {
                deck.onRemoved.remove(
                    OnCardBecameSingletonOrDeck._onRemovedHandler
                );
                deck.onInserted.remove(
                    OnCardBecameSingletonOrDeck._onInsertedHandler
                );
                deck.onInserted.add(
                    OnCardBecameSingletonOrDeck._onInsertedHandler
                );
                OnCardBecameSingletonOrDeck.onSingletonCardCreated.trigger(
                    deck,
                    player
                );
            }
        });
    };

    static _onCreatedHandler = (obj: GameObject) => {
        if (!(obj instanceof Card)) {
            return;
        }
        // Strange things happen when making a deck.  Wait a frame then see.
        process.nextTick(() => {
            if (!obj.isValid()) {
                return;
            }
            if (obj.getStackSize() > 1) {
                // deck
                obj.onRemoved.remove(
                    OnCardBecameSingletonOrDeck._onRemovedHandler
                );
                obj.onRemoved.add(
                    OnCardBecameSingletonOrDeck._onRemovedHandler
                );
                const oldNsid: string | undefined = NSID.getDeck(obj)[0];
                if (oldNsid !== undefined) {
                    OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.trigger(
                        obj,
                        oldNsid
                    );
                }
            } else if (obj.getStackSize() === 1) {
                // singleton card
                obj.onInserted.remove(
                    OnCardBecameSingletonOrDeck._onInsertedHandler
                );
                obj.onInserted.add(
                    OnCardBecameSingletonOrDeck._onInsertedHandler
                );
                OnCardBecameSingletonOrDeck.onSingletonCardCreated.trigger(obj);
            }
        });
    };

    /**
     * Remove and (re)install handlers.  Safe to call multiple times.
     */
    init(): void {
        globalEvents.onObjectCreated.add(
            OnCardBecameSingletonOrDeck._onCreatedHandler
        );
        const skipContained = false;
        for (const obj of world.getAllObjects(skipContained)) {
            OnCardBecameSingletonOrDeck._onCreatedHandler(obj);
        }
    }

    static _reset(): void {
        globalEvents.onObjectCreated.remove(
            OnCardBecameSingletonOrDeck._onCreatedHandler
        );
        OnCardBecameSingletonOrDeck.onSingletonCardCreated.clear();
        OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.clear();
    }
}

if (GameWorld.getExecutionReason() === "unittest") {
    afterEach(() => OnCardBecameSingletonOrDeck._reset());
}
