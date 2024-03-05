import {
    MockCard,
    MockCardDetails,
    MockGameObject,
    MockPlayer,
    mockWorld,
} from "ttpg-mock";
import { ReportRemaining } from "./report-remaining";
import { CardDetails, Player } from "@tabletop-playground/api";
import { Broadcast } from "../../broadcast/broadcast";

it("init", () => {
    new ReportRemaining("me-cardNsidPrefix").init();
});

it("customActionHandler", () => {
    const cardDetails1: CardDetails = new MockCardDetails({
        metadata: "card1",
        name: "name1",
    });
    const cardDetails2: CardDetails = new MockCardDetails({
        metadata: "card1",
        name: "name2",
    });
    const player: Player = new MockPlayer();
    const identifier: string = ReportRemaining._actionName;

    const deck: MockCard = new MockCard({
        cardDetails: [
            cardDetails2,
            cardDetails1,
            cardDetails2,
            cardDetails1,
            cardDetails1,
        ],
    });

    mockWorld._reset({ gameObjects: [deck] });
    new ReportRemaining("card").init();

    deck._customActionAsPlayer(player, identifier);
    expect(Broadcast.lastMessage).toEqual("remaining: name1 (3), name2 (2)");

    // Test coverage.
    deck._customActionAsPlayer(player, "wrong");
    new MockGameObject()._customActionAsPlayer(player, identifier);
});

it("custom action handler (single card)", () => {
    const cardDetails1: CardDetails = new MockCardDetails({
        metadata: "card1",
        name: "name1",
    });

    const player: Player = new MockPlayer();
    const identifier: string = ReportRemaining._actionName;

    const deck: MockCard = new MockCard({
        cardDetails: [cardDetails1],
    });

    mockWorld._reset({ gameObjects: [deck] });
    new ReportRemaining("card").init();

    deck._customActionAsPlayer(player, identifier);
    expect(Broadcast.lastMessage).toEqual("remaining: name1");
});
