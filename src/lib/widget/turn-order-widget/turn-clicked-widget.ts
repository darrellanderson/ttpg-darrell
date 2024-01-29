import {
    Border,
    Button,
    LayoutBox,
    Player,
    PlayerPermission,
    ScreenUIElement,
    Text,
    TextJustification,
    VerticalAlignment,
    VerticalBox,
    Widget,
    world,
} from "@tabletop-playground/api";
import { locale } from "../../locale/locale";
import { Broadcast } from "../../broadcast/broadcast";
import { TurnOrder } from "../../turn-order/turn-order";
import { TurnOrderWidget, TurnOrderWidgetParams } from "./turn-order-widget";

import turnOrderLocaleData from "./turn-order-locale.data";
locale.inject(turnOrderLocaleData);

import globalLocaleData from "../../../locale.data";
locale.inject(globalLocaleData);

/**
 * "Popup" with options when clicking on a TurnEntryWidget.
 */
export class TurnClickedWidget {
    private readonly _turnOrder: TurnOrder;
    private readonly _params: TurnOrderWidgetParams;
    private readonly _targetPlayerSlot: number;
    private readonly _targetPlayerName: string;
    private readonly _targetPlayerIndex: number;

    private _screenUI: ScreenUIElement | undefined;

    constructor(
        turnOrder: TurnOrder,
        params: TurnOrderWidgetParams,
        playerSlot: number
    ) {
        this._turnOrder = turnOrder;
        this._params = params;
        this._targetPlayerSlot = playerSlot;

        const targetPlayer: Player | undefined =
            world.getPlayerBySlot(playerSlot);
        this._targetPlayerName =
            targetPlayer?.getName() ?? locale("turn-order.player-name.missing");
        this._targetPlayerIndex = Math.max(
            this._turnOrder.getTurnOrder().indexOf(playerSlot),
            0
        );
    }

    _createSetTurnButton(): Button {
        const button = new Button().setText(locale("turn-order.set-turn"));
        button.onClicked.add((button: Button, clickingPlayer: Player) => {
            const msg: string = locale("turn-order.set-turn-by", {
                clickingPlayer: clickingPlayer.getName(),
                targetPlayer: this._targetPlayerName,
            });
            Broadcast.chatAll(msg);
            const order: number[] = this._turnOrder.getTurnOrder();
            const index: number = order.indexOf(this._targetPlayerSlot);
            if (index >= 0) {
                this._turnOrder.setCurrentTurn(this._targetPlayerSlot);
            }
            this.detach();
        });
        return button;
    }

    _createTogglePassedButton(): Button {
        const isPassed: boolean = this._turnOrder.getPassed(
            this._targetPlayerSlot
        );
        const button = new Button().setText(
            locale("turn-order.passed." + (isPassed ? "clear" : "set"))
        );
        button.onClicked.add((button: Button, clickingPlayer: Player) => {
            const msg: string = locale("turn-order.passed.toggled-by", {
                clickingPlayer: clickingPlayer.getName(),
                targetPlayer: this._targetPlayerName,
            });
            Broadcast.chatAll(msg);
            this._turnOrder.setPassed(this._targetPlayerSlot, !isPassed);
            this.detach();
        });
        return button;
    }

    _createToggleEliminatedButton(): Button {
        const isEliminated = this._turnOrder.getEliminated(
            this._targetPlayerSlot
        );
        const button = new Button().setText(
            locale("turn-order.eliminated." + (isEliminated ? "clear" : "set"))
        );
        button.onClicked.add((button: Button, clickingPlayer: Player) => {
            const msg: string = locale("turn-order.eliminated.toggled-by", {
                clickingPlayer: clickingPlayer.getName(),
                targetPlayer: this._targetPlayerName,
            });
            Broadcast.chatAll(msg);
            this._turnOrder.setEliminated(
                this._targetPlayerSlot,
                !isEliminated
            );
            this.detach();
        });
        return button;
    }

    _createCancelButton(): Button {
        const button = new Button().setText(locale("button.cancel"));
        button.onClicked.add((button: Button, clickingPlayer: Player) => {
            this.detach();
        });
        return button;
    }

    getWidget(): Widget {
        const header = new Text()
            .setText(this._targetPlayerName)
            .setJustification(TextJustification.Center);

        const panel = new VerticalBox()
            .addChild(header)
            .addChild(this._createSetTurnButton())
            .addChild(this._createTogglePassedButton())
            .addChild(this._createToggleEliminatedButton())
            .addChild(this._createCancelButton());
        return new LayoutBox()
            .setVerticalAlignment(VerticalAlignment.Top)
            .setChild(new Border().setChild(panel));
    }

    attachToScreen(visibleToPlayer: Player): this {
        const h: number =
            this._params.entryHeight ?? TurnOrderWidget.DEFAULT_ENTRY_HEIGHT;

        if (this._screenUI) {
            world.removeScreenUIElement(this._screenUI);
            this._screenUI = undefined;
        }
        this._screenUI = new ScreenUIElement();
        this._screenUI.anchorX = 1.3;
        this._screenUI.anchorY = 0;
        this._screenUI.positionX = 1;
        this._screenUI.positionY = Math.round(
            h * (this._targetPlayerIndex + 1.1)
        );
        this._screenUI.relativePositionX = true;
        this._screenUI.relativePositionY = false;
        this._screenUI.height = 300;
        this._screenUI.width = 200;
        this._screenUI.widget = this.getWidget();
        this._screenUI.players = new PlayerPermission().setPlayerSlots([
            visibleToPlayer.getSlot(),
        ]);
        world.addScreenUI(this._screenUI);

        return this;
    }

    detach(): this {
        if (this._screenUI) {
            world.removeScreenUIElement(this._screenUI);
            this._screenUI = undefined;
        }
        return this;
    }
}
