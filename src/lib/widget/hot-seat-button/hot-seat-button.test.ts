import { TurnOrder } from "../../turn-order/turn-order";
import { HotSeatButton } from "./hot-seat-button";

it("constructor", () => {
    const turnOrder = new TurnOrder("@test/test");
    new HotSeatButton(turnOrder, {});
});
