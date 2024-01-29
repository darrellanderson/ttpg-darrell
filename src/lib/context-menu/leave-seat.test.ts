import { Player, globalEvents } from "@tabletop-playground/api";
import { LeaveSeat } from "./leave-seat";
import {
    GameObject,
    MockGameObject,
    MockPlayer,
    mockGlobalEvents,
    mockWorld,
} from "ttpg-mock";

it("constructor", () => {
    new LeaveSeat();
});

it("init", () => {
    new LeaveSeat().init();
});

it("leaveSeat (direct call)", () => {
    jest.spyOn(console, "log").mockImplementation(() => {});

    const player: Player = new MockPlayer({ slot: 0 });
    const obj = new MockGameObject({ owningPlayerSlot: 1 });
    mockWorld._reset({ gameObjects: [obj], players: [player] });

    expect(player.getSlot()).toEqual(0);
    const success = LeaveSeat.leaveSeat(player);
    expect(success).toBeTruthy();
    expect(player.getSlot()).toEqual(2);

    jest.restoreAllMocks();
});

it("leaveSeat (context menu event)", () => {
    jest.spyOn(console, "log").mockImplementation(() => {});

    const player: Player = new MockPlayer({ slot: 0 });
    const obj = new MockGameObject({ owningPlayerSlot: 1 });
    mockWorld._reset({ gameObjects: [obj], players: [player] });

    expect(player.getSlot()).toEqual(0);
    mockGlobalEvents._customActionAsPlayer(
        player,
        LeaveSeat.CUSTOM_ACTION_NAME
    );
    expect(player.getSlot()).toEqual(2);

    jest.restoreAllMocks();
});

it("leaveSeat (none open)", () => {
    jest.spyOn(console, "log").mockImplementation(() => {});

    const player: Player = new MockPlayer({ slot: 0 });
    const gameObjects: GameObject[] = [];
    for (let slot = 0; slot < 20; slot++) {
        gameObjects.push(new MockGameObject({ owningPlayerSlot: slot }));
    }
    mockWorld._reset({ gameObjects, players: [player] });

    expect(player.getSlot()).toEqual(0);
    const success = LeaveSeat.leaveSeat(player);
    expect(success).toBeFalsy();
    expect(player.getSlot()).toEqual(0);

    jest.restoreAllMocks();
});
