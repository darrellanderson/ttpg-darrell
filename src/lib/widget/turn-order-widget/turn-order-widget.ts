import {
    Border,
    PlayerPermission,
    ScreenUIElement,
    VerticalBox,
    Widget,
    world,
} from "@tabletop-playground/api";
import { TurnOrder } from "../../turn-order/turn-order";
import { TurnEntryWartGenerator } from "./turn-entry-wart";
import { TurnEntryWidget } from "./turn-entry-widget";

export type TurnOrderWidgetParams = {
    // Per-turn entry size, stacked vertically.
    entryWidth?: number;
    entryHeight?: number;

    // Consume pixels at edges to highlight for mouseover (max useful is 4).
    margins?: {
        left?: number;
        top?: number;
        right?: number;
        bottom?: number;
    };

    // Where should the player name appear?  Defaults to full entry.
    nameBox?: {
        left?: number;
        top?: number;
        width?: number;
        height?: number;
    };

    // Size for N turns.
    reserveSlots?: number;

    // Attach additional items to the turn entry (e.g. score, faction, etc).
    wartGenerators?: TurnEntryWartGenerator[];
};

/**
 * Display turn order, update when turn order changes.
 */
export class TurnOrderWidget {
    public static readonly DEFAULT_ENTRY_WIDTH = 150;
    public static readonly DEFAULT_ENTRY_HEIGHT = 25;
    public static readonly DEFAULT_RESERVE_SLOTS = 8;

    private readonly _params: TurnOrderWidgetParams;
    private readonly _turnOrder: TurnOrder;
    private readonly _panel: VerticalBox;
    private readonly _visibleToPlayerSlots: number[];
    private _turnEntryWidgets: TurnEntryWidget[] = [];
    private _screenUI: ScreenUIElement | undefined;

    constructor(turnOrder: TurnOrder, params: TurnOrderWidgetParams) {
        this._params = params;
        this._turnOrder = turnOrder;

        this._panel = new VerticalBox().setChildDistance(0);
        this._visibleToPlayerSlots = [...Array(20).keys()];

        TurnOrder.onTurnStateChanged.add((turnOrder: TurnOrder) => {
            if (turnOrder === this._turnOrder) {
                this.update();
            }
        });

        this.update();
    }

    public getWidget(): Widget {
        return this._panel;
    }

    public update(): this {
        const order = this._turnOrder.getTurnOrder();

        // Only reset turn widgets if the number of turn entries changes.
        if (this._turnEntryWidgets.length !== order.length) {
            this._panel.removeAllChildren();
            for (const turnEnryWidget of this._turnEntryWidgets) {
                turnEnryWidget.destroy();
            }
            this._turnEntryWidgets = [];
            for (let i = 0; i < order.length; i++) {
                const turnEnryWidget = new TurnEntryWidget(this._params);
                this._turnEntryWidgets.push(turnEnryWidget);
                this._panel.addChild(turnEnryWidget.getWidget());
            }
        }

        // Update turn widgets.
        for (let i = 0; i < order.length; i++) {
            const playerSlot: number = order[i];
            const turnWidget: TurnEntryWidget = this._turnEntryWidgets[i];
            turnWidget.update(this._turnOrder, playerSlot);
        }

        return this;
    }

    public attachToScreen(): this {
        const w: number =
            this._params.entryWidth ?? TurnOrderWidget.DEFAULT_ENTRY_WIDTH;
        const h: number =
            this._params.entryHeight ?? TurnOrderWidget.DEFAULT_ENTRY_HEIGHT;
        const reserveSlots: number =
            this._params.reserveSlots ?? TurnOrderWidget.DEFAULT_RESERVE_SLOTS;

        if (this._screenUI) {
            world.removeScreenUIElement(this._screenUI);
            this._screenUI = undefined;
        }
        this._screenUI = new ScreenUIElement();
        this._screenUI.anchorX = 1.1;
        this._screenUI.anchorY = -0.1;
        this._screenUI.positionX = 1;
        this._screenUI.relativePositionX = true;
        this._screenUI.relativePositionY = true;
        this._screenUI.height = h * reserveSlots + 2;
        this._screenUI.width = w;
        this._screenUI.widget = this.getWidget();
        world.addScreenUI(this._screenUI);

        return this;
    }

    public detach(): this {
        if (this._screenUI) {
            world.removeScreenUIElement(this._screenUI);
            this._screenUI = undefined;
        }
        return this;
    }

    public toggleVisibility(playerSlot: number): this {
        const index = this._visibleToPlayerSlots.indexOf(playerSlot);
        if (index >= 0) {
            this._visibleToPlayerSlots.splice(index, 1);
        } else {
            this._visibleToPlayerSlots.push(playerSlot);
        }

        if (this._screenUI) {
            this._screenUI.players = new PlayerPermission().setPlayerSlots(
                this._visibleToPlayerSlots
            );
        }
        return this;
    }
}
