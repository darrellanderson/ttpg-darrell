import {
    Border,
    Button,
    Color,
    LayoutBox,
    Player,
    ScreenUIElement,
    Sound,
    Widget,
    world,
} from "@tabletop-playground/api";
import { locale } from "../../locale/locale";
import { PlayerPermission } from "ttpg-mock";
import { TurnOrder } from "../../turn-order/turn-order";

import localeData from "./end-turn-locale.data";
locale.inject(localeData);

export type EndTurnButtonParams = {
    scale?: number;
    sound?: string;
    soundPackageId?: string;
    volume?: number;
};

/**
 * Display an "end turn" button on the current-active-player's screen.
 * Optionally play a sound when it becomes a player's turn.
 */
export class EndTurnButton {
    public static readonly WIDTH = 200;
    public static readonly HEIGHT = 60;
    public static readonly FONT_SIZE = 18;
    public static readonly BORDER_SIZE = 2;
    public static readonly OFFSET_TOP = 50;

    private readonly _turnOrder: TurnOrder;
    private readonly _params: EndTurnButtonParams;
    private readonly _sound: Sound | undefined;
    private readonly _button: Button;
    private readonly _border: Border;
    private readonly _widget: Widget;

    private _visibleTo: number = -1;
    private _screenUI: ScreenUIElement | undefined;

    private readonly _onTurnStateChangedHandler = (turnOrder: TurnOrder) => {
        if (turnOrder === this._turnOrder) {
            this.update();
        }
    };

    private readonly _onEndTurnClicked = (button: Button, player: Player) => {
        // Watch out for a second click before the button visible-to changes.
        if (this._turnOrder.getCurrentTurn() !== player.getSlot()) {
            return;
        }
        this._turnOrder.nextTurn();
    };

    constructor(turnOrder: TurnOrder, params: EndTurnButtonParams) {
        this._turnOrder = turnOrder;
        this._params = params;

        if (params.sound) {
            this._sound = world.importSound(
                params.sound,
                params.soundPackageId
            );
        }

        // End turn button.
        const scale = this._params.scale ?? 1;
        const fontSize = Math.round(EndTurnButton.FONT_SIZE * scale);
        const text = locale("button.end-turn");
        this._button = new Button()
            .setFontSize(fontSize)
            .setText(text)
            .setBold(true);
        this._button.onClicked.add(this._onEndTurnClicked);

        // Wrap in a colored-border.
        const borderSize = Math.round(EndTurnButton.BORDER_SIZE * scale);
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

        TurnOrder.onTurnStateChanged.add(this._onTurnStateChangedHandler);

        this.update();
    }

    destroy(): void {
        TurnOrder.onTurnStateChanged.remove(this._onTurnStateChangedHandler);
    }

    update(): void {
        const current = this._turnOrder.getCurrentTurn();
        if (current === this._visibleTo) {
            return; // already set up for current player
        }

        this._visibleTo = current;
        const color: Color =
            current >= 0 ? world.getSlotColor(current) : new Color(1, 1, 1, 1);
        const playerPermission = new PlayerPermission().setPlayerSlots([
            this._visibleTo,
        ]);
        this._widget.setVisible(this._visibleTo >= 0);

        // Update color.
        this._button.setTextColor(color);
        this._border.setColor(color);

        // Show to new current turn player.
        if (this._screenUI) {
            this._screenUI.players = playerPermission;
            world.updateScreenUI(this._screenUI);
        }

        // Play sound.
        if (this._sound) {
            const startTime = 0;
            const volume = this._params.volume ?? 1;
            const loop = false;
            this._sound.play(startTime, volume, loop, playerPermission);
        }
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
        this._screenUI.anchorX = 0.5;
        this._screenUI.anchorY = 0;
        this._screenUI.players = new PlayerPermission().setPlayerSlots([
            this._visibleTo,
        ]);
        this._screenUI.positionX = 0.5;
        this._screenUI.positionY = EndTurnButton.OFFSET_TOP;
        this._screenUI.relativePositionX = true;
        this._screenUI.widget = this._widget;
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
