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
    private readonly _playerSlot: number;
    private readonly _clickingPlayerName: string;
    private readonly _clickingPlayerSlot: number;
    private readonly _targetPlayerName: string;

    private _screenUI: ScreenUIElement | undefined;

    constructor(
        turnOrder: TurnOrder,
        params: TurnOrderWidgetParams,
        playerSlot: number,
        clickingPlayer: Player
    ) {
        this._turnOrder = turnOrder;
        this._params = params;
        this._playerSlot = playerSlot;
        this._clickingPlayerName = clickingPlayer.getName();
        this._clickingPlayerSlot = clickingPlayer.getSlot();

        const targetPlayer: Player | undefined =
            world.getPlayerBySlot(playerSlot);
        this._targetPlayerName =
            targetPlayer?.getName() ?? locale("player_name_missing");

        this.attachToScreen();
    }

    createWidget(): Widget {
        const player: Player | undefined = world.getPlayerBySlot(
            this._playerSlot
        );
        const playerName: string = player?.getName() ?? "<empty>";
        const header = new Text()
            .setText(playerName)
            .setJustification(TextJustification.Center);

        const setTurn = new Button().setText("Set current turn");
        setTurn.onClicked.add((button: Button, player: Player) => {
            const msg = `${this._clickingPlayerName} set current turn to ${this._targetPlayerName}`;
            console.log(msg);
            if (this._turnOrder.getTurnOrder().indexOf(this._playerSlot) >= 0) {
                this._turnOrder.setCurrentTurn(this._playerSlot);
            }
            this.detachFromScreen();
        });

        const isPassed: boolean = this._turnOrder.getPassed(this._playerSlot);
        const passed = new Button().setText(
            isPassed ? "Clear passed" : "Set passed"
        );
        passed.onClicked.add((button: Button, player: Player) => {
            const msg = `${this._clickingPlayerName} toggled passed for ${this._targetPlayerName}`;
            console.log(msg);
            this._turnOrder.setPassed(this._playerSlot, !isPassed);
            this.detachFromScreen();
        });

        const isEliminated = this._turnOrder.getEliminated(this._playerSlot);
        const eliminated = new Button().setText(
            isEliminated ? "Clear eliminated" : "Set eliminated"
        );
        eliminated.onClicked.add((button: Button, player: Player) => {
            const msg = `${this._clickingPlayerName} toggled eliminated for ${this._targetPlayerName}`;
            console.log(msg);
            this._turnOrder.setEliminated(this._playerSlot, !isEliminated);
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
        return new LayoutBox()
            .setVerticalAlignment(VerticalAlignment.Top)
            .setChild(new Border().setChild(panel));
    }

    attachToScreen(): this {
        const index = Math.max(
            this._turnOrder.getTurnOrder().indexOf(this._playerSlot),
            0
        );

        if (this._screenUI) {
            world.removeScreenUIElement(this._screenUI);
            this._screenUI = undefined;
        }
        this._screenUI = new ScreenUIElement();
        this._screenUI.anchorX = 1.3;
        this._screenUI.anchorY = 0;
        this._screenUI.positionX = 1;
        this._screenUI.positionY = Math.round(
            this._params.entryHeight * (index + 1.1)
        );
        this._screenUI.relativePositionX = true;
        this._screenUI.relativePositionY = false;
        this._screenUI.height = 300;
        this._screenUI.width = 200;
        this._screenUI.widget = this.createWidget();
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
