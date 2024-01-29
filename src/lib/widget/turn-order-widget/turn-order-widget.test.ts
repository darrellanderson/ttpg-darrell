import { TurnOrder } from "../../turn-order/turn-order";
import { TurnOrderWidget } from "./turn-order-widget";

it("constructor", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    new TurnOrderWidget(turnOrder, {
        entryWidth: 1,
        entryHeight: 1,
        reserveSlots: 1,
    });
});

it("update (via event)", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    new TurnOrderWidget(turnOrder, {
        entryWidth: 1,
        entryHeight: 1,
        reserveSlots: 1,
    });
    TurnOrder.onTurnStateChanged.trigger(turnOrder);
});

it("update (change player count)", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    new TurnOrderWidget(turnOrder, {
        entryWidth: 1,
        entryHeight: 1,
        reserveSlots: 1,
    });
    turnOrder.setTurnOrder([1, 2], "forward", 1);
    turnOrder.setTurnOrder([1, 2, 3], "forward", 1);
});

it("attach/detach", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    const widget = new TurnOrderWidget(turnOrder, {
        entryWidth: 1,
        entryHeight: 1,
        reserveSlots: 1,
    });
    widget.attachToScreen();
    widget.attachToScreen();
    widget.detach();
    widget.detach();
});

it("toggle visibility", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    const widget = new TurnOrderWidget(turnOrder, {
        entryWidth: 1,
        entryHeight: 1,
        reserveSlots: 1,
    });
    widget.attachToScreen();
    widget.toggleVisibility(1);
    widget.toggleVisibility(1);
});
