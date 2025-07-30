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
    private readonly _customActionNames: Array<string> = [];
    private readonly _tooltips: Map<string, string> = new Map();
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
        this._customActionNames.push(customActionName);
        this._customActionHandler = customActionHandler;
    }

    /**
     * The first tooltip is
     *
     * @param tooltip
     */
    setTooltip(actionName: string, tooltip: string): this {
        this._tooltips.set(actionName, tooltip);
        return this;
    }

    addCustomActionName(customActionName: string): this {
        this._customActionNames.push(customActionName);
        return this;
    }

    init(): void {
        // These trigger the frame AFTER init.  No need to look for objects.
        OnCardBecameSingletonOrDeck.onSingletonCardCreated.add((card: Card) => {
            const nsid = NSID.get(card);
            if (nsid.startsWith(this._cardNsidPrefix)) {
                for (const customActionName of this._customActionNames) {
                    const tooltip: string | undefined =
                        this._tooltips.get(customActionName);
                    card.removeCustomAction(customActionName);
                    card.addCustomAction(customActionName, tooltip);
                }
                card.onCustomAction.remove(this._customActionHandler);
                card.onCustomAction.add(this._customActionHandler);
            }
        });
        OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add(
            (card: Card, oldNsid: string) => {
                if (oldNsid.startsWith(this._cardNsidPrefix)) {
                    for (const customActionName of this._customActionNames) {
                        card.removeCustomAction(customActionName);
                    }
                    card.onCustomAction.remove(this._customActionHandler);
                }
            }
        );
    }
}
