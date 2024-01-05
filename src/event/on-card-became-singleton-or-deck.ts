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
 */

import {
    Card,
    GameObject,
    Player,
    globalEvents,
} from "@tabletop-playground/api";
import { TriggerableMulticastDelegate } from "../triggerable-multicast-delegate/triggerable-multicast-delegate";
import { AbstractGlobal } from "../global/abstract-global";

export class OnCardBecameSingletonOrDeck implements AbstractGlobal {
    public static readonly onSingletonCardCreated =
        new TriggerableMulticastDelegate<(card: Card) => void>();
    public static readonly onSingletonCardMadeDeck =
        new TriggerableMulticastDelegate<(card: Card) => void>();

    private static readonly _onInsertedHandler = (
        deck: Card,
        insertedCard: Card,
        position: number,
        player?: Player
    ) => {
        // This handler is only installed on singleton cards, and other card(s)
        // have already been added to deck before calling this.  So remove
        // this handler, and signal the card is now a deck.
        if (deck.getStackSize() > 1) {
            deck.onInserted.remove(
                OnCardBecameSingletonOrDeck._onInsertedHandler
            );
            deck.onRemoved.remove(
                OnCardBecameSingletonOrDeck._onRemovedHandler
            );
            deck.onRemoved.add(OnCardBecameSingletonOrDeck._onRemovedHandler);
            OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.trigger(deck);
        }
    };

    static _onRemovedHandler = (
        deck: Card,
        removedCard: Card,
        position: number,
        player?: Player
    ) => {
        // Called after card is removed.
        if (deck.getStackSize() === 1) {
            deck.onRemoved.remove(
                OnCardBecameSingletonOrDeck._onRemovedHandler
            );
            deck.onInserted.remove(
                OnCardBecameSingletonOrDeck._onInsertedHandler
            );
            deck.onInserted.add(OnCardBecameSingletonOrDeck._onInsertedHandler);
            OnCardBecameSingletonOrDeck.onSingletonCardCreated.trigger(deck);
        }
    };

    static _onCreatedHandler = (obj: GameObject) => {
        if (!(obj instanceof Card)) {
            return;
        }
        // Strange things happen when making a deck.  Wait a frame then see.
        process.nextTick(() => {
            if (obj.getStackSize() > 1) {
                // deck
                obj.onRemoved.remove(
                    OnCardBecameSingletonOrDeck._onRemovedHandler
                );
                obj.onRemoved.add(
                    OnCardBecameSingletonOrDeck._onRemovedHandler
                );
            } else {
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
    }

    _reset(): void {
        globalEvents.onObjectCreated.remove(
            OnCardBecameSingletonOrDeck._onCreatedHandler
        );
    }
}
