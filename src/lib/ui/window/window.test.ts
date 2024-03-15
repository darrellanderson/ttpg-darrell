import { LayoutBox, Widget, world } from "@tabletop-playground/api";
import { MockPlayer } from "ttpg-mock";
import { Window } from "./window";
import { WindowParams, WindowWidgetParams } from "./window-params";
import { clickAll } from "../../jest-util/click-all/click-all";

it("constructor", () => {
    new MockPlayer(); // create player to add PlayerWindow
    const params: WindowParams = {
        size: { width: 1, height: 1 },
        createWidget: (widgetParams: WindowWidgetParams): Widget => {
            return new LayoutBox()
                .setOverrideHeight(1 * widgetParams.scale)
                .setOverrideWidth(1 * widgetParams.scale);
        },
    };
    const window = new Window(params, [1, 2, 3], "@window/test");
    window.onStateChanged.trigger();
    new Window(params, [1, 2, 3], "@window/test"); // again, load persistent state
});

it("attach/detach", () => {
    const params: WindowParams = {
        size: { width: 1, height: 1 },
        createWidget: (widgetParams: WindowWidgetParams): Widget => {
            return new LayoutBox()
                .setOverrideHeight(1 * widgetParams.scale)
                .setOverrideWidth(1 * widgetParams.scale);
        },
    };
    const window = new Window(params, [1, 2, 3]);
    expect(window._getState()).toBeUndefined();
    window.attach();
    expect(window._getState()).toBeDefined();
    window.detach();
    expect(window._getState()).toBeUndefined();
});

it("getState/applyState", () => {
    const params: WindowParams = {
        size: { width: 1, height: 1 },
        createWidget: (widgetParams: WindowWidgetParams): Widget => {
            return new LayoutBox()
                .setOverrideHeight(1 * widgetParams.scale)
                .setOverrideWidth(1 * widgetParams.scale);
        },
    };
    const window: Window = new Window(params, [1, 2, 3]);
    const state: string | undefined = window._getState();
    window._applyState(state ?? "");
    window._applyState(""); // ignored
});

it("create, click", () => {
    new MockPlayer(); // create player to add PlayerWindow
    const params: WindowParams = {
        size: { width: 1, height: 1 },
        createWidget: (widgetParams: WindowWidgetParams): Widget => {
            return new LayoutBox()
                .setOverrideHeight(1 * widgetParams.scale)
                .setOverrideWidth(1 * widgetParams.scale);
        },
    };
    new Window(params, [1, 2, 3], "@window/test").attach();
    for (const ui of world.getScreenUIs()) {
        clickAll(ui.widget);
    }
});
