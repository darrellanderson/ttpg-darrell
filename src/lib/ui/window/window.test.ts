import { LayoutBox, Widget } from "@tabletop-playground/api";
import { Window } from "./window";
import { WindowParams } from "./window-params";

it("constructor", () => {
    const params: WindowParams = {
        size: { width: 1, height: 1 },
        createWidget: (scale: number): Widget => {
            return new LayoutBox()
                .setOverrideHeight(1 * scale)
                .setOverrideWidth(1 * scale);
        },
    };
    new Window(params, [1, 2, 3]);
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
