import { Border, Text, Widget, world } from "@tabletop-playground/api";
import { WindowParams } from "./window-params";
import { Window } from "./window";

const params: WindowParams = {
    title: "Hello",
    size: {
        width: 800,
        height: 400,
    },
    screen: {
        anchor: { x: 0.5, y: 0.5 },
        pos: { u: 0.5, v: 0.5 },
    },
    createWidget: (scale: number): Widget => {
        const text = new Text().setFontSize(scale * 50).setText("World");
        return new Border().setColor([1, 0, 0, 0.2]).setChild(text);
    },
};

const playerSlots: Array<number> = world
    .getAllPlayers()
    .map((player) => player.getSlot());

new Window(params, playerSlots).attach();
