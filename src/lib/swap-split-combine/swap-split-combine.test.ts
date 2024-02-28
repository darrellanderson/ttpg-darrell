import { MockGameObject, MockPlayer, mockWorld } from "ttpg-mock";
import { SwapSplitCombine } from "./swap-split-combine";
import { GameObject, Player, world } from "@tabletop-playground/api";
import { Spawn } from "../spawn/spawn";
import { NSID } from "../nsid/nsid";

it("constructor", () => {
    new SwapSplitCombine([]);
});

it("swap", () => {
    const swapSplitCombine = new SwapSplitCombine([
        {
            src: { nsids: ["src-nsid"], count: 1 },
            dst: { nsid: "dst-nsid", count: 1 },
            repeat: false,
        },
    ]);

    Spawn.inject({ "dst-nsid": "dst-template-id" });
    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            "dst-template-id": { templateMetadata: "dst-nsid" },
        },
    });

    const srcObj: GameObject = new MockGameObject({
        templateMetadata: "src-nsid",
    });
    const player: Player = new MockPlayer();

    expect(srcObj.isValid()).toBeTruthy();

    swapSplitCombine._go(srcObj, player);
    const nsids: Array<string> = world
        .getAllObjects()
        .map((obj) => NSID.get(obj));
    expect(srcObj.isValid()).toBeFalsy();
    expect(nsids).toEqual(["dst-nsid"]);
});

it("combine (different nsids)", () => {
    const swapSplitCombine = new SwapSplitCombine([
        {
            src: { nsids: ["src-nsid-a", "src-nsid-b"], count: 3 },
            dst: { nsid: "dst-nsid", count: 2 },
            repeat: false,
        },
    ]);

    Spawn.inject({ "dst-nsid": "dst-template-id" });
    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            "dst-template-id": { templateMetadata: "dst-nsid" },
        },
    });

    const srcObj1: GameObject = new MockGameObject({
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

    swapSplitCombine._go(srcObj1, player);
    const nsids: Array<string> = world
        .getAllObjects()
        .map((obj) => NSID.get(obj));
    expect(srcObj1.isValid()).toBeFalsy();
    expect(srcObj2.isValid()).toBeFalsy();
    expect(srcObj3.isValid()).toBeFalsy();
    expect(srcObj4.isValid()).toBeTruthy();
    expect(nsids).toEqual(["src-nsid-b", "dst-nsid", "dst-nsid"]);
});
