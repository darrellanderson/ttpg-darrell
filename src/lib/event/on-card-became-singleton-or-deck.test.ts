import { MockCard, MockCardDetails, mockWorld } from "ttpg-mock";
import { OnCardBecameSingletonOrDeck } from "./on-card-became-singleton-or-deck";

it("init", () => {
    const onCardBecameSingletonOrDeck = new OnCardBecameSingletonOrDeck();
    onCardBecameSingletonOrDeck.init();
});

it("initial onSingletonCardCreated", () => {
    const card = new MockCard({ cardDetails: [new MockCardDetails()] });
    mockWorld._reset({ gameObjects: [card] });
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
