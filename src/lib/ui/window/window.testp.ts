import { Border, Text, Widget, world } from "@tabletop-playground/api";
import { WindowParams, WindowWidgetParams } from "./window-params";
import { Window } from "./window";

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
    createWidget: (widgetParams: WindowWidgetParams): Widget => {
        const text = new Text()
            .setFontSize(widgetParams.scale * 50)
            .setText("World");
        return new Border().setColor([1, 0, 0, 0.2]).setChild(text);
    },
};

const playerSlots: Array<number> = world
    .getAllPlayers()
    .map((player) => player.getSlot());

const window = new Window(params, playerSlots, "@window/testp");

window.attach();
