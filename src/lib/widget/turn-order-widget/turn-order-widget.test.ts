import { TurnOrder } from "../../turn-order/turn-order";
import { TurnOrderWidget } from "./turn-order-widget";

it("constructor", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    new TurnOrderWidget(turnOrder, { entryWidth: 200, entryHeight: 50 });
});
