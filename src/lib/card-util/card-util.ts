import { Card, CardHolder, GameObject, world } from "@tabletop-playground/api";
import { NSID } from "../nsid/nsid";

export const SNAP_POINT_TAG_DECK = "DECK";
export const SNAP_POINT_TAG_DISCARD = "DECK";

export abstract class CardUtil {
    /**
     * Is this card a singleton (not a deck), not held by a player, etc.
     *
     * @param obj
     * @param allowFaceDown
     * @returns
     */
    static isLooseCard(obj: GameObject, allowFaceDown?: boolean): boolean {
        const tags: string[] = obj.getSnappedToPoint()?.getTags() ?? [];
        return (
            obj instanceof Card &&
            (allowFaceDown || obj.isFaceUp()) &&
            obj.getStackSize() === 1 &&
            !obj.getContainer() &&
            !obj.isHeld() &&
            !obj.isInHolder() &&
            !tags.includes(SNAP_POINT_TAG_DECK) &&
            !tags.includes(SNAP_POINT_TAG_DISCARD) &&
            obj.isValid()
        );
    }

    /**
     * Extract filter-approved cards into a new deck.  Leave any remaining
     * cards in the old deck (may potentially become empty).
     *
     * @param deck
     * @param filter
     * @returns - new deck with filtered cards
     */
    static filterCards(
        deck: Card,
        filter: (nsid: string) => boolean
    ): Card | undefined {
        let result: Card | undefined;
        const nsids = NSID.getDeck(deck);
        for (let i = nsids.length - 1; i >= 0; i--) {
            if (filter(nsids[i])) {
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
                    if (!card) {
                        throw new Error("takeCards failed");
                    }
                }

                // Add card to result.
                if (result) {
                    const toFront = true;
                    const offset = 0;
                    const animate = false;
                    const flipped = false;
                    result.addCards(card, toFront, offset, animate, flipped);
                } else {
                    result = card;
                }
            }
        }
        return result;
    }

    /**
     * Split a deck into an array of single-card objects.
     *
     * @param deck
     * @returns
     */
    static separateDeck(deck: Card): Card[] {
        const cards: Card[] = [];
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
            if (!card) {
                throw new Error("takeCards failed");
            }
            cards.push(card);
        }
        cards.push(deck); // one card remains
        return cards;
    }

    /**
     * Find the card anywhere on the table / in-deck / in-holder.
     * Remove from deck or holder, if applicable.
     *
     * @param nsid
     * @returns
     */
    static fetchCard(nsid: string): Card | undefined {
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
            if (!card) {
                throw new Error("takeCards failed");
            }
            break;
        }

        // Remove from container.
        if (card?.getContainer()) {
            card.getContainer()?.remove(card);
        }

        // If found, remove from holder.
        if (card?.isInHolder()) {
            const cardHolder: CardHolder | undefined = card.getHolder();
            if (!cardHolder) {
                throw new Error("isInHolder true but getHolder undefined");
            }
            const index = cardHolder.getCards().indexOf(card);
            if (index < 0) {
                throw new Error("isInHolder true but not in getCards");
            }
            cardHolder.removeAt(index);
        }

        // If held, release.
        if (card?.isHeld()) {
            card.release();
        }

        return card;
    }
}
