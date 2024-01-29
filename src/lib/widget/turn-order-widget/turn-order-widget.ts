import {
    Border,
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
    entryWidth: number;
    entryHeight: number;

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
        width?: number; // suggest 150
        height?: number; // suggest 25
    };

    // Attach additional items to the turn entry (e.g. score, faction, etc).
    wartGenerators?: TurnEntryWartGenerator[];
};

/**
 * Display turn order, update when turn order changes.
 */
export class TurnOrderWidget {
    private readonly _params: TurnOrderWidgetParams;
    private readonly _turnOrder: TurnOrder;
    private readonly _panel: VerticalBox;
    private _turnEntryWidgets: TurnEntryWidget[] = [];
    private _screenUI: ScreenUIElement | undefined;

    constructor(turnOrder: TurnOrder, params: TurnOrderWidgetParams) {
        this._params = params;
        this._turnOrder = turnOrder;

        this._panel = new VerticalBox().setChildDistance(0);

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

    public attachToScreen(reserveSlots: number): this {
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
        this._screenUI.height = this._params.entryHeight * reserveSlots + 2;
        this._screenUI.width = this._params.entryWidth;
        this._screenUI.widget = this.getWidget();
        world.addScreenUI(this._screenUI);

        return this;
    }

    public detachFromScreen(): this {
        if (this._screenUI) {
            world.removeScreenUIElement(this._screenUI);
            this._screenUI = undefined;
        }
        return this;
    }
}
