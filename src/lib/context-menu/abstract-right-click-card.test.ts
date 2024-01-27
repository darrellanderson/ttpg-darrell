import { Card, GameObject, Player } from "@tabletop-playground/api";
import {
    MockCard,
    MockCardDetails,
    MockMulticastDelegate,
    MockPlayer,
    mockWorld,
} from "ttpg-mock";
import { AbstractRightClickCard } from "./abstract-right-click-card";
import { OnCardBecameSingletonOrDeck } from "../event/on-card-became-singleton-or-deck";

it("constructor", () => {
    class MyClass extends AbstractRightClickCard {}

    const cardNsid = "my-nsid";
    const customActionName = "* My action";
    const customActionHandler = (
        object: GameObject,
        player: Player,
        identifier: string
    ) => {};
    new MyClass(cardNsid, customActionName, customActionHandler);
});

it("singleton yes", () => {
    const cardNsid = "my-nsid";
    const card = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: cardNsid })],
    });
    const player = new MockPlayer();
    mockWorld._reset({ gameObjects: [card] });
    new OnCardBecameSingletonOrDeck().init();

    let customActionCount = 0;
    class MyClass extends AbstractRightClickCard {}
    const customActionName = "* My action";
    const customActionHandler = (
        object: GameObject,
        player: Player,
        identifier: string
    ) => {
        customActionCount++;
    };
    new MyClass(cardNsid, customActionName, customActionHandler).init();
    process.flushTicks();

    const onCustomAction = card.onCustomAction as MockMulticastDelegate<
        (object: MockCard, player: Player, identifier: string) => void
    >;
    const onInserted = card.onInserted as MockMulticastDelegate<
        (
            card: MockCard,
            insertedCard: Card,
            position: number,
            player?: Player
        ) => void
    >;

    expect(customActionCount).toEqual(0);

    onCustomAction._trigger(card, player, customActionName);
    expect(customActionCount).toEqual(1);

    // make deck.
    const card2 = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: "card2-nsid" })],
    });
    expect(card.getStackSize()).toEqual(1);
    expect(card2.getStackSize()).toEqual(1);
    expect(card2.isValid()).toBeTruthy();

    const addSucceeded: boolean = card.addCards(card2);
    onInserted._trigger(card, card2, 1, player);
    process.flushTicks();

    expect(addSucceeded).toBeTruthy();
    expect(card.getStackSize()).toEqual(2);
    expect(card2.isValid()).toBeFalsy();

    // Custom event handler got removed.
    onCustomAction._trigger(card, player, customActionName);
    expect(customActionCount).toEqual(1);
});
