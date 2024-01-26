import {
    Card,
    CardHolder,
    Container,
    Dice,
    GameObject,
    MultistateObject,
    SnapPoint,
    world,
} from "@tabletop-playground/api";
import { NSID } from "../nsid/nsid";

/**
 * Find things in the game world.  Generally speaking finds the first matching
 * candidate; expecting objects to be unique.
 */
export class Find {
    private readonly _nsidAndSlotToGameObject: { [key: string]: GameObject } =
        {};
    private readonly _snapPointTagToSnapPoint: { [key: string]: SnapPoint } =
        {};

    findCard(
        nsid: string,
        playerSlot?: number,
        skipContained: boolean = false
    ): Card | undefined {
        const card: GameObject | undefined = this.findGameObject(
            nsid,
            playerSlot,
            skipContained
        );
        if (card && !(card instanceof Card)) {
            throw new Error(`findCard: "${nsid}" not a Card`);
        }
        return card;
    }

    findCardHolder(
        nsid: string,
        playerSlot?: number,
        skipContained: boolean = false
    ): CardHolder | undefined {
        const card: GameObject | undefined = this.findGameObject(
            nsid,
            playerSlot,
            skipContained
        );
        if (card && !(card instanceof CardHolder)) {
            throw new Error(`findCardHolder: "${nsid}" not a CardHolder`);
        }
        return card;
    }

    findContainer(
        nsid: string,
        playerSlot?: number,
        skipContained: boolean = false
    ): Container | undefined {
        const container: GameObject | undefined = this.findGameObject(
            nsid,
            playerSlot,
            skipContained
        );
        if (container && !(container instanceof Container)) {
            throw new Error(`findContainer: "${nsid}" not a Container`);
        }
        return container;
    }

    findDeckOrDiscard(
        deckSnapPointTag: string,
        discardSnapPointTag?: string,
        shuffleDiscard?: boolean
    ): Card | undefined {
        // Look for deck.
        const deckSnapPoint = this.findSnapPointByTag(deckSnapPointTag);
        if (!deckSnapPoint) {
            return undefined;
        }
        const deck = deckSnapPoint.getSnappedObject();
        if (deck && deck instanceof Card && deck.isValid()) {
            return deck;
        }

        // No deck, look for discard.
        if (!discardSnapPointTag) {
            return undefined;
        }
        const discardSnapPoint = this.findSnapPointByTag(discardSnapPointTag);
        if (!discardSnapPoint) {
            return undefined;
        }
        const discard = discardSnapPoint.getSnappedObject();
        if (!discard || !(discard instanceof Card) || !discard.isValid()) {
            return undefined;
        }

        // Shuffle?
        if (shuffleDiscard) {
            discard.shuffle();
        }

        // Move discard to snap point.
        const above = deckSnapPoint.getGlobalPosition().add([0, 0, 10]);
        discard.setPosition(above);
        discard.setRotation([0, 0, 0]); // let snap handle the yaw
        discard.snapToGround();
        discard.snap();
    }

    findDice(
        nsid: string,
        playerSlot?: number,
        skipContained: boolean = false
    ): Dice | undefined {
        const dice: GameObject | undefined = this.findGameObject(
            nsid,
            playerSlot,
            skipContained
        );
        if (dice && !(dice instanceof Dice)) {
            throw new Error(`findDice: "${nsid}" not a Dice`);
        }
        return dice;
    }

    findGameObject(
        nsid: string,
        playerSlot?: number,
        skipContained: boolean = false
    ): GameObject | undefined {
        const key = nsid + "@" + playerSlot ?? "";

        // Check cache.
        const gameObject: GameObject | undefined =
            this._nsidAndSlotToGameObject[key];
        if (
            gameObject &&
            gameObject.isValid() &&
            (playerSlot === undefined ||
                gameObject.getOwningPlayerSlot() === playerSlot)
        ) {
            return gameObject;
        }

        // Search (update cache if found).
        for (const obj of world.getAllObjects(skipContained)) {
            if (NSID.get(obj) !== nsid) {
                continue;
            }
            if (
                playerSlot !== undefined &&
                obj.getOwningPlayerSlot() !== playerSlot
            ) {
                continue;
            }
            this._nsidAndSlotToGameObject[key] = obj;
            return obj;
        }
    }

    findMultistateObject(
        nsid: string,
        playerSlot?: number,
        skipContained: boolean = false
    ): MultistateObject | undefined {
        const multistateObject: GameObject | undefined = this.findGameObject(
            nsid,
            playerSlot,
            skipContained
        );
        if (
            multistateObject &&
            !(multistateObject instanceof MultistateObject)
        ) {
            throw new Error(
                `findMultistateObject: "${nsid}" not a MultistateObject`
            );
        }
        return multistateObject;
    }

    findSnapPointByTag(tag: string): SnapPoint | undefined {
        // Check cache.
        let snapPoint: SnapPoint | undefined =
            this._snapPointTagToSnapPoint[tag];
        if (snapPoint && snapPoint.getParentObject()?.isValid()) {
            return snapPoint;
        }

        // Search (update cache if found).
        const skipContained = true;
        for (const obj of world.getAllObjects(skipContained)) {
            for (const snapPoint of obj.getAllSnapPoints()) {
                if (snapPoint.getTags().includes(tag)) {
                    this._snapPointTagToSnapPoint[tag] = snapPoint;
                    return snapPoint;
                }
            }
        }
    }
}