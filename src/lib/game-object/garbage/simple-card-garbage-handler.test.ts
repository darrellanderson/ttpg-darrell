import { Card } from "@tabletop-playground/api";
import { SimpleCardGarbageHandler } from "./simple-card-garbage-handler";
import {
    MockCard,
    MockCardDetails,
    MockGameObject,
    MockSnapPoint,
    MockVector,
    mockWorld,
} from "ttpg-mock";

it("constructor", () => {
    new SimpleCardGarbageHandler();
});

it("canRecycleObj", () => {
    const scgh = new SimpleCardGarbageHandler().setCardNsidPrefix("my-prefix");

    const yesObject = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: "my-prefix-metadata" })],
    });
    expect(scgh.canRecycle(yesObject)).toBeTruthy();

    const noObject1 = new MockCard({
        cardDetails: [
            new MockCardDetails({ metadata: "not-my-prefix-metadata" }),
        ],
    });
    expect(scgh.canRecycle(noObject1)).toBeFalsy();

    const noObject2 = new MockGameObject();
    expect(scgh.canRecycle(noObject2)).toBeFalsy();
});

it("recycle (to deck)", () => {
    const matNsid = "mat:base/my-mat";
    const snapPointTag = "my-snap-point-tag";
    const cardNsidPrefix = "my-prefix";

    const scgh = new SimpleCardGarbageHandler()
        .setSnapPointTag(snapPointTag)
        .setCardNsidPrefix(cardNsidPrefix)
        .setShuffleAfterDiscard(true)
        .setFaceUp(true);

    const deck = new MockCard({ cardDetails: [new MockCardDetails()] });
    const snapPoint = new MockSnapPoint({
        snappedObject: deck,
        tags: [snapPointTag],
    });
    const mat = new MockGameObject({
        snapPoints: [snapPoint],
        templateMetadata: matNsid,
    });
    mockWorld._reset({ gameObjects: [mat] });

    const card = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: cardNsidPrefix })],
    });

    expect(deck.getStackSize()).toEqual(1);
    const success: boolean = scgh.recycle(card);
    expect(success).toBeTruthy();
    expect(deck.getStackSize()).toEqual(2);
});

it("recycle (no deck)", () => {
    const matNsid = "mat:base/my-mat";
    const snapPointTag = "my-snap-point-tag";
    const cardNsidPrefix = "my-prefix";
    const deckPos = new MockVector(100, 0, 0);

    const scgh = new SimpleCardGarbageHandler()
        .setSnapPointTag(snapPointTag)
        .setCardNsidPrefix(cardNsidPrefix)
        .setFaceUp(true);

    const snapPoint = new MockSnapPoint({
        tags: [snapPointTag],
        localPosition: [0, 0, 0],
    });
    const mat = new MockGameObject({
        snapPoints: [snapPoint],
        templateMetadata: matNsid,
        position: deckPos,
    });
    mockWorld._reset({ gameObjects: [mat] });

    const createCard = (): Card => {
        return new MockCard({
            cardDetails: [new MockCardDetails({ metadata: cardNsidPrefix })],
            position: [-1, -1, -1],
        });
    };
    let card: Card;

    card = createCard();
    expect(card.getStackSize()).toEqual(1);
    expect(card.getPosition().x).toEqual(-1);
    let success: boolean = scgh.recycle(card);
    expect(success).toBeTruthy();
    expect(card.getPosition().x).toEqual(100);
    expect(card.getStackSize()).toEqual(1);

    // Try again (picks up cached result).
    card = createCard();
    expect(card.getStackSize()).toEqual(1);
    success = scgh.recycle(card);
    expect(success).toBeTruthy();
    expect(card.getStackSize()).toEqual(1);

    // And again after deleting mat.
    card = createCard();
    mat.destroy();
    expect(card.getStackSize()).toEqual(1);
    success = scgh.recycle(card);
    expect(success).toBeFalsy();
    expect(card.getStackSize()).toEqual(1);
});

it("recycle (missing mat)", () => {
    const snapPointTag = "my-snap-point-tag";
    const cardNsidPrefix = "my-prefix";

    const scgh = new SimpleCardGarbageHandler()
        .setSnapPointTag(snapPointTag)
        .setCardNsidPrefix(cardNsidPrefix);

    const card: Card = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: cardNsidPrefix })],
    });

    expect(card.getPosition().x).toEqual(0);
    const success: boolean = scgh.recycle(card);
    expect(success).toBeFalsy();
});

it("recycle (missing snap point)", () => {
    const matNsid = "mat:base/my-mat";
    const snapPointTag = "my-snap-point-tag";
    const cardNsidPrefix = "my-prefix";

    const scgh = new SimpleCardGarbageHandler()
        .setSnapPointTag(snapPointTag)
        .setCardNsidPrefix(cardNsidPrefix);

    const mat = new MockGameObject({
        templateMetadata: matNsid,
    });
    mockWorld._reset({ gameObjects: [mat] });

    const card: Card = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: cardNsidPrefix })],
    });

    expect(card.getPosition().x).toEqual(0);
    const success: boolean = scgh.recycle(card);
    expect(success).toBeFalsy();
});

it("reject objects", () => {
    const cardNsidPrefix = "my-prefix";

    const obj = new MockGameObject();
    const deck = new MockCard({
        cardDetails: [
            new MockCardDetails({ metadata: cardNsidPrefix }),
            new MockCardDetails({ metadata: cardNsidPrefix }),
        ],
    });
    const wrongPrefix = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: "wrong" })],
    });

    const scgh = new SimpleCardGarbageHandler().setCardNsidPrefix(
        cardNsidPrefix
    );

    expect(scgh.canRecycle(obj)).toBeFalsy();
    expect(() => {
        scgh.recycle(obj);
    }).toThrow();

    expect(scgh.canRecycle(deck)).toBeFalsy();
    expect(() => {
        scgh.recycle(deck);
    }).toThrow();

    expect(scgh.canRecycle(wrongPrefix)).toBeFalsy();
    expect(() => {
        scgh.recycle(wrongPrefix);
    }).toThrow();
});

it("snapped object is not deck", () => {
    const matNsid = "mat:base/my-mat";
    const snapPointTag = "my-snap-point-tag";
    const cardNsidPrefix = "my-prefix";

    const scgh = new SimpleCardGarbageHandler()
        .setSnapPointTag(snapPointTag)
        .setCardNsidPrefix(cardNsidPrefix)
        .setShuffleAfterDiscard(true)
        .setFaceUp(true);

    const notDeck = new MockGameObject();
    const snapPoint = new MockSnapPoint({
        snappedObject: notDeck,
        tags: [snapPointTag],
    });
    const mat = new MockGameObject({
        snapPoints: [snapPoint],
        templateMetadata: matNsid,
    });
    mockWorld._reset({ gameObjects: [mat] });

    const card = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: cardNsidPrefix })],
    });

    const success: boolean = scgh.recycle(card);
    expect(success).toBeTruthy(); // dropped atop notDeck
});
