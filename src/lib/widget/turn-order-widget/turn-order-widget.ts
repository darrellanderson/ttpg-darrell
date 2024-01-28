import { VerticalBox, Widget } from "@tabletop-playground/api";
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
    private readonly _widget: VerticalBox;
    private _turnEntryWidgets: TurnEntryWidget[] = [];

    constructor(turnOrder: TurnOrder, params: TurnOrderWidgetParams) {
        this._params = params;
        this._turnOrder = turnOrder;

        this._widget = new VerticalBox().setChildDistance(0);

        TurnOrder.onTurnStateChanged.add((turnOrder: TurnOrder) => {
            if (turnOrder === this._turnOrder) {
                this.update();
            }
        });

        this.update();
    }

    public getWidget(): Widget {
        return this._widget;
    }

    public update(): this {
        const order = this._turnOrder.getTurnOrder();

        // Only reset turn widgets if the number of turn entries changes.
        if (this._turnEntryWidgets.length !== order.length) {
            this._widget.removeAllChildren();
            for (const turnEnryWidget of this._turnEntryWidgets) {
                turnEnryWidget.destroy();
            }
            this._turnEntryWidgets = [];
            for (let i = 0; i < order.length; i++) {
                const turnEnryWidget = new TurnEntryWidget(this._params);
                this._turnEntryWidgets.push(turnEnryWidget);
                this._widget.addChild(turnEnryWidget.getWidget());
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
}
