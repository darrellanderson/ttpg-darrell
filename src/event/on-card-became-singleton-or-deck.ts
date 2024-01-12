/**
 * Global events trigger when either:
 *
 * 1. A singleton card gets added to a deck/second card.
 *
 * 2. A singleton card gets fromved from a deck.
 *
 * 3. A deck has its second-last card removed, making that deck a singleton.
 *
 * Scripts may wish to offer content menu items for singleton cards, but
 * not when they become a deck (or vice versa).
 *
 * If one adds a listener during global init, it will be called next frame with
 * with in-game singleton cards and decks.
 */

import {
    Card,
    GameObject,
    Player,
    globalEvents,
    world,
} from "@tabletop-playground/api";
import { TriggerableMulticastDelegate } from "./triggerable-multicast-delegate";
import { AbstractGlobal } from "../global/abstract-global";
import { NSID } from "../nsid/nsid";

export class OnCardBecameSingletonOrDeck implements AbstractGlobal {
    public static readonly onSingletonCardCreated =
        new TriggerableMulticastDelegate<(card: Card) => void>();
    public static readonly onSingletonCardMadeDeck =
        new TriggerableMulticastDelegate<
            (card: Card, oldNsid: string) => void
        >();

    private static readonly _onInsertedHandler = (
        deck: Card,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        insertedCard: Card,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        position: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        player?: Player
    ) => {
        // This handler is only installed on singleton cards, and other card(s)
        // have already been added to deck before calling this.  So remove
        // this handler, and signal the card is now a deck.
        const oldNsid: string = NSID.get(deck);
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
                OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.trigger(
                    deck,
                    oldNsid
                );
            }
        });
    };

    static _onRemovedHandler = (
        deck: Card,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        removedCard: Card,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        position: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                    deck
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
                const oldNsid: string = NSID.getDeck(obj)[0];
                OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.trigger(
                    obj,
                    oldNsid
                );
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

    init(): void {
        globalEvents.onObjectCreated.add(
            OnCardBecameSingletonOrDeck._onCreatedHandler
        );
        const skipContained = false;
        for (const obj of world.getAllObjects(skipContained)) {
            OnCardBecameSingletonOrDeck._onCreatedHandler(obj);
        }
    }

    _reset(): void {
        globalEvents.onObjectCreated.remove(
            OnCardBecameSingletonOrDeck._onCreatedHandler
        );
    }
}

/*

OnCardBecameSingletonOrDeck.onSingletonCardCreated.add((card: Card) => {
    const nsid: string = NSID.get(card);
    console.log(`onSingletonCardCreated: [${nsid}]`);
});

OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add((card: Card) => {
    const nsids: string[] = NSID.getDeck(card);
    console.log(`onSingletonCardMadeDeck: [${nsids.join(", ")}]`);
});

*/
