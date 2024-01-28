import { LayoutBox, Player, Widget } from "@tabletop-playground/api";
import { TurnOrder } from "../../turn-order/turn-order";
import { TurnOrderWidgetParams } from "./turn-order-widget";

/**
 * "Popup" with options when clicking on a TurnEntryWidget.
 */
export class TurnClickedWidget {
    private readonly _turnOrder: TurnOrder;
    private readonly _params: TurnOrderWidgetParams;

    constructor(
        turnOrder: TurnOrder,
        params: TurnOrderWidgetParams,
        playerSlot: number,
        clickingPlayer: Player
    ) {
        this._turnOrder = turnOrder;
        this._params = params;

        const msg = `TurnClickedWidget: ${clickingPlayer.getName()} changed the current turn to ${playerSlot}`;
        console.log(msg);
        turnOrder.setCurrentTurn(playerSlot);
    }

    getWidget(): Widget {
        return new LayoutBox();
    }
}
