import {
    Card,
    CardHolder,
    Container,
    Dice,
    GameObject,
    MultistateObject,
    SnapPoint,
    StaticObject,
    Vector,
    world,
} from "@tabletop-playground/api";
import { NSID } from "../nsid/nsid";

/**
 * Find things in the game world.  Generally speaking finds the first matching
 * candidate; expecting objects to be unique.
 */
export class Find {
    private static __ignoreCardHolderNsids: Set<string> = new Set();

    private _cardHolders: Array<CardHolder> = [];
    private readonly _nsidAndSlotToGameObject: { [key: string]: GameObject } =
        {};
    private readonly _snapPointTagAndSlotToSnapPoint: {
        [key: string]: SnapPoint;
    } = {};
    private readonly _playerSlotToCardHolder: { [key: number]: CardHolder } =
        {};

    static ignoreOwnedCardHolderNsid(nsid: string): void {
        Find.__ignoreCardHolderNsids.add(nsid);
    }

    getOwnedCardHolders(): Array<CardHolder> {
        for (const cardHolder of this._cardHolders) {
            if (!cardHolder.isValid()) {
                this._cardHolders = [];
                break;
            }
        }

        if (this._cardHolders.length === 0) {
            const skippedContained: boolean = true;
            for (const obj of world.getAllObjects(skippedContained)) {
                if (!(obj instanceof CardHolder)) {
                    continue;
                }
                const nsid: string = NSID.get(obj);
                if (Find.__ignoreCardHolderNsids.has(nsid)) {
                    continue;
                }
                this._cardHolders.push(obj);
            }
        }

        return this._cardHolders;
    }

    closestOwnedCardHolderOwner(
        pos: Vector | [x: number, y: number, z: number]
    ): number {
        let closestOwner = -1;
        let closestDistance = Number.MAX_VALUE;

        for (const cardHolder of this.getOwnedCardHolders()) {
            if (!cardHolder.isValid()) {
                continue;
            }
            const owner: number = cardHolder.getOwningPlayerSlot();
            if (owner === -1) {
                continue;
            }
            const distance = cardHolder
                .getPosition()
                .subtract(pos)
                .magnitudeSquared();
            if (distance < closestDistance) {
                closestOwner = owner;
                closestDistance = distance;
            }
        }
        return closestOwner;
    }

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
        return card as Card | undefined;
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
        return card as CardHolder | undefined;
    }

    findCardHolderBySlot(
        playerSlot: number,
        skipContained: boolean = false
    ): CardHolder | undefined {
        // Check cache.
        const cardHolder: CardHolder | undefined =
            this._playerSlotToCardHolder[playerSlot];
        if (cardHolder?.isValid()) {
            return cardHolder;
        }

        for (const obj of world.getAllObjects(skipContained)) {
            if (!(obj instanceof CardHolder)) {
                continue;
            }
            if (obj.getOwningPlayerSlot() !== playerSlot) {
                continue;
            }
            this._playerSlotToCardHolder[playerSlot] = obj;
            return obj;
        }
        return undefined;
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
        return container as Container | undefined;
    }

    findDeckOrDiscard(
        deckSnapPointTag: string,
        discardSnapPointTag?: string,
        shuffleDiscard?: boolean,
        playerSlot?: number
    ): Card | undefined {
        // Look for deck.
        const deckSnapPoint = this.findSnapPointByTag(
            deckSnapPointTag,
            playerSlot
        );
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
        const discardSnapPoint = this.findSnapPointByTag(
            discardSnapPointTag,
            playerSlot
        );
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
        return discard;
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
        return dice as Dice | undefined;
    }

    findGameObject(
        nsid: string,
        playerSlot?: number,
        skipContained: boolean = false
    ): GameObject | undefined {
        const key = `${nsid}@${playerSlot ?? ""}`;

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
        return multistateObject as MultistateObject | undefined;
    }

    findSnapPointByTag(
        tag: string,
        playerSlot?: number
    ): SnapPoint | undefined {
        const key = `${tag}@${playerSlot ?? ""}`;

        // Check cache.
        const cachedSnapPoint: SnapPoint | undefined =
            this._snapPointTagAndSlotToSnapPoint[key];
        const parent: StaticObject | undefined =
            cachedSnapPoint?.getParentObject();
        if (cachedSnapPoint && (!parent || parent.isValid())) {
            return cachedSnapPoint;
        }

        // Search tables (update cache if found).
        for (const obj of world.getAllTables()) {
            for (const snapPoint of obj.getAllSnapPoints()) {
                if (snapPoint.getTags().includes(tag)) {
                    this._snapPointTagAndSlotToSnapPoint[key] = snapPoint;
                    return snapPoint;
                }
            }
        }

        // Search objects (update cache if found).
        const skipContained = true;
        for (const obj of world.getAllObjects(skipContained)) {
            if (
                playerSlot !== undefined &&
                obj.getOwningPlayerSlot() !== playerSlot
            ) {
                continue;
            }
            for (const snapPoint of obj.getAllSnapPoints()) {
                if (snapPoint.getTags().includes(tag)) {
                    this._snapPointTagAndSlotToSnapPoint[key] = snapPoint;
                    return snapPoint;
                }
            }
        }
    }
}
