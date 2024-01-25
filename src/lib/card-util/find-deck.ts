import { Card, GameObject, SnapPoint, world } from "@tabletop-playground/api";

export class FindDeck {
    private readonly _snapPointTagToSnapPoint: { [key: string]: SnapPoint } =
        {};

    /**
     * Find deck, possibly as its discard (in which case replace deck).
     *
     * @param deckSnapPointTag
     * @param discardSnapPointTag
     * @param shuffleDiscard
     * @returns
     */
    findDeck(
        deckSnapPointTag: string,
        discardSnapPointTag?: string,
        shuffleDiscard?: boolean
    ): Card | undefined {
        const findSnapPoint: (tag: string) => SnapPoint | undefined = (tag) => {
            // Check cache.
            let snapPoint: SnapPoint | undefined =
                this._snapPointTagToSnapPoint[deckSnapPointTag];

            // Search (update cache if found).
            const skipContained = true;
            for (const obj of world.getAllObjects(skipContained)) {
                for (const snapPoint of obj.getAllSnapPoints()) {
                    if (snapPoint.getTags().includes(deckSnapPointTag)) {
                        this._snapPointTagToSnapPoint[deckSnapPointTag] =
                            snapPoint;
                        return snapPoint;
                    }
                }
            }
        };

        // Get deck snap point.
        const snapPoint: SnapPoint | undefined =
            findSnapPoint(deckSnapPointTag);
        if (!snapPoint) {
            return undefined;
        }

        // Check for a deck on the deck snap point.
        if (snapPoint.getParentObject()?.isValid()) {
            const obj: GameObject | undefined = snapPoint.getSnappedObject();
            if (obj instanceof Card) {
                return obj;
            }
        }

        // No deck?  Find discard.
        if (!discardSnapPointTag) {
            return undefined;
        }
        const discard: Card | undefined = this.findDeck(discardSnapPointTag);
        if (!discard) {
            return undefined;
        }
        if (shuffleDiscard) {
            discard.shuffle();
        }

        // Move discard to deck snap point.
        // TODO XXX

        return discard;
    }
}
