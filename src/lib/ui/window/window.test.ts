import { LayoutBox, Widget } from "@tabletop-playground/api";
import { Window } from "./window";

it("constructor", () => {
    new Window("title", { width: 1, height: 1 }, (scale: number): Widget => {
        return new LayoutBox()
            .setOverrideHeight(1 * scale)
            .setOverrideWidth(1 * scale);
    });
});
