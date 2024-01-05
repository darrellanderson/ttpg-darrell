import { OnCardBecameSingletonOrDeck } from "./on-card-became-singleton-or-deck";

it("init and reset", () => {
    const onCardBecameSingletonOrDeck = new OnCardBecameSingletonOrDeck();
    onCardBecameSingletonOrDeck.init();
    onCardBecameSingletonOrDeck._reset();
});

it("trigger onSingletonCardMadeDeck", () => {});
