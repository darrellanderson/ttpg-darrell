import {
    Card,
    CardHolder,
    Container,
    GameObject,
    Player,
    SnapPoint,
    world,
} from "@tabletop-playground/api";
import { Find } from "../find/find";
import { NSID } from "../nsid/nsid";

export class CardUtil {
    private readonly _find: Find = new Find();

    /**
     * Deal card to the player's card holder.
     * (Card.deal may fail if holder is not attached to player.)
     *
     * @param card
     * @param playerSlot
     * @returns
     */
    dealToHolder(card: Card, playerSlot: number): boolean {
        let holder: CardHolder | undefined;

        // Check if player has attached card holder, otherwise search.
        const player: Player | undefined = world.getPlayerBySlot(playerSlot);
        holder = player?.getHandHolder();
        if (!holder) {
            const skipContained = true;
            holder = this._find.findCardHolderBySlot(playerSlot, skipContained);
        }

        // Make sure card is face up.
        card.setRotation([0, 0, 180]);

        return holder?.insert(card, holder.getNumCards()) ?? false;
    }

    /**
     * Find the card anywhere on the table / in-deck / in-holder.
     * Remove from deck or holder, if applicable.
     *
     * @param nsid
     * @returns
     */
    fetchCard(nsid: string): Card | undefined {
        // Find card.
        let card: Card | undefined;
        const skipContained = false;
        for (const obj of world.getAllObjects(skipContained)) {
            if (!(obj instanceof Card)) {
                continue;
            }

            if (obj.getStackSize() === 1) {
                if (NSID.get(obj) === nsid) {
                    card = obj;
                    break;
                }
                continue; // single card, not the one we want
            }

            const offset = NSID.getDeck(obj).indexOf(nsid);
            if (offset < 0) {
                continue; // deck, wanted not not inside
            }

            const number = 1;
            const fromFront = true;
            const keep = false;
            card = obj.takeCards(number, fromFront, offset, keep);
            if (card) {
                break;
            }
        }

        // Remove from container.
        const container: Container | undefined = card?.getContainer();
        if (card && container) {
            container.remove(card);
        }

        // If found, remove from holder.
        const cardHolder: CardHolder | undefined = card?.getHolder();
        if (card && cardHolder) {
            const index = cardHolder.getCards().indexOf(card);
            if (index >= 0) {
                cardHolder.removeAt(index);
            }
        }

        // If held, release.
        if (card?.isHeld()) {
            card.release();
        }

        return card;
    }

    /**
     * Extract filter-approved cards into a new deck.  Leave any remaining
     * cards in the old deck (may potentially become empty).
     *
     * @param deck
     * @param filter
     * @returns - new deck with filtered cards
     */
    filterCards(
        deck: Card,
        filter: (nsid: string) => boolean
    ): Card | undefined {
        let result: Card | undefined;
        const nsids = NSID.getDeck(deck);
        for (let i = nsids.length - 1; i >= 0; i--) {
            const nsid: string | undefined = nsids[i];
            if (nsid && filter(nsid)) {
                // Remove card from deck.
                let card: Card | undefined;
                if (deck.getStackSize() === 1) {
                    card = deck;
                } else {
                    const numCards = 1;
                    const fromFront = true;
                    const offset = i;
                    const keep = false;
                    card = deck.takeCards(numCards, fromFront, offset, keep);
                }

                // Add card to result.
                if (card) {
                    if (result) {
                        const toFront = true;
                        const offset = 0;
                        const animate = false;
                        const flipped = false;
                        result.addCards(
                            card,
                            toFront,
                            offset,
                            animate,
                            flipped
                        );
                    } else {
                        result = card;
                    }
                }
            }
        }
        return result;
    }

    /**
     * Is this card a singleton (not a deck), not held by a player, etc.
     *
     * @param obj
     * @param allowFaceDown
     * @returns
     */
    isLooseCard(
        obj: GameObject,
        allowFaceDown?: boolean,
        rejectSnapPointTags?: Array<string>
    ): boolean {
        if (rejectSnapPointTags) {
            const snapPoint: SnapPoint | undefined = obj.getSnappedToPoint();
            if (snapPoint) {
                const tags: Array<string> = snapPoint.getTags();
                for (const tag of tags) {
                    if (rejectSnapPointTags.includes(tag)) {
                        return false;
                    }
                }
            }
        }
        return (
            obj instanceof Card &&
            (allowFaceDown || obj.isFaceUp()) &&
            obj.getStackSize() === 1 &&
            !obj.getContainer() &&
            !obj.isHeld() &&
            !obj.isInHolder() &&
            obj.isValid()
        );
    }

    /**
     * Split a deck into an array of single-card objects.
     *
     * @param deck
     * @returns
     */
    separateDeck(deck: Card): Array<Card> {
        const cards: Array<Card> = [];
        while (deck.getStackSize() > 1) {
            const numCards = 1;
            const fromFront = true;
            const offset = 0;
            const keep = false;
            const card: Card | undefined = deck.takeCards(
                numCards,
                fromFront,
                offset,
                keep
            );
            if (card) {
                cards.push(card);
            }
        }
        cards.push(deck); // one card remains
        return cards;
    }
}
