import {
    Border,
    ImageButton,
    Panel,
    Rotator,
    Text,
    Vector,
    Widget,
} from "@tabletop-playground/api";
import { WindowParams } from "./window-params";
import { PlayerWindow } from "./player-window";
import { LayoutBox, MockImageButton, MockPlayer } from "ttpg-mock";

it("attach/detach (screen, defaults)", () => {
    const params: WindowParams = {
        size: {
            width: 10,
            height: 10,
        },
        createWidget: (scale: number): Widget => {
            return new Text().setFontSize(scale * 8);
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
                x: 1,
                y: 1,
            },
            pos: {
                u: 1,
                v: 1,
            },
        },
        createWidget: (scale: number): Widget => {
            return new Text().setFontSize(scale * 8);
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
        createWidget: (scale: number): Widget => {
            return new Text().setFontSize(scale * 8);
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
                x: 1,
                y: 1,
            },
            pos: [2, 3, 4],
            rot: [5, 6, 7],
        },
        createWidget: (scale: number): Widget => {
            return new Text().setFontSize(scale * 8);
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
                x: 1,
                y: 1,
            },
            pos: new Vector(2, 3, 4),
            rot: new Rotator(5, 6, 7),
        },
        createWidget: (scale: number): Widget => {
            return new Text().setFontSize(scale * 8);
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
        createWidget: (scale: number): Widget => {
            return new Text().setFontSize(scale * 8);
        },
    };
    const playerSlot: number = 7;
    const playerWindow: PlayerWindow = new PlayerWindow(params, playerSlot);

    const clickAll = (widget: Widget | undefined) => {
        if (widget instanceof Panel) {
            for (const child of widget.getAllChildren()) {
                clickAll(child);
            }
        } else if (widget instanceof Border) {
            clickAll(widget.getChild());
        } else if (widget instanceof LayoutBox) {
            clickAll(widget.getChild());
        } else if (widget instanceof ImageButton) {
            const mockButton = widget as MockImageButton;
            const clickingPlayer = new MockPlayer();
            mockButton._clickAsPlayer(clickingPlayer);
        }
    };
    clickAll(playerWindow._createWidget());
    clickAll(playerWindow._createWidget()); // collapse vs expand, etc
});
