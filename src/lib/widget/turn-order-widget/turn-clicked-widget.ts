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
import { TurnOrder } from "../../turn-order/turn-order";
import { TurnOrderWidgetParams } from "./turn-order-widget";

/**
 * "Popup" with options when clicking on a TurnEntryWidget.
 */
export class TurnClickedWidget {
    private readonly _turnOrder: TurnOrder;
    private readonly _params: TurnOrderWidgetParams;
    private readonly _clickingPlayerSlot: number;
    private readonly _targetPlayerIndex: number;
    private readonly _widget: Widget;

    private _screenUI: ScreenUIElement | undefined;

    constructor(
        turnOrder: TurnOrder,
        params: TurnOrderWidgetParams,
        playerSlot: number,
        clickingPlayer: Player
    ) {
        this._turnOrder = turnOrder;
        this._params = params;
        this._clickingPlayerSlot = clickingPlayer.getSlot();

        const clickingPlayerName = clickingPlayer.getName();

        const targetPlayer: Player | undefined =
            world.getPlayerBySlot(playerSlot);
        const targetPlayerName =
            targetPlayer?.getName() ?? locale("player_name_missing");
        this._targetPlayerIndex = Math.max(
            this._turnOrder.getTurnOrder().indexOf(playerSlot),
            0
        );

        const header = new Text()
            .setText(targetPlayerName)
            .setJustification(TextJustification.Center);

        const setTurn = new Button().setText("Set current turn");
        setTurn.onClicked.add((button: Button, player: Player) => {
            const msg = `${clickingPlayerName} set current turn to ${targetPlayerName}`;
            console.log(msg);
            if (this._turnOrder.getTurnOrder().indexOf(playerSlot) >= 0) {
                this._turnOrder.setCurrentTurn(playerSlot);
            }
            this.detachFromScreen();
        });

        const isPassed: boolean = this._turnOrder.getPassed(playerSlot);
        const passed = new Button().setText(
            isPassed ? "Clear passed" : "Set passed"
        );
        passed.onClicked.add((button: Button, player: Player) => {
            const msg = `${clickingPlayerName} toggled passed for ${targetPlayerName}`;
            console.log(msg);
            this._turnOrder.setPassed(playerSlot, !isPassed);
            this.detachFromScreen();
        });

        const isEliminated = this._turnOrder.getEliminated(playerSlot);
        const eliminated = new Button().setText(
            isEliminated ? "Clear eliminated" : "Set eliminated"
        );
        eliminated.onClicked.add((button: Button, player: Player) => {
            const msg = `${clickingPlayerName} toggled eliminated for ${targetPlayerName}`;
            console.log(msg);
            this._turnOrder.setEliminated(playerSlot, !isEliminated);
            this.detachFromScreen();
        });

        const cancel = new Button().setText("Cancel");
        cancel.onClicked.add((button: Button, player: Player) => {
            this.detachFromScreen();
        });

        const panel = new VerticalBox()
            .addChild(header)
            .addChild(setTurn)
            .addChild(passed)
            .addChild(eliminated)
            .addChild(cancel);
        this._widget = new LayoutBox()
            .setVerticalAlignment(VerticalAlignment.Top)
            .setChild(new Border().setChild(panel));

        this.attachToScreen();
    }

    getWidget(): Widget {
        return this._widget;
    }

    attachToScreen(): this {
        if (this._screenUI) {
            world.removeScreenUIElement(this._screenUI);
            this._screenUI = undefined;
        }
        this._screenUI = new ScreenUIElement();
        this._screenUI.anchorX = 1.3;
        this._screenUI.anchorY = 0;
        this._screenUI.positionX = 1;
        this._screenUI.positionY = Math.round(
            this._params.entryHeight * (this._targetPlayerIndex + 1.1)
        );
        this._screenUI.relativePositionX = true;
        this._screenUI.relativePositionY = false;
        this._screenUI.height = 300;
        this._screenUI.width = 200;
        this._screenUI.widget = this.getWidget();
        this._screenUI.players = new PlayerPermission().setPlayerSlots([
            this._clickingPlayerSlot,
        ]);
        world.addScreenUI(this._screenUI);

        return this;
    }

    detachFromScreen(): this {
        if (this._screenUI) {
            world.removeScreenUIElement(this._screenUI);
            this._screenUI = undefined;
        }
        return this;
    }
}
