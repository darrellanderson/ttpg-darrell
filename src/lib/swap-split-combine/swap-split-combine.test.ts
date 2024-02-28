import { MockGameObject, MockPlayer, mockWorld } from "ttpg-mock";
import { SwapSplitCombine } from "./swap-split-combine";
import { GameObject, Player, world } from "@tabletop-playground/api";
import { Spawn } from "../spawn/spawn";
import { NSID } from "../nsid/nsid";

it("constructor, init", () => {
    new MockGameObject(); // so init has an object to check
    new SwapSplitCombine([]).init();
});

it("swapX", () => {
    new SwapSplitCombine([
        {
            src: { nsids: ["bogus-nsid-1"], count: 1 },
            dst: { nsid: "bogus-nsid-2", count: 1 },
            repeat: false,
        },
        {
            src: {
                nsids: ["bogus-nsid-3", "src-nsid-1", "src-nsid-2"],
                count: 1,
            },
            dst: { nsid: "dst-nsid", count: 1 },
            repeat: false,
        },
    ]).init();

    Spawn.inject({ "dst-nsid": "dst-template-id" });
    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            "dst-template-id": { templateMetadata: "dst-nsid" },
        },
    });

    const srcObj1: MockGameObject = new MockGameObject({
        templateMetadata: "src-nsid-1",
        id: "srcObj1",
    });
    const srcObj2: GameObject = new MockGameObject({
        templateMetadata: "src-nsid-2",
        id: "srcObj2",
    });
    const player: Player = new MockPlayer({
        selectedObjects: [srcObj2], // omit srcObj1, will add via primary action object
    });

    expect(srcObj1.isValid()).toBeTruthy();
    expect(srcObj2.isValid()).toBeTruthy();

    srcObj1._primaryActionAsPlayer(player);
    srcObj1._primaryActionAsPlayer(player); // suppress in progres
    process.flushTicks();

    const nsids: Array<string> = world
        .getAllObjects()
        .map((obj) => NSID.get(obj));
    expect(srcObj1.isValid()).toBeFalsy();
    expect(srcObj2.isValid()).toBeTruthy();
    expect(nsids).toEqual(["src-nsid-2", "dst-nsid"]);
});

it("swap, repeat", () => {
    new SwapSplitCombine([
        {
            src: { nsids: ["src-nsid"], count: 1 },
            dst: { nsid: "dst-nsid", count: 1 },
            repeat: true,
        },
    ]).init();

    Spawn.inject({ "dst-nsid": "dst-template-id" });
    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            "dst-template-id": { templateMetadata: "dst-nsid" },
        },
    });

    const srcObj1: MockGameObject = new MockGameObject({
        templateMetadata: "src-nsid",
    });
    const srcObj2: GameObject = new MockGameObject({
        templateMetadata: "src-nsid",
    });
    const player: Player = new MockPlayer({
        selectedObjects: [srcObj1, srcObj2],
    });

    expect(srcObj1.isValid()).toBeTruthy();
    expect(srcObj2.isValid()).toBeTruthy();

    srcObj1._primaryActionAsPlayer(player);
    process.flushTicks();

    const nsids: Array<string> = world
        .getAllObjects()
        .map((obj) => NSID.get(obj));
    expect(srcObj1.isValid()).toBeFalsy();
    expect(srcObj2.isValid()).toBeFalsy();
    expect(nsids).toEqual(["dst-nsid", "dst-nsid"]);
});

it("combine (different nsids)", () => {
    new SwapSplitCombine([
        {
            src: { nsids: ["src-nsid-a", "src-nsid-b"], count: 3 },
            dst: { nsid: "dst-nsid", count: 2 },
            repeat: false,
        },
    ]).init();

    Spawn.inject({ "dst-nsid": "dst-template-id" });
    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            "dst-template-id": { templateMetadata: "dst-nsid" },
        },
    });

    const srcObj1: MockGameObject = new MockGameObject({
        templateMetadata: "src-nsid-a",
    });
    const srcObj2: GameObject = new MockGameObject({
        templateMetadata: "src-nsid-b",
    });
    const srcObj3: GameObject = new MockGameObject({
        templateMetadata: "src-nsid-a",
    });
    const srcObj4: GameObject = new MockGameObject({
        templateMetadata: "src-nsid-b",
    });
    const player: Player = new MockPlayer({
        selectedObjects: [srcObj1, srcObj2, srcObj3, srcObj4],
    });

    expect(srcObj1.isValid()).toBeTruthy();
    expect(srcObj2.isValid()).toBeTruthy();
    expect(srcObj3.isValid()).toBeTruthy();
    expect(srcObj4.isValid()).toBeTruthy();

    srcObj1._primaryActionAsPlayer(player);
    process.flushTicks();

    const nsids: Array<string> = world
        .getAllObjects()
        .map((obj) => NSID.get(obj));
    expect(srcObj1.isValid()).toBeFalsy();
    expect(srcObj2.isValid()).toBeFalsy();
    expect(srcObj3.isValid()).toBeFalsy();
    expect(srcObj4.isValid()).toBeTruthy();
    expect(nsids).toEqual(["src-nsid-b", "dst-nsid", "dst-nsid"]);
});
