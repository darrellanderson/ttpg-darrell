import {
    MockCardDetails,
    MockCardParams,
    MockPackage,
    mockWorld,
} from "ttpg-mock";
import { NSID } from "../nsid/nsid";
import { Spawn } from "./spawn";
import { Card } from "@tabletop-playground/api";

it("spawn", () => {
    const spawn: Spawn = new Spawn();
    jest.spyOn(console, "log").mockImplementation(() => {});

    const nsid = "my-nsid";
    const templateId = "my-template-id";
    const metadata = "my-metadata";
    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            [templateId]: { templateMetadata: metadata },
        },
    });

    // Template not (yet) registered.
    let obj = spawn.spawn(nsid, [0, 0, 0]);
    expect(obj).toBeUndefined();

    // Try again, but with known template.
    spawn.inject({ [nsid]: templateId });
    obj = spawn.spawn(nsid, [0, 0, 0]);
    expect(obj?.getTemplateMetadata()).toEqual(metadata);

    jest.restoreAllMocks();
});

it("spawnOrThrow", () => {
    const spawn: Spawn = new Spawn();
    jest.spyOn(console, "log").mockImplementation(() => {});

    const nsid = "my-nsid";
    const templateId = "my-template-id";
    const metadata = "my-metadata";
    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            [templateId]: { templateMetadata: metadata },
        },
    });

    // Yes.
    spawn.inject({ [nsid]: templateId });
    const obj = spawn.spawnOrThrow(nsid, [0, 0, 0]);
    expect(obj?.getTemplateMetadata()).toEqual(metadata);

    // No.
    expect(() => {
        spawn.spawnOrThrow("no-such-nsid", [0, 0, 0]);
    }).toThrow();

    jest.restoreAllMocks();
});

it("spawnMergeDecksWithNsidPrefixOrThrow", () => {
    const spawn: Spawn = new Spawn();
    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            template1: {
                _objType: "Card",
                cardDetails: [
                    new MockCardDetails({ metadata: "deck1card1" }),
                    new MockCardDetails({ metadata: "deck1card2" }),
                ],
            } as MockCardParams,
            template2: {
                _objType: "Card",
                cardDetails: [
                    new MockCardDetails({ metadata: "deck2card1" }),
                    new MockCardDetails({ metadata: "deck2card2" }),
                ],
            } as MockCardParams,
        },
    });

    spawn.inject({ deck1: "template1", deck2: "template2" });
    const deck: Card = spawn.spawnMergeDecksWithNsidPrefixOrThrow(
        "deck",
        [0, 0, 0]
    );
    expect(deck).toBeDefined();
    if (!deck) {
        throw new Error("x");
    }

    const nsids: Array<string> = NSID.getDeck(deck);
    expect(nsids).toEqual([
        "deck1card1",
        "deck1card2",
        "deck2card1",
        "deck2card2",
    ]);
});

it("spawnMergeDecks", () => {
    const spawn: Spawn = new Spawn();
    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            template1: {
                _objType: "Card",
                cardDetails: [
                    new MockCardDetails({ metadata: "deck1card1" }),
                    new MockCardDetails({ metadata: "deck1card2" }),
                ],
            } as MockCardParams,
            template2: {
                _objType: "Card",
                cardDetails: [
                    new MockCardDetails({ metadata: "deck2card1" }),
                    new MockCardDetails({ metadata: "deck2card2" }),
                ],
            } as MockCardParams,
        },
    });

    spawn.inject({ deck1: "template1", deck2: "template2" });
    const deck: Card | undefined = spawn.spawnMergeDecks(
        ["deck1", "deck2"],
        [0, 0, 0]
    );
    expect(deck).toBeDefined();
    if (!deck) {
        throw new Error("x");
    }

    const nsids: Array<string> = NSID.getDeck(deck);
    expect(nsids).toEqual([
        "deck1card1",
        "deck1card2",
        "deck2card1",
        "deck2card2",
    ]);
});

it("spawnMergedDecksOrThrow", () => {
    const spawn: Spawn = new Spawn();
    jest.spyOn(console, "log").mockImplementation(() => {});

    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            template1: {
                _objType: "Card",
                cardDetails: [
                    new MockCardDetails({ metadata: "deck1card1" }),
                    new MockCardDetails({ metadata: "deck1card2" }),
                ],
            } as MockCardParams,
            template2: {
                _objType: "Card",
                cardDetails: [
                    new MockCardDetails({ metadata: "deck2card1" }),
                    new MockCardDetails({ metadata: "deck2card2" }),
                ],
            } as MockCardParams,
        },
    });

    spawn.inject({ deck1: "template1", deck2: "template2" });

    // Yes.
    const deck: Card = spawn.spawnMergeDecksOrThrow(
        ["deck1", "deck2"],
        [0, 0, 0]
    );
    const nsids: Array<string> = NSID.getDeck(deck);
    expect(nsids).toEqual([
        "deck1card1",
        "deck1card2",
        "deck2card1",
        "deck2card2",
    ]);

    // No.
    expect(() => {
        spawn.spawnMergeDecksOrThrow(["no-such-nsid"]);
    }).toThrow();

    jest.restoreAllMocks();
});

it("spawnMergeDecks (empty list)", () => {
    const spawn: Spawn = new Spawn();
    jest.spyOn(console, "log").mockImplementation(() => {});

    const result: Card | undefined = spawn.spawnMergeDecks([]);
    expect(result).toBeUndefined();

    jest.restoreAllMocks();
});

it("spawnMergeDecks (bad nsid)", () => {
    const spawn: Spawn = new Spawn();
    jest.spyOn(console, "log").mockImplementation(() => {});

    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            template1: {
                _objType: "Card",
                cardDetails: [
                    new MockCardDetails({ metadata: "deck1card1" }),
                    new MockCardDetails({ metadata: "deck1card2" }),
                ],
            } as MockCardParams,
        },
    });

    spawn.inject({ deck1: "template1" });

    const result: Card | undefined = spawn.spawnMergeDecks([
        "deck1",
        "unknown.nsid",
    ]);
    expect(result).toBeUndefined();

    jest.restoreAllMocks();
});

it("spawnMergeDecks (not a card)", () => {
    const spawn: Spawn = new Spawn();
    jest.spyOn(console, "log").mockImplementation(() => {});

    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            template1: {
                _objType: "Card",
                cardDetails: [
                    new MockCardDetails({ metadata: "deck1card1" }),
                    new MockCardDetails({ metadata: "deck1card2" }),
                ],
            } as MockCardParams,
            template2: {
                _objType: "GameObject",
            },
        },
    });

    spawn.inject({ deck1: "template1", obj1: "template2" });

    const result: Card | undefined = spawn.spawnMergeDecks(["deck1", "obj1"]);
    expect(result).toBeUndefined();

    jest.restoreAllMocks();
});

it("spawnMergeDecks (addCards err)", () => {
    const spawn: Spawn = new Spawn();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(Card.prototype, "addCards").mockImplementation(() => {
        return false;
    });

    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            template1: {
                _objType: "Card",
                cardDetails: [
                    new MockCardDetails({ metadata: "deck1card1" }),
                    new MockCardDetails({ metadata: "deck1card2" }),
                ],
            } as MockCardParams,
            template2: {
                _objType: "Card",
                cardDetails: [
                    new MockCardDetails({ metadata: "deck2card1" }),
                    new MockCardDetails({ metadata: "deck2card2" }),
                ],
            } as MockCardParams,
        },
    });

    spawn.inject({ deck1: "template1", deck2: "template2" });

    const result: Card | undefined = spawn.spawnMergeDecks(["deck1", "deck2"]);
    expect(result).toBeUndefined();

    jest.restoreAllMocks();
});

it("has", () => {
    const spawn: Spawn = new Spawn();
    const nsid = "my-nsid";
    const templateId = "my-template-id";
    spawn.clear();
    expect(spawn.has(nsid)).toBeFalsy();
    spawn.inject({ [nsid]: templateId });
    expect(spawn.has(nsid)).toBeTruthy();
    spawn.clear();
});

it("getAllNSIDs", () => {
    const spawn: Spawn = new Spawn();
    const nsid = "my-nsid";
    const templateId = "my-template-id";
    spawn.clear();
    expect(spawn.getAllNsids()).toEqual([]);
    spawn.inject({ [nsid]: templateId });
    expect(spawn.getAllNsids()).toEqual([nsid]);
    spawn.clear();
});

it("getTemplateIdOrThrow", () => {
    const spawn: Spawn = new Spawn();
    const nsid = "my-nsid";
    const templateId = "my-template-id";
    spawn.clear();
    expect(() => {
        spawn.getTemplateIdOrThrow(nsid);
    }).toThrow();
    spawn.inject({ [nsid]: templateId });
    expect(spawn.getTemplateIdOrThrow(nsid)).toEqual(templateId);
    spawn.clear();
});

it("validate", () => {
    const spawn: Spawn = new Spawn();
    const nsid = "my-nsid";
    const templateId = "my-template-id";
    spawn.clear();
    spawn.inject({ [nsid]: templateId });

    // Spawn knows about the template id, but world does not.
    expect(() => {
        spawn.validate();
    }).toThrow();

    // Tell world about template id.
    mockWorld._reset({
        packages: [new MockPackage({ templateIds: [templateId] })],
    });
    spawn.validate(); // good!
});
