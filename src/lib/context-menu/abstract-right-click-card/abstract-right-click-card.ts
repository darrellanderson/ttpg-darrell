import { GameObject, Player, Card } from "@tabletop-playground/api";
import { OnCardBecameSingletonOrDeck } from "../../event/on-card-became-singleton-or-deck/on-card-became-singleton-or-deck";
import { IGlobal } from "../../global/i-global";
import { NSID } from "../../nsid/nsid";

/**
 * Add a context menu item ONLY when the singleton card exists.
 * Remove it if the card becomes a deck.
 *
 * NOTE: the handler is a standard onCustomAction handler -- you need to verify
 * the identifier before processing!  This is to match other onCustomAction
 * handling rather than create a new signature.
 */
export abstract class AbstractRightClickCard implements IGlobal {
    private readonly _cardNsidPrefix: string;
    private readonly _customActionName: string;
    private readonly _customActionHandler: (
        object: GameObject,
        player: Player,
        identifier: string
    ) => void;

    constructor(
        cardNsidPrefix: string,
        customActionName: string,
        customActionHandler: (
            object: GameObject,
            player: Player,
            identifier: string
        ) => void
    ) {
        this._cardNsidPrefix = cardNsidPrefix;
        this._customActionName = customActionName;
        this._customActionHandler = customActionHandler;
    }

    init(): void {
        // These trigger the frame AFTER init.  No need to look for objects.
        OnCardBecameSingletonOrDeck.onSingletonCardCreated.add((card: Card) => {
            const nsid = NSID.get(card);
            if (nsid.startsWith(this._cardNsidPrefix)) {
                card.removeCustomAction(this._customActionName);
                card.addCustomAction(this._customActionName);
                card.onCustomAction.remove(this._customActionHandler);
                card.onCustomAction.add(this._customActionHandler);
            }
        });
        OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add(
            (card: Card, oldNsid: string) => {
                if (oldNsid.startsWith(this._cardNsidPrefix)) {
                    card.removeCustomAction(this._customActionName);
                    card.onCustomAction.remove(this._customActionHandler);
                }
            }
        );
    }
}
