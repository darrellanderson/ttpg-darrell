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
    let obj = Spawn.spawn(nsid, [0, 0, 0]);
    expect(obj).toBeUndefined();

    // Try again, but with known template.
    Spawn.inject({ [nsid]: templateId });
    obj = Spawn.spawn(nsid, [0, 0, 0]);
    expect(obj?.getTemplateMetadata()).toEqual(metadata);

    jest.restoreAllMocks();
});

it("spawnOrThrow", () => {
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
    Spawn.inject({ [nsid]: templateId });
    const obj = Spawn.spawnOrThrow(nsid, [0, 0, 0]);
    expect(obj?.getTemplateMetadata()).toEqual(metadata);

    // No.
    expect(() => {
        Spawn.spawnOrThrow("no-such-nsid", [0, 0, 0]);
    }).toThrow();
});

it("spawnMergeDecks", () => {
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

    Spawn.inject({ deck1: "template1", deck2: "template2" });
    const deck: Card | undefined = Spawn.spawnMergeDecks(
        ["deck1", "deck2"],
        [0, 0, 0]
    );
    expect(deck).toBeDefined();
    if (!deck) {
        throw new Error("x");
    }

    const nsids: string[] = NSID.getDeck(deck);
    expect(nsids).toEqual([
        "deck1card1",
        "deck1card2",
        "deck2card1",
        "deck2card2",
    ]);
});

it("spawnMergedDecksOrThrow", () => {
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

    Spawn.inject({ deck1: "template1", deck2: "template2" });

    // Yes.
    const deck: Card = Spawn.spawnMergeDecksOrThrow(
        ["deck1", "deck2"],
        [0, 0, 0]
    );
    const nsids: string[] = NSID.getDeck(deck);
    expect(nsids).toEqual([
        "deck1card1",
        "deck1card2",
        "deck2card1",
        "deck2card2",
    ]);

    // No.
    expect(() => {
        Spawn.spawnMergeDecksOrThrow(["no-such-nsid"]);
    }).toThrow();
});

it("has", () => {
    const nsid = "my-nsid";
    const templateId = "my-template-id";
    Spawn.clear();
    expect(Spawn.has(nsid)).toBeFalsy();
    Spawn.inject({ [nsid]: templateId });
    expect(Spawn.has(nsid)).toBeTruthy();
    Spawn.clear();
});

it("validate", () => {
    const nsid = "my-nsid";
    const templateId = "my-template-id";
    Spawn.clear();
    Spawn.inject({ [nsid]: templateId });

    // Spawn knows about the template id, but world does not.
    expect(() => {
        Spawn.validate();
    }).toThrow();

    // Tell world about template id.
    mockWorld._reset({
        packages: [new MockPackage({ templateIds: [templateId] })],
    });
    Spawn.validate(); // good!
});
