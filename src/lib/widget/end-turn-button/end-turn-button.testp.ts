import { GameObject, Player, refObject } from "@tabletop-playground/api";
import { TurnOrder } from "../../turn-order/turn-order";
import { EndTurnButton } from "./end-turn-button";

const turnOrder = TurnOrder.getInstance("@test/test").setTurnOrder(
    [1, 2, 3],
    "forward",
    1
);
new EndTurnButton(turnOrder, {}).attachToScreen();

refObject.onPrimaryAction.add((object: GameObject, player: Player) => {
    turnOrder.nextTurn();
    console.log(
        `end-turn-button.testp advanced turn to ${turnOrder.getCurrentTurn()} [by ${player.getSlot()}]`
    );
});
