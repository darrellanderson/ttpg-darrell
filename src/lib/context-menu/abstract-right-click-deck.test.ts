import { Card, GameObject, Player } from "@tabletop-playground/api";
import { AbstractRightClickDeck } from "./abstract-right-click-deck";
import {
    MockCard,
    MockCardDetails,
    MockMulticastDelegate,
    MockPlayer,
    mockWorld,
} from "ttpg-mock";
import { OnCardBecameSingletonOrDeck } from "../event/on-card-became-singleton-or-deck";

it("constructor", () => {
    class MyClass extends AbstractRightClickDeck {}

    const deckNsidPrefix = "my-nsid";
    const customActionName = "* My action";
    const customActionHandler = (
        object: GameObject,
        player: Player,
        identifier: string
    ) => {};
    new MyClass(deckNsidPrefix, customActionName, customActionHandler);
});

it("deck yes", () => {
    const deckNsidPrefix = "my-nsid";
    const deck = new MockCard({
        cardDetails: [
            new MockCardDetails({ metadata: deckNsidPrefix + "1" }),
            new MockCardDetails({ metadata: deckNsidPrefix + "2" }),
        ],
    });
    const player = new MockPlayer();
    mockWorld._reset({ gameObjects: [deck] });
    new OnCardBecameSingletonOrDeck().init();

    let customActionCount = 0;
    class MyClass extends AbstractRightClickDeck {}
    const customActionName = "* My action";
    const customActionHandler = (
        object: GameObject,
        player: Player,
        identifier: string
    ) => {
        customActionCount++;
    };
    new MyClass(deckNsidPrefix, customActionName, customActionHandler).init();
    process.flushTicks();

    const onCustomAction = deck.onCustomAction as MockMulticastDelegate<
        (object: MockCard, player: Player, identifier: string) => void
    >;
    const onRemoved = deck.onRemoved as MockMulticastDelegate<
        (
            deck: MockCard,
            removedCard: Card,
            position: number,
            player?: Player
        ) => void
    >;

    expect(customActionCount).toEqual(0);

    onCustomAction._trigger(deck, player, customActionName);
    expect(customActionCount).toEqual(1);

    // convert deck into singleton
    expect(deck.getStackSize()).toEqual(2);

    const card: Card | undefined = deck.takeCards(1);
    expect(card).toBeDefined();
    if (!card) {
        throw new Error("takeCards failed");
    }
    onRemoved._trigger(deck, card, 0, player);
    process.flushTicks();

    // Custom event handler got removed.
    onCustomAction._trigger(deck, player, customActionName);
    expect(customActionCount).toEqual(1);
});

it("deck no", () => {
    const deckNsidPrefix = "my-nsid";
    const deck = new MockCard({
        cardDetails: [
            new MockCardDetails({ metadata: "other1" }),
            new MockCardDetails({ metadata: "other2" }),
        ],
    });
    const player = new MockPlayer();
    mockWorld._reset({ gameObjects: [deck] });
    new OnCardBecameSingletonOrDeck().init();

    let customActionCount = 0;
    class MyClass extends AbstractRightClickDeck {}
    const customActionName = "* My action";
    const customActionHandler = (
        object: GameObject,
        player: Player,
        identifier: string
    ) => {
        customActionCount++;
    };
    new MyClass(deckNsidPrefix, customActionName, customActionHandler).init();
    process.flushTicks();

    const onCustomAction = deck.onCustomAction as MockMulticastDelegate<
        (object: MockCard, player: Player, identifier: string) => void
    >;
    const onRemoved = deck.onRemoved as MockMulticastDelegate<
        (
            deck: MockCard,
            removedCard: Card,
            position: number,
            player?: Player
        ) => void
    >;

    expect(customActionCount).toEqual(0);

    // Cards do not match require nsid prefix, no handler installed.
    onCustomAction._trigger(deck, player, customActionName);
    expect(customActionCount).toEqual(0);
});
