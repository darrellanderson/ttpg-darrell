import { CardHolder } from "@tabletop-playground/api";
import { MockCardHolder } from "ttpg-mock";
import { CardHolderPlayerName } from "./cardholder-player-name";

it("constructor", () => {
    const cardHolder: CardHolder = new MockCardHolder();
    new CardHolderPlayerName(cardHolder);
});
