import { LayoutBox, Widget, world } from "@tabletop-playground/api";
import { MockPlayer } from "ttpg-mock";
import { Window } from "./window";
import { WindowParams } from "./window-params";
import { clickAll } from "../../jest-util/click-all/click-all";

it("constructor", () => {
    new MockPlayer(); // create player to add PlayerWindow
    const params: WindowParams = {
        size: { width: 1, height: 1 },
        createWidget: (scale: number): Widget => {
            return new LayoutBox()
                .setOverrideHeight(1 * scale)
                .setOverrideWidth(1 * scale);
        },
    };
    const window = new Window(params, [1, 2, 3], "@window/test");
    window.onStateChanged.trigger();
    new Window(params, [1, 2, 3], "@window/test"); // again, load persistent state
});

it("attach/detach", () => {
    const params: WindowParams = {
        size: { width: 1, height: 1 },
        createWidget: (scale: number): Widget => {
            return new LayoutBox()
                .setOverrideHeight(1 * scale)
                .setOverrideWidth(1 * scale);
        },
    };
    new Window(params, [1, 2, 3]).attach().detach();
});

it("getState/applyState", () => {
    const params: WindowParams = {
        size: { width: 1, height: 1 },
        createWidget: (scale: number): Widget => {
            return new LayoutBox()
                .setOverrideHeight(1 * scale)
                .setOverrideWidth(1 * scale);
        },
    };
    const window: Window = new Window(params, [1, 2, 3]);
    const state: string = window.getState();
    window.applyState(state);
    window.applyState(""); // ignored
});

it("create, click", () => {
    new MockPlayer(); // create player to add PlayerWindow
    const params: WindowParams = {
        size: { width: 1, height: 1 },
        createWidget: (scale: number): Widget => {
            return new LayoutBox()
                .setOverrideHeight(1 * scale)
                .setOverrideWidth(1 * scale);
        },
    };
    new Window(params, [1, 2, 3], "@window/test").attach();
    for (const ui of world.getScreenUIs()) {
        clickAll(ui.widget);
    }
});
