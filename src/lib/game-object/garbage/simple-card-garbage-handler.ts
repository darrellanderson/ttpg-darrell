import { GameObject, Card, SnapPoint } from "@tabletop-playground/api";
import { GarbageHandler } from "./garbage-container";
import { NSID } from "../../nsid/nsid";
import { Find } from "../../find/find";

/**
 * Recycle cards to a specific snap point on a mat.
 * Add to any deck already there, or start a new deck.
 * Optionally shuffle after discard.
 */
export class SimpleCardGarbageHandler implements GarbageHandler {
    private readonly _find: Find = new Find();
    private _cardNsidPrefix: string = "";
    private _snapPointTag: string = "";
    private _faceUp: boolean = false;
    private _shuffleAfterDiscard: boolean = false;

    public setCardNsidPrefix(cardNsidPrefix: string): this {
        this._cardNsidPrefix = cardNsidPrefix;
        return this;
    }

    public setSnapPointTag(tag: string): this {
        this._snapPointTag = tag;
        return this;
    }

    public setFaceUp(value: boolean): this {
        this._faceUp = value;
        return this;
    }

    public setShuffleAfterDiscard(shuffle: boolean): this {
        this._shuffleAfterDiscard = shuffle;
        return this;
    }

    // --------------------------------

    public canRecycle(obj: GameObject): boolean {
        if (!(obj instanceof Card)) {
            return false;
        }
        if (obj.getStackSize() !== 1) {
            return false;
        }
        const nsid = NSID.get(obj);
        return (
            this._cardNsidPrefix.length > 0 &&
            nsid.startsWith(this._cardNsidPrefix)
        );
    }

    public recycle(obj: GameObject): boolean {
        // Verify card.
        if (!(obj instanceof Card)) {
            throw new Error("not a card");
        }
        if (obj.getStackSize() !== 1) {
            throw new Error("not singleton card");
        }
        const nsid: string = NSID.get(obj);
        if (!nsid.startsWith(this._cardNsidPrefix)) {
            throw new Error("nsid mismatch");
        }

        // Find snap point.
        const snapPoint: SnapPoint | undefined = this._find.findSnapPointByTag(
            this._snapPointTag
        );
        if (!snapPoint) {
            return false;
        }

        // Find discard deck.
        let deck: GameObject | undefined = snapPoint.getSnappedObject();
        if (deck && !(deck instanceof Card)) {
            deck = undefined;
        }

        // Discard.
        let success = true;
        if (deck) {
            let offset = 0;

            // "shuffle after discard" is a bit tricky because the card does not
            // get added to the deck until after the discard animation finishes.
            // Instead of doing it in order, shuffle now and discard to a random
            // offset inside that shuffled deck.
            if (this._shuffleAfterDiscard) {
                deck.shuffle();
                offset = Math.floor(Math.random() * deck.getStackSize());
            }

            const toFront = true;
            const animate = true;
            const flipped = false;
            success = deck.addCards(obj, toFront, offset, animate, flipped);
        } else {
            const above = snapPoint.getGlobalPosition().add([0, 0, 10]);
            const animationSpeed: number = 0;
            obj.setPosition(above, animationSpeed);

            // Orient when starting a new discard pile.
            if (obj.isFaceUp() !== this._faceUp) {
                // Apply instant rotation, flip method animates.
                const rot = obj.getRotation().compose([0, 0, 180]);
                obj.setRotation(rot);
            }

            obj.snapToGround();
            obj.snap(); // apply snap point rotation
        }

        return success;
    }
}
