import { Card } from "@tabletop-playground/api";
import { OnCardBecameSingletonOrDeck } from "./on-card-became-singleton-or-deck";
import { NSID } from "../nsid/nsid";

console.log("OnCardBecameSingletonOrDeck reporter");

new OnCardBecameSingletonOrDeck().init();

OnCardBecameSingletonOrDeck.onSingletonCardCreated.add((card: Card) => {
    const nsid: string = NSID.get(card);
    console.log(`onSingletonCardCreated: [${nsid}]`);
});

OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add(
    (card: Card, oldNsid: string) => {
        const nsids: string[] = NSID.getDeck(card);
        console.log(
            `onSingletonCardMadeDeck: [${nsids.join(", ")}], oldNsid: "${oldNsid}"`
        );
    }
);
