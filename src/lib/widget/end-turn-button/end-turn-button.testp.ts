import { TurnOrder } from "../../turn-order/turn-order";
import { EndTurnButton } from "./end-turn-button";

const turnOrder = new TurnOrder("@test/test").setTurnOrder(
    [1, 2, 3],
    "forward",
    1
);
new EndTurnButton(turnOrder, {}).attachToScreen();
