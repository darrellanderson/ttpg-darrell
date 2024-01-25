import { GameObject, Player, Card } from "@tabletop-playground/api";
import { OnCardBecameSingletonOrDeck } from "../event/on-card-became-singleton-or-deck";
import { AbstractGlobal } from "../global/abstract-global";
import { NSID } from "../nsid/nsid";

/**
 * Add context menu item on a deck ONLY when all cards match the given prefix.
 * Remove it if the deck becomes a singleton card.
 *
 * NOTE: does not remove the handler if a mismatch card is added to the deck later!
 *
 * NOTE: the handler is a standard onCustomAction handler -- you need to verify
 * the identifier before processing!  This is to match other onCustomAction
 * handling rather than create a new signature.
 */
export abstract class AbstractRightClickDeck extends AbstractGlobal {
    private readonly _deckNsidPrefix: string;
    private readonly _customActionName: string;
    private readonly _customActionHandler: (
        object: GameObject,
        player: Player,
        identifier: string
    ) => void;

    constructor(
        deckNsidPrefix: string,
        customActionName: string,
        customActionHandler: (
            object: GameObject,
            player: Player,
            identifier: string
        ) => void
    ) {
        super();
        this._deckNsidPrefix = deckNsidPrefix;
        this._customActionName = customActionName;
        this._customActionHandler = customActionHandler;
    }

    init(): void {
        // These trigger the frame AFTER init.  No need to look for objects.
        OnCardBecameSingletonOrDeck.onSingletonCardCreated.add((card: Card) => {
            const nsid = NSID.get(card);
            if (nsid.startsWith(this._deckNsidPrefix)) {
                card.removeCustomAction(this._customActionName);
                card.onCustomAction.remove(this._customActionHandler);
            }
        });
        OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add(
            (card: Card) => {
                const nsids: string[] = NSID.getDeck(card);
                for (const nsid of nsids) {
                    if (!nsid.startsWith(this._deckNsidPrefix)) {
                        return; // at least one mismatch
                    }
                }
                card.removeCustomAction(this._customActionName);
                card.addCustomAction(this._customActionName);
                card.onCustomAction.remove(this._customActionHandler);
                card.onCustomAction.add(this._customActionHandler);
            }
        );
    }
}
