import { Player } from "@tabletop-playground/api";
import { mockGlobalEvents, MockPlayer } from "ttpg-mock";
import { locale } from "../../locale/locale";
import { TurnOrder } from "../../turn-order/turn-order";
import { TurnOrderWidget } from "./turn-order-widget";

it("getInstance", () => {
    const turnOrder1 = TurnOrder.getInstance("@test/shared");
    const turnOrder2 = TurnOrder.getInstance("@test/shared");
    expect(turnOrder1).toBe(turnOrder2);
});

it("constructor", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    const widget = new TurnOrderWidget(turnOrder, {});
    widget.destroy();
});

it("destroy", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    new TurnOrderWidget(turnOrder, {}).destroy();
});

it("update (via event)", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    const widget = new TurnOrderWidget(turnOrder, {});
    TurnOrder.onTurnStateChanged.trigger(turnOrder);
    widget.destroy();
});

it("update (change player count)", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    const widget = new TurnOrderWidget(turnOrder, {});
    turnOrder.setTurnOrder([1, 2], "forward", 1);
    turnOrder.setTurnOrder([1, 2, 3], "forward", 1);
    widget.destroy();
});

it("attach/detach (defaults)", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    const widget = new TurnOrderWidget(turnOrder, {});
    widget.attachToScreen();
    widget.attachToScreen();
    widget.detach();
    widget.detach();
    widget.destroy();
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
    widget.destroy();
});

it("toggle visibility", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    const widget = new TurnOrderWidget(turnOrder, {});
    widget.attachToScreen();

    expect(widget.isVisibleTo(1)).toBeTruthy();
    widget.toggleVisibility(1);
    expect(widget.isVisibleTo(1)).toBeFalsy();
    widget.toggleVisibility(1);
    expect(widget.isVisibleTo(1)).toBeTruthy();
    widget.destroy();
});

it("toggle visibility (context menu)", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    const widget = new TurnOrderWidget(turnOrder, {});
    widget.attachToScreen();

    const player: Player = new MockPlayer({ slot: 1 });
    const actionName: string = locale(
        "turn-order.context-menu.toggle-visibility"
    );

    expect(widget.isVisibleTo(1)).toBeTruthy();
    mockGlobalEvents._customActionAsPlayer(player, actionName);
    expect(widget.isVisibleTo(1)).toBeFalsy();
    widget.destroy();
});
