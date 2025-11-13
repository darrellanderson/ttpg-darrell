import { GameObject } from "@tabletop-playground/api";
import { Card, MockCard, MockGameObject } from "ttpg-mock";
import { FindTracking } from "./find-tracking";

it("constructor", () => {
    const findTracking = new FindTracking();
    expect(findTracking).toBeDefined();
    findTracking.destroy();
});

it("track", () => {
    const nsid: string = "my-type:my-source/my-name";
    let foundIds: Array<string> = [];

    const findTracking = new FindTracking();
    findTracking.trackNsid(nsid);

    const obj1: GameObject = MockGameObject.simple(nsid);
    foundIds = findTracking.find(nsid).map((obj) => obj.getId());
    expect(foundIds).toEqual([obj1.getId()]);

    const obj2: GameObject = MockGameObject.simple(nsid);
    foundIds = findTracking.find(nsid).map((obj) => obj.getId());
    expect(foundIds).toEqual([obj1.getId(), obj2.getId()]);

    obj2.destroy();
    foundIds = findTracking.find(nsid).map((obj) => obj.getId());
    expect(foundIds).toEqual([obj1.getId()]);

    findTracking.destroy();
});

it("track (cards)", () => {
    const nsid: string = "my-type:my-source/my-name";
    let foundIds: Array<string> = [];

    const findTracking = new FindTracking();
    findTracking.trackNsid(nsid);

    const card1: Card = MockCard.simple(nsid);
    foundIds = findTracking.findCards(nsid).map((obj) => obj.getId());
    expect(foundIds).toEqual([card1.getId()]);

    const card2: Card = MockCard.simple(nsid);
    foundIds = findTracking.findCards(nsid).map((obj) => obj.getId());
    expect(foundIds).toEqual([card1.getId(), card2.getId()]);

    findTracking.destroy();
});
