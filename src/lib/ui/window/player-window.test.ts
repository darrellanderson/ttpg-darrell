import { Text, Widget } from "@tabletop-playground/api";
import { clickAll } from "../../jest-util/click-all/click-all";
import {
    IWindowWidget,
    WindowParams,
    WindowWidgetParams,
} from "./window-params";
import { PlayerWindow } from "./player-window";
import { MockPlayer } from "ttpg-mock";

class MockIWindowWidget implements IWindowWidget {
    create(params: WindowWidgetParams): Widget {
        return new Text().setFontSize(params.scale * 8);
    }
    destroy(): void {}
}

it("static scale", () => {
    const playerSlot: number = 7;
    expect(PlayerWindow._loadScale(playerSlot)).toBe(1);
    PlayerWindow._saveScale(playerSlot, 1.2);
    expect(PlayerWindow._loadScale(playerSlot)).toBe(1.2);
});

it("attach/detach (screen, defaults)", () => {
    const params: WindowParams = {
        size: {
            width: 10,
            height: 10,
        },
        windowWidgetGenerator: (): IWindowWidget => {
            return new MockIWindowWidget();
        },
    };
    const playerSlot: number = 7;
    new PlayerWindow(params, playerSlot).attach().detach();
});

it("attach/detach (screen, anchor, pos)", () => {
    const params: WindowParams = {
        size: {
            width: 10,
            height: 10,
        },
        screen: {
            anchor: {
                u: 1,
                v: 1,
            },
            pos: {
                u: 1,
                v: 1,
            },
        },
        windowWidgetGenerator: (): IWindowWidget => {
            return new MockIWindowWidget();
        },
    };
    const playerSlot: number = 7;
    new PlayerWindow(params, playerSlot).attach().detach();
});

it("attach/detach (world, defaults)", () => {
    const params: WindowParams = {
        defaultTarget: "world",
        size: {
            width: 10,
            height: 10,
        },
        windowWidgetGenerator: (): IWindowWidget => {
            return new MockIWindowWidget();
        },
    };
    const playerSlot: number = 7;
    new PlayerWindow(params, playerSlot).attach().detach();
});

it("attach/detach (world, anchor, pos)", () => {
    const params: WindowParams = {
        defaultTarget: "world",
        size: {
            width: 10,
            height: 10,
        },
        world: {
            anchor: {
                u: 1,
                v: 1,
            },
            playerSlotToTransform: { 0: { pos: [2, 3, 4], rot: [5, 6, 7] } },
        },
        windowWidgetGenerator: (): IWindowWidget => {
            return new MockIWindowWidget();
        },
    };
    const playerSlot: number = 7;
    new PlayerWindow(params, playerSlot).attach().detach();
});

it("attach/detach (world, anchor, pos as vector/rotqtor)", () => {
    const params: WindowParams = {
        defaultTarget: "world",
        size: {
            width: 10,
            height: 10,
        },
        world: {
            anchor: {
                u: 1,
                v: 1,
            },
            playerSlotToTransform: { 0: { pos: [2, 3, 4], rot: [5, 6, 7] } },
        },
        windowWidgetGenerator: (): IWindowWidget => {
            return new MockIWindowWidget();
        },
    };
    const playerSlot: number = 7;
    new PlayerWindow(params, playerSlot).attach().detach();
});

it("click", () => {
    const params: WindowParams = {
        title: "my-title",
        size: {
            width: 10,
            height: 10,
        },
        windowWidgetGenerator: (): IWindowWidget => {
            return new MockIWindowWidget();
        },
    };
    const playerSlot: number = 7;
    const playerWindow: PlayerWindow = new PlayerWindow(params, playerSlot);

    playerWindow.attach();
    const widget: Widget = playerWindow._createWidget();
    clickAll(widget);
    clickAll(widget); // collapse vs expand, etc
});

it("state", () => {
    const params: WindowParams = {
        size: {
            width: 10,
            height: 10,
        },
        windowWidgetGenerator: (): IWindowWidget => {
            return new MockIWindowWidget();
        },
    };
    const playerSlot: number = 7;
    const playerWindow = new PlayerWindow(params, playerSlot);
    let state: string | undefined = playerWindow._getState();
    playerWindow.attach();
    state = playerWindow._getState();
    playerWindow._applyState(state ?? "");
    playerWindow._applyState("");
    expect(state?.length).toBeLessThan(50);
});

it("vr", () => {
    const params: WindowParams = {
        size: {
            width: 10,
            height: 10,
        },
        windowWidgetGenerator: (): IWindowWidget => {
            return new MockIWindowWidget();
        },
    };
    const playerSlot: number = 7;
    new MockPlayer({ slot: playerSlot, isUsingVR: true });
    new PlayerWindow(params, playerSlot).attach();
});
