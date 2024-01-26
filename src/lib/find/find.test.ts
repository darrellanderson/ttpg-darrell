import {
    MockCard,
    MockCardDetails,
    MockCardHolder,
    MockContainer,
    MockDice,
    MockGameObject,
    MockMultistateObject,
    MockSnapPoint,
    MockStaticObject,
    mockWorld,
} from "ttpg-mock";
import { Find } from "./find";
import {
    Card,
    CardHolder,
    Container,
    Dice,
    GameObject,
    MultistateObject,
    SnapPoint,
} from "@tabletop-playground/api";

it("findCard", () => {
    const nsid = "my-nsid";
    const card = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: nsid })],
    });
    mockWorld._reset({ gameObjects: [card] });

    const find = new Find();
    const found: Card | undefined = find.findCard(nsid);
    expect(found).toEqual(card);
});

it("findCard (not a card)", () => {
    const nsid = "my-nsid";
    const obj = new MockGameObject({
        templateMetadata: nsid,
    });
    mockWorld._reset({ gameObjects: [obj] });

    const find = new Find();
    expect(() => {
        find.findCard(nsid);
    }).toThrow();
});

it("findCardHolder", () => {
    const nsid = "my-nsid";
    const holder = new MockCardHolder({ templateMetadata: nsid });
    mockWorld._reset({ gameObjects: [holder] });

    const find = new Find();
    const found: CardHolder | undefined = find.findCardHolder(nsid);
    expect(found).toEqual(holder);
});

it("findCardHolder (not a card holder)", () => {
    const nsid = "my-nsid";
    const obj = new MockGameObject({
        templateMetadata: nsid,
    });
    mockWorld._reset({ gameObjects: [obj] });

    const find = new Find();
    expect(() => {
        find.findCardHolder(nsid);
    }).toThrow();
});

it("findCardHolderBySlot", () => {
    const playerSlot = 7;
    const holder = new MockCardHolder({ owningPlayerSlot: playerSlot });
    mockWorld._reset({
        gameObjects: [new MockGameObject(), new MockCardHolder(), holder],
    });

    const find = new Find();
    let found: CardHolder | undefined;

    found = find.findCardHolderBySlot(playerSlot);
    expect(found).toEqual(holder);

    // Cached.
    found = find.findCardHolderBySlot(playerSlot);
    expect(found).toEqual(holder);
});

it("findCardHolderBySlot (missing)", () => {
    const playerSlot = 7;

    const find = new Find();
    let found: CardHolder | undefined;

    found = find.findCardHolderBySlot(playerSlot);
    expect(found).toBeUndefined();
});

it("findContainer", () => {
    const nsid = "my-nsid";
    const container = new MockContainer({ templateMetadata: nsid });
    mockWorld._reset({ gameObjects: [container] });

    const find = new Find();
    const found: Container | undefined = find.findContainer(nsid);
    expect(found).toEqual(container);
});

it("findContainer (not a container)", () => {
    const nsid = "my-nsid";
    const obj = new MockGameObject({
        templateMetadata: nsid,
    });
    mockWorld._reset({ gameObjects: [obj] });

    const find = new Find();
    expect(() => {
        find.findContainer(nsid);
    }).toThrow();
});

it("findDeckOrDiscard (deck)", () => {
    const deckSnapPointTag = "deck-snappoint";
    const deck = new MockCard();
    const mat = new MockGameObject({
        snapPoints: [
            new MockSnapPoint({
                snappedObject: deck,
                tags: [deckSnapPointTag],
            }),
        ],
    });
    mockWorld._reset({ gameObjects: [deck, mat] });

    const find = new Find();
    const found: Card | undefined = find.findDeckOrDiscard(deckSnapPointTag);
    expect(found).toEqual(deck);
});

it("findDeckOrDiscard (discard)", () => {
    const deckSnapPointTag = "deck-snappoint";
    const discardSnapPointTag = "discard-snappoint";
    const discard = new MockCard();
    const mat = new MockGameObject({
        snapPoints: [
            new MockSnapPoint({
                tags: [deckSnapPointTag],
            }),
            new MockSnapPoint({
                snappedObject: discard,
                tags: [discardSnapPointTag],
            }),
        ],
    });
    mockWorld._reset({ gameObjects: [discard, mat] });

    const find = new Find();
    const found: Card | undefined = find.findDeckOrDiscard(
        deckSnapPointTag,
        discardSnapPointTag,
        true // shuffle discard
    );
    expect(found).toEqual(discard);
});

it("findDeckOrDiscard (missing deck snap point)", () => {
    const deckSnapPointTag = "deck-snappoint";
    const find = new Find();
    const found: Card | undefined = find.findDeckOrDiscard(deckSnapPointTag);
    expect(found).toBeUndefined();
});

it("findDeckOrDiscard (no discard snap point named)", () => {
    const deckSnapPointTag = "deck-snappoint";
    const mat = new MockGameObject({
        snapPoints: [
            new MockSnapPoint({
                tags: [deckSnapPointTag],
            }),
        ],
    });
    mockWorld._reset({ gameObjects: [mat] });

    const find = new Find();
    const found: Card | undefined = find.findDeckOrDiscard(deckSnapPointTag);
    expect(found).toBeUndefined();
});

it("findDeckOrDiscard (missing discard snap point)", () => {
    const deckSnapPointTag = "deck-snappoint";
    const discardSnapPointTag = "discard-snappoint";
    const mat = new MockGameObject({
        snapPoints: [
            new MockSnapPoint({
                tags: [deckSnapPointTag],
            }),
        ],
    });
    mockWorld._reset({ gameObjects: [mat] });

    const find = new Find();
    const found: Card | undefined = find.findDeckOrDiscard(
        deckSnapPointTag,
        discardSnapPointTag
    );
    expect(found).toBeUndefined();
});

it("findDeckOrDiscard (missing discard)", () => {
    const deckSnapPointTag = "deck-snappoint";
    const discardSnapPointTag = "discard-snappoint";
    const mat = new MockGameObject({
        snapPoints: [
            new MockSnapPoint({
                tags: [deckSnapPointTag],
            }),
            new MockSnapPoint({
                tags: [discardSnapPointTag],
            }),
        ],
    });
    mockWorld._reset({ gameObjects: [mat] });

    const find = new Find();
    const found: Card | undefined = find.findDeckOrDiscard(
        deckSnapPointTag,
        discardSnapPointTag
    );
    expect(found).toBeUndefined();
});

it("findDice", () => {
    const nsid = "my-nsid";
    const dice = new MockDice({ templateMetadata: nsid });
    mockWorld._reset({ gameObjects: [dice] });

    const find = new Find();
    const found: Dice | undefined = find.findDice(nsid);
    expect(found).toEqual(dice);
});

it("findDice (not a dice)", () => {
    const nsid = "my-nsid";
    const obj = new MockGameObject({
        templateMetadata: nsid,
    });
    mockWorld._reset({ gameObjects: [obj] });

    const find = new Find();
    expect(() => {
        find.findDice(nsid);
    }).toThrow();
});

it("findGameObject", () => {
    const nsid = "my-nsid";
    const gameObject = new MockGameObject({ templateMetadata: nsid });
    mockWorld._reset({ gameObjects: [new MockGameObject(), gameObject] });

    const find = new Find();
    let found: GameObject | undefined;

    found = find.findGameObject(nsid);
    expect(found).toEqual(gameObject);

    // Check cache.
    found = find.findGameObject(nsid);
    expect(found).toEqual(gameObject);
});

it("findGameObject (owned)", () => {
    const nsid = "my-nsid";
    const playerSlot = 7;
    const objNo = new MockGameObject({ templateMetadata: nsid });
    const objYes = new MockGameObject({
        templateMetadata: nsid,
        owningPlayerSlot: playerSlot,
    });
    mockWorld._reset({ gameObjects: [objNo, objYes] });

    const find = new Find();
    let found: GameObject | undefined;

    found = find.findGameObject(nsid);
    expect(found).toEqual(objNo);

    found = find.findGameObject(nsid, playerSlot);
    expect(found).toEqual(objYes);

    // Check cache
    found = find.findGameObject(nsid, playerSlot);
    expect(found).toEqual(objYes);
});

it("findMultistateObject", () => {
    const nsid = "my-nsid";
    const multistateObject = new MockMultistateObject({
        templateMetadata: nsid,
    });
    mockWorld._reset({ gameObjects: [multistateObject] });

    const find = new Find();
    const found: MultistateObject | undefined = find.findMultistateObject(nsid);
    expect(found).toEqual(multistateObject);
});

it("findMultistateObject (not a multi state object)", () => {
    const nsid = "my-nsid";
    const obj = new MockGameObject({
        templateMetadata: nsid,
    });
    mockWorld._reset({ gameObjects: [obj] });

    const find = new Find();
    expect(() => {
        find.findMultistateObject(nsid);
    }).toThrow();
});

it("findSnapPointByTag (table)", () => {
    const tag = "my-tag";
    const snapPoint = new MockSnapPoint({ tags: [tag] });
    const table = new MockStaticObject({ snapPoints: [snapPoint] });
    mockWorld._reset({ tables: [table] });

    const find = new Find();
    let found: SnapPoint | undefined;

    found = find.findSnapPointByTag(tag);
    expect(found).toEqual(snapPoint);

    // Check cache.
    found = find.findSnapPointByTag(tag);
    expect(found).toEqual(snapPoint);
});
