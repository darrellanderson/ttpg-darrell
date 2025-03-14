import {
    Button,
    Border,
    Widget,
    ScreenUIElement,
    Player,
    world,
    LayoutBox,
    globalEvents,
    Color,
} from "@tabletop-playground/api";
import { locale } from "../../locale/locale";
import { TurnOrder } from "../../turn-order/turn-order";

import { HotSeatLocaleData } from "./hot-seat-locale.data";
import { LeaveSeat } from "../../context-menu/leave-seat/leave-seat";
import { ThrottleClickHandler } from "../../event/throttle-click-handler/throttle-click-handler";
locale.inject(HotSeatLocaleData);

export type HotSeatButtonParams = {
    scale?: number;
};

/**
 * "End turn" button that sets no active player (hiding card holders, etc),
 * and becomes "Start turn" for the next player to seat them.
 */
export class HotSeatButton {
    public static readonly WIDTH = 180;
    public static readonly HEIGHT = 60;
    public static readonly FONT_SIZE = 18;
    public static readonly BORDER_SIZE = 2;
    public static readonly OFFSET_TOP = 50;

    private readonly _turnOrder: TurnOrder;
    private readonly _button: Button;
    private readonly _border: Border;
    private readonly _widget: Widget;
    private readonly _screenUI: ScreenUIElement;

    private readonly _doUpdate = () => {
        const currentSlot: number = this._turnOrder.getCurrentTurn();
        const currentColor: Color = world.getSlotColor(currentSlot);
        const isSeated: boolean = world.getPlayerBySlot(currentSlot)
            ? true
            : false;

        if (isSeated) {
            this._button.setText(locale("hot-seat.end-turn"));
        } else {
            this._button.setText(locale("hot-seat.start-turn"));
        }
        this._button.setTextColor(currentColor);
        this._border.setColor(currentColor);
    };

    private readonly _onEndTurnClicked = (_button: Button, player: Player) => {
        const currentSlot: number = this._turnOrder.getCurrentTurn();
        const playerSlot: number = player.getSlot();

        if (currentSlot === playerSlot) {
            LeaveSeat.leaveSeat(player);
            this._turnOrder.nextTurn();
        } else {
            player.switchSlot(currentSlot);
        }
    };

    constructor(turnOrder: TurnOrder, params: HotSeatButtonParams) {
        this._turnOrder = turnOrder;

        // End turn button.
        const scale: number = params.scale ?? 1;
        const fontSize = Math.round(HotSeatButton.FONT_SIZE * scale);
        const text = locale("button.end-turn");
        this._button = new Button()
            .setFontSize(fontSize)
            .setText(text)
            .setBold(true);
        this._button.onClicked.add(
            new ThrottleClickHandler<Button>(this._onEndTurnClicked).get()
        );

        // Wrap in a colored-border.
        const borderSize = Math.round(HotSeatButton.BORDER_SIZE * scale);
        const buttonBox = new LayoutBox()
            .setPadding(borderSize, borderSize, borderSize, borderSize)
            .setChild(this._button);
        this._border = new Border().setChild(buttonBox);

        // Wrap again in a dark color frame.
        const frameBox = new LayoutBox()
            .setPadding(borderSize, borderSize, borderSize, borderSize)
            .setChild(this._border);
        const c = 0.02;
        this._widget = new Border().setColor([c, c, c, 1]).setChild(frameBox);

        this._screenUI = new ScreenUIElement();
        this._screenUI.anchorX = 0.5;
        this._screenUI.anchorY = 0;
        this._screenUI.positionX = 0.5;
        this._screenUI.positionY = HotSeatButton.OFFSET_TOP;
        this._screenUI.relativePositionX = true;
        this._screenUI.relativePositionY = false;
        this._screenUI.width = Math.round(HotSeatButton.WIDTH * scale);
        this._screenUI.height = Math.round(HotSeatButton.HEIGHT * scale);
        this._screenUI.widget = this._widget;

        TurnOrder.onTurnStateChanged.add(this._doUpdate);
        globalEvents.onPlayerJoined.add(this._doUpdate);
        globalEvents.onPlayerSwitchedSlots.add(this._doUpdate);
    }

    destroy(): void {
        TurnOrder.onTurnStateChanged.remove(this._doUpdate);
        globalEvents.onPlayerJoined.remove(this._doUpdate);
        globalEvents.onPlayerSwitchedSlots.remove(this._doUpdate);
    }

    getWidget(): Widget {
        return this._widget;
    }

    attachToScreen(): this {
        world.addScreenUI(this._screenUI);
        return this;
    }

    detach(): this {
        world.removeScreenUIElement(this._screenUI);
        return this;
    }
}
