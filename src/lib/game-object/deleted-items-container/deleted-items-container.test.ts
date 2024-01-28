import { Card, Container, Player } from "@tabletop-playground/api";
import { MockCard, MockContainer, MockGameObject, MockPlayer } from "ttpg-mock";
import { DeletedItemsContainer } from "./deleted-items-container";

it("constructor", () => {
    const container: Container = new MockContainer();
    new DeletedItemsContainer(container);
});

it("constructor (invalid)", () => {
    const bad: Container = new MockGameObject() as unknown as Container;
    expect(() => {
        new DeletedItemsContainer(bad);
    }).toThrow();
});

it("destroy container", () => {
    const container: Container = new MockContainer();
    new DeletedItemsContainer(container);
    container.destroy();
});

it("destroy peer", () => {
    const templateId = "my-template-id";
    const container1: Container = new MockContainer({ templateId });
    new DeletedItemsContainer(container1);

    const container2: Container = new MockContainer({ templateId });
    new DeletedItemsContainer(container2);

    container1.destroy();
});

it("destroy GameObject.toJSONString not supported", () => {
    const templateId = "my-template-id";
    const container: Container = new MockContainer({ templateId });
    new DeletedItemsContainer(container);

    const obj = new MockGameObject();
    expect(() => {
        obj.destroy();
    }).toThrow();
});

it("onObjectestroyed handler (skipped by nsid)", () => {
    const nsid = "my-obj";
    const obj = new MockGameObject({ templateMetadata: nsid });

    const container: Container = new MockContainer();
    new DeletedItemsContainer(container);
    DeletedItemsContainer.ignoreNSIDs([nsid]);

    obj.destroy();
});

it("onObjectCreated handler", () => {
    const container: Container = new MockContainer();
    new DeletedItemsContainer(container);
    const card = new MockCard();
});

it("ignore cards getting added to decks", () => {
    const container: Container = new MockContainer();
    new DeletedItemsContainer(container);

    const card1 = new MockCard();
    const card2 = new MockCard();

    const player = new MockPlayer();
    card1._addCardsAsPlayer(
        card2,
        undefined,
        undefined,
        undefined,
        undefined,
        player
    );
    expect(card2.isValid()).toBeFalsy();
});

it("destroyWithoutCopying", () => {
    const container: Container = new MockContainer();
    new DeletedItemsContainer(container);

    const obj = new MockGameObject();
    DeletedItemsContainer.destroyWithoutCopying(obj);
});
