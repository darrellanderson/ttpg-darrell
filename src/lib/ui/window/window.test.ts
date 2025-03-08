import { Text, Widget, world } from "@tabletop-playground/api";
import { MockPlayer } from "ttpg-mock";
import { Window } from "./window";
import {
    IWindowWidget,
    WindowParams,
    WindowWidgetParams,
} from "./window-params";
import { clickAll } from "../../jest-util/click-all/click-all";

class MockIWindowWidget implements IWindowWidget {
    create(params: WindowWidgetParams): Widget {
        return new Text().setFontSize(params.scale * 8);
    }
    destroy(): void {}
}

it("constructor", () => {
    new MockPlayer(); // create player to add PlayerWindow
    const params: WindowParams = {
        size: { width: 1, height: 1 },
        windowWidgetGenerator: (): IWindowWidget => {
            return new MockIWindowWidget();
        },
    };
    const window = new Window(params, [1, 2, 3], "@window/test");
    window.attach();
    window.onStateChanged.trigger();
    new Window(params, [1, 2, 3], "@window/test"); // again, load persistent state
});

it("attach/detach", () => {
    const params: WindowParams = {
        size: { width: 1, height: 1 },
        windowWidgetGenerator: (): IWindowWidget => {
            return new MockIWindowWidget();
        },
    };
    const window = new Window(params, [1, 2, 3]);
    let onAllClosedCount = 0;
    window.onAllClosed.add(() => {
        onAllClosedCount++;
    });
    expect(window._getState()).toBeUndefined();
    expect(onAllClosedCount).toEqual(0);
    window.attach();
    expect(window._getState()).toBeDefined();
    expect(onAllClosedCount).toEqual(0);
    window.detach();
    expect(window._getState()).toBeUndefined();
    expect(onAllClosedCount).toEqual(1);
    window.destroy();
});

it("getState/applyState", () => {
    const params: WindowParams = {
        size: { width: 1, height: 1 },
        windowWidgetGenerator: (): IWindowWidget => {
            return new MockIWindowWidget();
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
        windowWidgetGenerator: (): IWindowWidget => {
            return new MockIWindowWidget();
        },
    };
    new Window(params, [1, 2, 3], "@window/test").attach();
    for (const ui of world.getScreenUIs()) {
        clickAll(ui.widget);
    }
});
