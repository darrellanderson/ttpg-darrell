import { GameObject, Card, SnapPoint, world } from "@tabletop-playground/api";
import { GarbageHandler } from "./garbage-container";
import { NSID } from "../../nsid/nsid";

/**
 * Recycle cards to a specific snap point on a mat.
 * Add to any deck already there, or start a new deck.
 * Optionally shuffle after discard.
 */
export class SimpleCardGarbageHandler implements GarbageHandler {
    private _matNsid: string = "";
    private _matSnapPointTag: string = "";
    private _cardNsidPrefix: string = "";
    private _shuffleAfterDiscard: boolean = false;

    private _discardSnapPoint: SnapPoint | undefined;

    public setMatNsid(matNsid: string): this {
        this._matNsid = matNsid;
        return this;
    }

    public setMatSnapPointTag(tag: string): this {
        this._matSnapPointTag = tag;
        return this;
    }

    public setCardNsidPrefix(cardNsidPrefix: string): this {
        this._cardNsidPrefix = cardNsidPrefix;
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

        // Find mat.
        const snapPoint: SnapPoint | undefined = this._getDiscardSnapPoint();
        if (!snapPoint) {
            return false;
        }

        // Find discard deck.
        let deck: GameObject | undefined = snapPoint?.getSnappedObject();
        if (deck && !(deck instanceof Card)) {
            deck = undefined;
        }

        // Discard.
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
            const success = deck.addCards(
                obj,
                toFront,
                offset,
                animate,
                flipped
            );
            if (!success) {
                return false;
            }
        } else {
            const above = snapPoint.getGlobalPosition().add([0, 0, 10]);
            const animationSpeed: number = 0;
            obj.setPosition(above, animationSpeed);

            // Orient when starting a new discard pile.
            const wantFaceUp = this._shuffleAfterDiscard ? false : true;
            if (obj.isFaceUp() !== wantFaceUp) {
                // Apply instant rotation, flip method animates.
                const rot = obj.getRotation().compose([0, 0, 180]);
                obj.setRotation(rot);
            }

            obj.snapToGround();
            obj.snap(); // apply snap point rotation
        }

        return true;
    }

    private _getDiscardSnapPoint(): SnapPoint | undefined {
        // Check cache.
        if (this._discardSnapPoint?.getParentObject()?.isValid()) {
            return this._discardSnapPoint;
        }
        this._discardSnapPoint = undefined;

        // Find mat.
        let mat = undefined;
        const skipContained = true;
        for (const obj of world.getAllObjects(skipContained)) {
            if (!obj.isValid()) {
                continue;
            }
            const nsid: string = NSID.get(obj);
            if (nsid === this._matNsid) {
                mat = obj;
                break;
            }
        }
        if (!mat) {
            return undefined;
        }

        // Find snap point.
        for (const snapPoint of mat.getAllSnapPoints()) {
            for (const tag of snapPoint.getTags()) {
                if (tag === this._matSnapPointTag) {
                    this._discardSnapPoint = snapPoint; // cache
                    return snapPoint;
                }
            }
        }

        return undefined;
    }
}
