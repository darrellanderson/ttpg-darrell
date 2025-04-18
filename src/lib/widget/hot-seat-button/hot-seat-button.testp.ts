import { GameObject, Player, refObject } from "@tabletop-playground/api";
import { TurnOrder } from "../../turn-order/turn-order";
import { HotSeatButton } from "./hot-seat-button";

const turnOrder = TurnOrder.getInstance("@test/test").setTurnOrder(
    [1, 2, 3],
    "forward",
    1
);
new HotSeatButton(turnOrder, {}).attachToScreen();

refObject.onPrimaryAction.add((_object: GameObject, player: Player) => {
    turnOrder.nextTurn();
    console.log(
        `end-turn-button.testp advanced turn to ${turnOrder.getCurrentTurn()} [by ${player.getSlot()}]`
    );
});
