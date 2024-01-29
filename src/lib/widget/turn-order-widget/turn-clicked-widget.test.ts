import { Button } from "@tabletop-playground/api";
import { MockButton, MockPlayer } from "ttpg-mock";
import { TurnOrder } from "../../turn-order/turn-order";
import { TurnClickedWidget } from "./turn-clicked-widget";
import { TurnOrderWidgetParams } from "./turn-order-widget";
import { Broadcast } from "../../broadcast/broadcast";

it("constructor", () => {
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = { entryWidth: 1, entryHeight: 1 };
    const playerSlot = 7;
    new MockPlayer({ slot: playerSlot, name: "my-name" });
    new TurnClickedWidget(turnOrder, params, playerSlot);
});

it("constructor (missing player)", () => {
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = { entryWidth: 1, entryHeight: 1 };
    const playerSlot = 7;
    new TurnClickedWidget(turnOrder, params, playerSlot);
});

it("createWidget", () => {
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = { entryWidth: 1, entryHeight: 1 };
    const playerSlot = 7;
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        playerSlot
    );
    turnClickedWidget.getWidget();
});

it("attach/detach", () => {
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = { entryWidth: 1, entryHeight: 1 };
    const playerSlot = 7;
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        playerSlot
    );
    const clickingPlayer = new MockPlayer();
    turnClickedWidget.attachToScreen(clickingPlayer);
    turnClickedWidget.attachToScreen(clickingPlayer); // safe to repeat
    turnClickedWidget.detachFromScreen();
    turnClickedWidget.detachFromScreen();
});

it("set turn button", () => {
    const targetPlayerSlot = 2;
    const targetPlayer = new MockPlayer({
        name: "my-target-player-name",
        slot: targetPlayerSlot,
    });
    const clickingPlayerSlot = 3;
    const clickingPlayer = new MockPlayer({
        name: "my-clicking-player-name",
        slot: clickingPlayerSlot,
    });
    const turnOrder = new TurnOrder("@test/test").setTurnOrder(
        [1, 2, 3],
        "forward",
        1
    );
    const params: TurnOrderWidgetParams = { entryWidth: 1, entryHeight: 1 };
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        targetPlayerSlot
    );
    const button: MockButton =
        turnClickedWidget._createSetTurnButton() as MockButton;
    expect(button.getText()).toEqual("Set current turn");

    expect(turnOrder.getCurrentTurn()).toEqual(1);
    button._clickAsPlayer(clickingPlayer); // must appear in turn order to change
    expect(turnOrder.getCurrentTurn()).toEqual(targetPlayerSlot);
    expect(Broadcast.lastMessage).toEqual(
        `${clickingPlayer.getName()} set current turn to ${targetPlayer.getName()}`
    );
});

it("toggle passed button", () => {
    const targetPlayerSlot = 2;
    const targetPlayer = new MockPlayer({
        name: "my-target-player-name",
        slot: targetPlayerSlot,
    });
    const clickingPlayerSlot = 3;
    const clickingPlayer = new MockPlayer({
        name: "my-clicking-player-name",
        slot: clickingPlayerSlot,
    });
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = { entryWidth: 1, entryHeight: 1 };
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        targetPlayerSlot
    );
    const button: MockButton =
        turnClickedWidget._createTogglePassedButton() as MockButton;
    expect(button.getText()).toEqual("Set passed");

    expect(turnOrder.getPassed(targetPlayerSlot)).toBeFalsy();
    button._clickAsPlayer(clickingPlayer);
    expect(turnOrder.getPassed(targetPlayerSlot)).toBeTruthy();
    expect(Broadcast.lastMessage).toEqual(
        `${clickingPlayer.getName()} toggled passed for ${targetPlayer.getName()}`
    );

    // Clicking again keeps the opposite of initial state.
    button._clickAsPlayer(clickingPlayer);
    expect(turnOrder.getPassed(targetPlayerSlot)).toBeTruthy();

    // Create a new button to toggle again.
    const button2: MockButton =
        turnClickedWidget._createTogglePassedButton() as MockButton;
    expect(button2.getText()).toEqual("Clear passed");
    button2._clickAsPlayer(clickingPlayer);
    expect(turnOrder.getPassed(targetPlayerSlot)).toBeFalsy();
});

it("toggle eliminated button", () => {
    const targetPlayerSlot = 2;
    const targetPlayer = new MockPlayer({
        name: "my-target-player-name",
        slot: targetPlayerSlot,
    });
    const clickingPlayerSlot = 3;
    const clickingPlayer = new MockPlayer({
        name: "my-clicking-player-name",
        slot: clickingPlayerSlot,
    });
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = { entryWidth: 1, entryHeight: 1 };
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        targetPlayerSlot
    );
    const button: MockButton =
        turnClickedWidget._createToggleEliminatedButton() as MockButton;
    expect(button.getText()).toEqual("Set eliminated");

    expect(turnOrder.getEliminated(targetPlayerSlot)).toBeFalsy();
    button._clickAsPlayer(clickingPlayer);
    expect(turnOrder.getEliminated(targetPlayerSlot)).toBeTruthy();
    expect(Broadcast.lastMessage).toEqual(
        `${clickingPlayer.getName()} toggled eliminated for ${targetPlayer.getName()}`
    );

    // Clicking again keeps the opposite of initial state.
    button._clickAsPlayer(clickingPlayer);
    expect(turnOrder.getEliminated(targetPlayerSlot)).toBeTruthy();

    // Create a new button to toggle again.
    const button2: MockButton =
        turnClickedWidget._createToggleEliminatedButton() as MockButton;
    expect(button2.getText()).toEqual("Clear eliminated");
    button2._clickAsPlayer(clickingPlayer);
    expect(turnOrder.getEliminated(targetPlayerSlot)).toBeFalsy();
});

it("cancel button", () => {
    const targetPlayerSlot = 2;
    const clickingPlayer = new MockPlayer();
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = { entryWidth: 1, entryHeight: 1 };
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        targetPlayerSlot
    );
    const button: MockButton =
        turnClickedWidget._createCancelButton() as MockButton;
    button._clickAsPlayer(clickingPlayer);
});
