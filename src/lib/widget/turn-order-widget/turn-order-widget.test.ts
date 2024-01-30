import { TurnOrder } from "../../turn-order/turn-order";
import { TurnOrderWidget } from "./turn-order-widget";

it("getInstance", () => {
    const turnOrder1 = TurnOrder.getInstance("@test/shared");
    const turnOrder2 = TurnOrder.getInstance("@test/shared");
    expect(turnOrder1).toBe(turnOrder2);
});

it("constructor", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    new TurnOrderWidget(turnOrder, {});
});

it("destroy", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    new TurnOrderWidget(turnOrder, {}).destroy();
});

it("update (via event)", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    new TurnOrderWidget(turnOrder, {});
    TurnOrder.onTurnStateChanged.trigger(turnOrder);
});

it("update (change player count)", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    new TurnOrderWidget(turnOrder, {});
    turnOrder.setTurnOrder([1, 2], "forward", 1);
    turnOrder.setTurnOrder([1, 2, 3], "forward", 1);
});

it("attach/detach (defaults)", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    const widget = new TurnOrderWidget(turnOrder, {});
    widget.attachToScreen();
    widget.attachToScreen();
    widget.detach();
    widget.detach();
});

it("attach/detach (override values)", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    const widget = new TurnOrderWidget(turnOrder, {
        entryWidth: 1,
        entryHeight: 1,
        reserveSlots: 4,
    });
    widget.attachToScreen();
    widget.attachToScreen();
    widget.detach();
    widget.detach();
});

it("toggle visibility", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    const widget = new TurnOrderWidget(turnOrder, {});
    widget.attachToScreen();
    widget.toggleVisibility(1);
    widget.toggleVisibility(1);
});
