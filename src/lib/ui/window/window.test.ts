import { LayoutBox, Widget } from "@tabletop-playground/api";
import { Window } from "./window";

it("constructor", () => {
    new Window({
        size: { width: 1, height: 1 },
        createWidget: (scale: number): Widget => {
            return new LayoutBox()
                .setOverrideHeight(1 * scale)
                .setOverrideWidth(1 * scale);
        },
    });
});
