import { Card } from "@tabletop-playground/api";
import { AbstractRightClickDeck } from "./abstract-right-click-deck";
import { MockCard, MockCardDetails, MockPlayer, mockWorld } from "ttpg-mock";
import { OnCardBecameSingletonOrDeck } from "../../event/on-card-became-singleton-or-deck";

it("constructor", () => {
    class MyClass extends AbstractRightClickDeck {}

    const deckNsidPrefix = "my-nsid";
    const customActionName = "* My action";
    const customActionHandler = () => {};
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
    const customActionHandler = () => {
        customActionCount++;
    };
    new MyClass(deckNsidPrefix, customActionName, customActionHandler).init();
    process.flushTicks();

    expect(customActionCount).toEqual(0);

    deck._customActionAsPlayer(player, customActionName);
    expect(customActionCount).toEqual(1);

    // convert deck into singleton
    expect(deck.getStackSize()).toEqual(2);

    const card: Card | undefined = deck._takeCardsAsPlayer(
        1,
        undefined,
        undefined,
        undefined,
        player
    );
    expect(card).toBeDefined();
    if (!card) {
        throw new Error("takeCards failed");
    }
    process.flushTicks();

    // Custom event handler got removed.
    deck._customActionAsPlayer(player, customActionName);
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
    const customActionHandler = () => {
        customActionCount++;
    };
    new MyClass(deckNsidPrefix, customActionName, customActionHandler).init();
    process.flushTicks();

    expect(customActionCount).toEqual(0);

    // Cards do not match require nsid prefix, no handler installed.
    deck._customActionAsPlayer(player, customActionName);
    expect(customActionCount).toEqual(0);
});
