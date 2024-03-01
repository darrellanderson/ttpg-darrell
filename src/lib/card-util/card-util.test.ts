import { Card, CardHolder, Container, Player } from "@tabletop-playground/api";
import { CardUtil } from "./card-util";
import {
    MockCard,
    MockCardDetails,
    MockCardHolder,
    MockContainer,
    MockGameObject,
    MockPlayer,
    MockSnapPoint,
    mockWorld,
} from "ttpg-mock";
import { NSID } from "../nsid/nsid";
import assert from "assert";

it("dealToHolder (player attached)", () => {
    const card: Card = new MockCard();
    const playerSlot: number = 7;
    const cardHolder: CardHolder = new MockCardHolder();
    const player: Player = new MockPlayer({
        handHolder: cardHolder,
        slot: playerSlot,
    });
    mockWorld._reset({ players: [player] });

    const cardUtil = new CardUtil();
    const success = cardUtil.dealToHolder(card, playerSlot);
    expect(success).toBeTruthy();
    expect(cardHolder.getCards()).toEqual([card]);
});

it("dealToHolder (find)", () => {
    const card: Card = new MockCard();
    const playerSlot: number = 7;
    const cardHolder: CardHolder = new MockCardHolder({
        owningPlayerSlot: playerSlot,
    });
    mockWorld._reset({ gameObjects: [cardHolder] });

    const cardUtil = new CardUtil();
    const success = cardUtil.dealToHolder(card, playerSlot);
    expect(success).toBeTruthy();
    expect(cardHolder.getCards()).toEqual([card]);
});

it("dealToHolder (missing)", () => {
    const card: Card = new MockCard();
    const playerSlot: number = 7;

    const cardUtil = new CardUtil();
    const success = cardUtil.dealToHolder(card, playerSlot);
    expect(success).toBeFalsy();
});

it("fetchCard", () => {
    const extraObject = new MockGameObject();
    const extraCard = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: "not-my-card" })],
    });
    const extraDeck = new MockCard({
        cardDetails: [
            new MockCardDetails({ metadata: "not-my-card" }),
            new MockCardDetails({ metadata: "not-my-card" }),
        ],
    });
    const card = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: "my-card" })],
    });
    mockWorld._reset({
        gameObjects: [extraObject, extraCard, extraDeck, card],
    });
    const cardUtil = new CardUtil();
    const found: Card | undefined = cardUtil.fetchCard("my-card");
    expect(found).toBe(card);
});

it("fetchCard (from deck)", () => {
    const deck = new MockCard({
        cardDetails: [
            new MockCardDetails({ metadata: "my-card" }),
            new MockCardDetails({ metadata: "not-my-card" }),
        ],
    });
    mockWorld._reset({
        gameObjects: [deck],
    });
    const cardUtil = new CardUtil();
    const found: Card | undefined = cardUtil.fetchCard("my-card");
    assert(found);
    expect(NSID.get(found)).toBe("my-card");
    expect(NSID.getDeck(deck)).toEqual(["not-my-card"]);
});

it("fetchCard (missing)", () => {
    const cardUtil = new CardUtil();
    const found: Card | undefined = cardUtil.fetchCard("my-card");
    expect(found).toBeUndefined();
});

it("fetchCard (container)", () => {
    const card = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: "my-card" })],
    });
    const container: Container = new MockContainer({ items: [card] });
    mockWorld._reset({
        gameObjects: [card],
    });
    expect(card.getContainer()).toEqual(container);
    const cardUtil = new CardUtil();
    const found: Card | undefined = cardUtil.fetchCard("my-card");
    expect(found).toBe(card);
    expect(card.getContainer()).toBeUndefined();
});

it("fetchCard (card holder)", () => {
    const card = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: "my-card" })],
    });
    const cardHolder: CardHolder = new MockCardHolder({ cards: [card] });
    mockWorld._reset({
        gameObjects: [card],
    });
    expect(card.getHolder()).toEqual(cardHolder);
    const cardUtil = new CardUtil();
    const found: Card | undefined = cardUtil.fetchCard("my-card");
    expect(found).toBe(card);
    expect(card.getHolder()).toBeUndefined();
});

it("fetchCard (held)", () => {
    const card = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: "my-card" })],
        isHeld: true,
    });
    mockWorld._reset({
        gameObjects: [card],
    });
    expect(card.isHeld()).toBeTruthy();
    const cardUtil = new CardUtil();
    const found: Card | undefined = cardUtil.fetchCard("my-card");
    expect(found).toBe(card);
    expect(card.isHeld()).toBeFalsy();
});

it("filterCards", () => {
    const deck: Card = new MockCard({
        cardDetails: [
            new MockCardDetails({ metadata: "yes1" }),
            new MockCardDetails({ metadata: "yes2" }),
            new MockCardDetails({ metadata: "no1" }),
            new MockCardDetails({ metadata: "yes3" }),
            new MockCardDetails({ metadata: "no2" }),
            new MockCardDetails({ metadata: "yes4" }),
            new MockCardDetails({ metadata: "yes5" }),
            new MockCardDetails({ metadata: "no3" }),
        ],
    });
    const cardUtil = new CardUtil();
    const filtered: Card | undefined = cardUtil.filterCards(deck, (nsid) => {
        return nsid.startsWith("yes");
    });
    assert(filtered);
    expect(filtered).toBeDefined();
    const filteredNsids = NSID.getDeck(filtered);
    expect(filteredNsids).toEqual(["yes1", "yes2", "yes3", "yes4", "yes5"]);

    const deckNsids = NSID.getDeck(deck);
    expect(deckNsids).toEqual(["no1", "no2", "no3"]);
});

it("filterCards (none)", () => {
    const deck: Card = new MockCard({
        cardDetails: [
            new MockCardDetails({ metadata: "no1" }),
            new MockCardDetails({ metadata: "no2" }),
            new MockCardDetails({ metadata: "no3" }),
        ],
    });
    const cardUtil = new CardUtil();
    const filtered: Card | undefined = cardUtil.filterCards(deck, (nsid) => {
        return nsid.startsWith("yes");
    });
    expect(filtered).toBeUndefined();

    const deckNsids = NSID.getDeck(deck);
    expect(deckNsids).toEqual(["no1", "no2", "no3"]);
});

it("filterCards (single)", () => {
    const deck: Card = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: "yes1" })],
    });
    const cardUtil = new CardUtil();
    const filtered: Card | undefined = cardUtil.filterCards(deck, (nsid) => {
        return nsid.startsWith("yes");
    });
    assert(filtered);
    expect(filtered).toBeDefined();
    const filteredNsids = NSID.getDeck(filtered);
    expect(filteredNsids).toEqual(["yes1"]);

    // Dangerous case: if deck is a single card THAT card is used.
    expect(deck).toEqual(filtered);
});

it("isLooseCard", () => {
    const card: Card = new MockCard({
        cardDetails: [new MockCardDetails()],
        isFaceUp: true,
    });
    const cardUtil = new CardUtil();
    const value: boolean = cardUtil.isLooseCard(card);
    expect(value).toEqual(true);
});

it("isLooseCard (face down)", () => {
    const card: Card = new MockCard({
        cardDetails: [new MockCardDetails()],
        isFaceUp: false,
    });
    const cardUtil = new CardUtil();
    let value: boolean = cardUtil.isLooseCard(card);
    expect(value).toEqual(false);

    const allowFaceDown = true;
    value = cardUtil.isLooseCard(card, allowFaceDown);
    expect(value).toEqual(true);
});

it("isLooseCard (stacksize)", () => {
    const card: Card = new MockCard({
        cardDetails: [new MockCardDetails(), new MockCardDetails()],
        isFaceUp: true,
    });
    const cardUtil = new CardUtil();
    const value: boolean = cardUtil.isLooseCard(card);
    expect(value).toEqual(false);
});

it("isLooseCard (container)", () => {
    const container: Container = new MockContainer();
    const card: Card = new MockCard({
        cardDetails: [new MockCardDetails()],
        isFaceUp: true,
        container,
    });
    const cardUtil = new CardUtil();
    const value: boolean = cardUtil.isLooseCard(card);
    expect(value).toEqual(false);
});

it("isLooseCard (held)", () => {
    const card: Card = new MockCard({
        cardDetails: [new MockCardDetails()],
        isFaceUp: true,
        isHeld: true,
    });
    const cardUtil = new CardUtil();
    const value: boolean = cardUtil.isLooseCard(card);
    expect(value).toEqual(false);
});

it("isLooseCard (holder)", () => {
    const cardHolder: CardHolder = new MockCardHolder();
    const card: Card = new MockCard({
        cardDetails: [new MockCardDetails()],
        isFaceUp: true,
        cardHolder,
    });
    const cardUtil = new CardUtil();
    const value: boolean = cardUtil.isLooseCard(card);
    expect(value).toEqual(false);
});

it("isLooseCard (deck/discard)", () => {
    const snapPointTag: string = "illegal-tag";
    const card: Card = new MockCard({
        cardDetails: [new MockCardDetails()],
        isFaceUp: true,
        snappedToPoint: new MockSnapPoint({
            tags: [snapPointTag],
        }),
    });
    const cardUtil = new CardUtil();
    const value: boolean = cardUtil.isLooseCard(card, undefined, [
        snapPointTag,
    ]);
    expect(value).toEqual(false);
});

it("isLooseCard (valid)", () => {
    const card: Card = new MockCard({
        cardDetails: [new MockCardDetails()],
        isFaceUp: true,
    });
    card.destroy();
    const cardUtil = new CardUtil();
    const value: boolean = cardUtil.isLooseCard(card);
    expect(value).toEqual(false);
});

it("separateDeck", () => {
    const deck: Card = new MockCard({
        cardDetails: [
            new MockCardDetails({ metadata: "card1" }),
            new MockCardDetails({ metadata: "card2" }),
            new MockCardDetails({ metadata: "card3" }),
        ],
    });
    const cardUtil = new CardUtil();
    const cards: Array<Card> = cardUtil.separateDeck(deck);
    const nsids: Array<string> = cards.map((card) => NSID.get(card));
    expect(nsids).toEqual(["card1", "card2", "card3"]);
});
