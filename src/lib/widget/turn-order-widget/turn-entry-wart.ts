import { Color } from "@tabletop-playground/api";
import { TurnEntryWidget } from "./turn-entry-widget";
import { TurnOrderWidgetParams } from "./turn-order-widget";

export type TurnEntryWartGenerator = (
    turnEntryWidget: TurnEntryWidget,
    params: TurnOrderWidgetParams
) => TurnEntryWart;

/**
 * Augment a TurnEntryWidget.  May update its own widgets independently of
 * changes to turn order (e.g. change score value when score changes).
 */
export abstract class TurnEntryWart {
    protected readonly _turnEntryWidget: TurnEntryWidget;
    protected readonly _params: TurnOrderWidgetParams;

    constructor(
        turnEntryWidget: TurnEntryWidget,
        params: TurnOrderWidgetParams
    ) {
        this._turnEntryWidget = turnEntryWidget;
        this._params = params;
    }

    /**
     * TurnEntryWidget retired, remove any event handlers, etc.
     */
    abstract destroy(): void;

    /**
     * Update the turn entry widget.
     */
    abstract update(playerSlot: number, fgColor: Color, bgColor: Color): void;
}
