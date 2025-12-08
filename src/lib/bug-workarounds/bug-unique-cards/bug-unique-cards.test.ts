import { Card, CardDetails, Player } from "@tabletop-playground/api";
import { MockCard, MockCardDetails, MockPlayer, mockWorld } from "ttpg-mock";
import { BugUniqueCards } from "./bug-unique-cards";
import { ErrorHandler } from "../../error-handler/error-handler";

it("init", () => {
    new BugUniqueCards().init();
});

it("process", () => {
    jest.spyOn(console, "log").mockImplementation(() => {});

    const cardDetails: CardDetails = new MockCardDetails({ metadata: "my-1" });
    const deck: MockCard = new MockCard({
        cardDetails: [cardDetails],
    });
    mockWorld._reset({ gameObjects: [deck] });

    new BugUniqueCards().init();

    let lastError: string = "";
    ErrorHandler.onError.add((error: string): void => {
        lastError = error;
    });

    expect(deck.getStackSize()).toEqual(1);
    expect(lastError).toEqual("");

    const dupCard: Card = new MockCard({ cardDetails: [cardDetails] });
    const player: Player = new MockPlayer();
    deck._addCardsAsPlayer(
        dupCard,
        undefined,
        undefined,
        undefined,
        undefined,
        player
    );
    process.flushTicks();

    expect(deck.getStackSize()).toEqual(1);
    expect(lastError).toEqual(
        'BugUniqueCards: removed 1 duplicates, 1 remain [first dup: "my-1"]'
    );
    jest.restoreAllMocks();
});
