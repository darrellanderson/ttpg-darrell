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
        .setMatNsid(matNsid)
        .setMatSnapPointTag(snapPointTag)
        .setCardNsidPrefix(cardNsidPrefix)
        .setShuffleAfterDiscard(true);

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

    mockWorld._reset();
});

it("recycle (no deck)", () => {
    const matNsid = "mat:base/my-mat";
    const snapPointTag = "my-snap-point-tag";
    const cardNsidPrefix = "my-prefix";
    const deckPos = new MockVector(100, 0, 0);

    const scgh = new SimpleCardGarbageHandler()
        .setMatNsid(matNsid)
        .setMatSnapPointTag(snapPointTag)
        .setCardNsidPrefix(cardNsidPrefix);

    const snapPoint = new MockSnapPoint({
        tags: [snapPointTag],
        globalPosition: deckPos,
    });
    const mat = new MockGameObject({
        snapPoints: [snapPoint],
        templateMetadata: matNsid,
    });
    mockWorld._reset({ gameObjects: [mat] });

    const card: Card = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: cardNsidPrefix })],
    });

    expect(card.getPosition().x).toEqual(0);
    let success: boolean = scgh.recycle(card);
    expect(success).toBeTruthy();
    expect(card.getPosition().x).toEqual(100);

    // Try again (picks up cached result).
    success = scgh.recycle(card);
    expect(success).toBeTruthy();

    // And again after deleting mat.
    mat.destroy();
    success = scgh.recycle(card);
    expect(success).toBeFalsy();

    mockWorld._reset();
});

it("recycle (missing mat)", () => {
    const matNsid = "mat:base/my-mat";
    const snapPointTag = "my-snap-point-tag";
    const cardNsidPrefix = "my-prefix";
    const deckPos = new MockVector(100, 0, 0);

    const scgh = new SimpleCardGarbageHandler()
        .setMatNsid(matNsid)
        .setMatSnapPointTag(snapPointTag)
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
    const deckPos = new MockVector(100, 0, 0);

    const scgh = new SimpleCardGarbageHandler()
        .setMatNsid(matNsid)
        .setMatSnapPointTag(snapPointTag)
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

    mockWorld._reset();
});
