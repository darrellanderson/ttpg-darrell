import { Border, Text, Widget, world } from "@tabletop-playground/api";
import {
    IWindowWidget,
    WindowParams,
    WindowWidgetParams,
} from "./window-params";
import { Window } from "./window";

class WindowWidget implements IWindowWidget {
    create(params: WindowWidgetParams): Widget {
        const text = new Text().setFontSize(params.scale * 50).setText("World");
        return new Border().setColor([1, 0, 0, 0.2]).setChild(text);
    }
    destroy(): void {}
}

const params: WindowParams = {
    title: "Hello",
    size: {
        width: 800,
        height: 400,
    },
    screen: {
        anchor: { x: 0.5, y: 0 },
        pos: { u: 0.5, v: 0.1 },
    },
    windowWidgetGenerator: (): IWindowWidget => new WindowWidget(),
};

const playerSlots: Array<number> = world
    .getAllPlayers()
    .map((player) => player.getSlot());

const window = new Window(params, playerSlots, "@window/testp");

window.attach();
