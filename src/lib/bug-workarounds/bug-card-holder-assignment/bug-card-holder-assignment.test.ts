import { MockCardHolder, MockPlayer, mockWorld } from "ttpg-mock";
import { BugCardHolderAssignment } from "./bug-card-holder-assignment";

it("init", () => {
    const bcha = new BugCardHolderAssignment("my-cardholder-nsid");
    bcha.init();
    bcha.destroy();
});

it("broken holder", () => {
    jest.spyOn(console, "log").mockImplementation(() => {});

    const nsid = "my-cardholder-nsid";
    const cardHolder = new MockCardHolder({
        owningPlayerSlot: 2,
        templateMetadata: nsid,
    });
    const player = new MockPlayer({ slot: 2 });

    mockWorld._reset({
        gameObjects: [cardHolder],
        players: [player],
    });

    expect(player.getHandHolder()).toBeUndefined();

    const bcha = new BugCardHolderAssignment(nsid);
    bcha._intervalRunnable();

    expect(player.getHandHolder()).toBeDefined();
    expect(player.getHandHolder()).toBe(cardHolder);

    jest.restoreAllMocks();
});
