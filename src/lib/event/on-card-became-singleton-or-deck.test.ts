import {
    MockCard,
    MockCardDetails,
    MockGameObject,
    MockMulticastDelegate,
    mockWorld,
} from "ttpg-mock";
import { OnCardBecameSingletonOrDeck } from "./on-card-became-singleton-or-deck";
import {
    Card,
    GameObject,
    Player,
    globalEvents,
} from "@tabletop-playground/api";

it("init", () => {
    const onCardBecameSingletonOrDeck = new OnCardBecameSingletonOrDeck();
    onCardBecameSingletonOrDeck.init();
});

it("initial onSingletonCardCreated", () => {
    const card = new MockCard({ cardDetails: [new MockCardDetails()] });
    mockWorld._reset({ gameObjects: [new MockGameObject(), card] });
    process.clearTicks();

    let singletonCreatedCount = 0;
    let madeDeckCount = 0;
    OnCardBecameSingletonOrDeck.onSingletonCardCreated.add(() => {
        singletonCreatedCount++;
    });
    OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add(() => {
        madeDeckCount++;
    });

    new OnCardBecameSingletonOrDeck().init(); // queues runnable
    process.flushTicks(); // run it

    expect(singletonCreatedCount).toEqual(1);
    expect(madeDeckCount).toEqual(0);
});

it("initial onSingletonCardMadeDeck", () => {
    const deck = new MockCard({
        cardDetails: [new MockCardDetails(), new MockCardDetails()],
    });
    mockWorld._reset({ gameObjects: [deck] });
    process.clearTicks();

    let singletonCreatedCount = 0;
    let madeDeckCount = 0;
    OnCardBecameSingletonOrDeck.onSingletonCardCreated.add(() => {
        singletonCreatedCount++;
    });
    OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add(() => {
        madeDeckCount++;
    });

    const onCardBecameSingletonOrDeck = new OnCardBecameSingletonOrDeck();
    onCardBecameSingletonOrDeck.init();
    process.flushTicks(); // card/deck events delayed by a frame

    expect(singletonCreatedCount).toEqual(0);
    expect(madeDeckCount).toEqual(1);
});

it("create deck", () => {
    const card1 = new MockCard({ cardDetails: [new MockCardDetails()] });
    const card2 = new MockCard({ cardDetails: [new MockCardDetails()] });
    mockWorld._reset({ gameObjects: [card1, card2] });

    new OnCardBecameSingletonOrDeck().init(); // queues runnable
    process.flushTicks(); // run it

    let singletonCreatedCount = 0;
    let madeDeckCount = 0;
    OnCardBecameSingletonOrDeck.onSingletonCardCreated.add(() => {
        singletonCreatedCount++;
    });
    OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add(() => {
        madeDeckCount++;
    });
    expect(singletonCreatedCount).toEqual(0);
    expect(madeDeckCount).toEqual(0);

    const onInserted = card1.onInserted as MockMulticastDelegate<
        (
            deck: MockCard, // "this" means test must name mock type
            insertedCard: Card,
            position: number,
            player?: Player
        ) => void
    >;

    card1.addCards(card2);
    onInserted._trigger(card1, card2, 0);
    process.flushTicks();

    expect(singletonCreatedCount).toEqual(0);
    expect(madeDeckCount).toEqual(1);
});

it("create singleton (deck remains)", () => {
    const deck = new MockCard({
        cardDetails: [
            new MockCardDetails(),
            new MockCardDetails(),
            new MockCardDetails(),
        ],
    });
    mockWorld._reset({ gameObjects: [deck] });

    new OnCardBecameSingletonOrDeck().init(); // queues runnable
    process.flushTicks(); // run it

    let singletonCreatedCount = 0;
    let madeDeckCount = 0;
    OnCardBecameSingletonOrDeck.onSingletonCardCreated.add(() => {
        singletonCreatedCount++;
    });
    OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add(() => {
        madeDeckCount++;
    });
    expect(singletonCreatedCount).toEqual(0);
    expect(madeDeckCount).toEqual(0);

    const onObjectCreated =
        globalEvents.onObjectCreated as MockMulticastDelegate<
            (object: GameObject) => void
        >;
    const onRemoved = deck.onRemoved as MockMulticastDelegate<
        (
            deck: MockCard, // "this" means test must name mock type
            removedCard: Card,
            position: number,
            player?: Player
        ) => void
    >;

    const removedCard: Card | undefined = deck.takeCards(1);
    if (!removedCard) {
        throw new Error("takeCards");
    }
    onObjectCreated._trigger(removedCard);
    onRemoved._trigger(deck, removedCard, 0);
    process.flushTicks();
    process.flushTicks(); // onObjectCreated triggers onSingleCardCreated, which waits

    expect(singletonCreatedCount).toEqual(1);
    expect(madeDeckCount).toEqual(0);
});

it("create singleton (card remains)", () => {
    const deck = new MockCard({
        cardDetails: [new MockCardDetails(), new MockCardDetails()],
    });
    mockWorld._reset({ gameObjects: [deck] });

    new OnCardBecameSingletonOrDeck().init(); // queues runnable
    process.flushTicks(); // run it

    let singletonCreatedCount = 0;
    let madeDeckCount = 0;
    OnCardBecameSingletonOrDeck.onSingletonCardCreated.add(() => {
        singletonCreatedCount++;
    });
    OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add(() => {
        madeDeckCount++;
    });
    expect(singletonCreatedCount).toEqual(0);
    expect(madeDeckCount).toEqual(0);

    const onObjectCreated =
        globalEvents.onObjectCreated as MockMulticastDelegate<
            (object: GameObject) => void
        >;
    const onRemoved = deck.onRemoved as MockMulticastDelegate<
        (
            deck: MockCard, // "this" means test must name mock type
            removedCard: Card,
            position: number,
            player?: Player
        ) => void
    >;

    const removedCard: Card | undefined = deck.takeCards(1);
    if (!removedCard) {
        throw new Error("takeCards");
    }
    onObjectCreated._trigger(removedCard);
    onRemoved._trigger(deck, removedCard, 0);
    process.flushTicks();
    process.flushTicks(); // onObjectCreated triggers onSingleCardCreated, which waits

    expect(singletonCreatedCount).toEqual(2);
    expect(madeDeckCount).toEqual(0);
});

it("destroy before nextTicks can process", () => {
    const card1 = new MockCard({
        cardDetails: [new MockCardDetails()],
    });
    const card2 = new MockCard({
        cardDetails: [new MockCardDetails()],
    });
    mockWorld._reset({ gameObjects: [card1, card2] });
    process.clearTicks();

    let singletonCreatedCount = 0;
    let madeDeckCount = 0;
    OnCardBecameSingletonOrDeck.onSingletonCardCreated.add(() => {
        singletonCreatedCount++;
    });
    OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add(() => {
        madeDeckCount++;
    });

    const onCardBecameSingletonOrDeck = new OnCardBecameSingletonOrDeck();
    onCardBecameSingletonOrDeck.init();

    card2.destroy(); // make invalid before nextTick processing
    process.flushTicks(); // card/deck events delayed by a frame

    expect(singletonCreatedCount).toEqual(1);
    expect(madeDeckCount).toEqual(0);
});
