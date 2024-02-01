import { MockButton, MockPlayer } from "ttpg-mock";
import { locale } from "../../locale/locale";
import { TurnOrder } from "../../turn-order/turn-order";
import { TurnClickedWidget } from "./turn-clicked-widget";
import { Broadcast } from "../../broadcast/broadcast";
import { TurnOrderWidgetParams } from "./turn-order-widget-params";
import {
    Border,
    Button,
    LayoutBox,
    Panel,
    Widget,
} from "@tabletop-playground/api";

it("constructor", () => {
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = {};
    const playerSlot = 7;
    new MockPlayer({ slot: playerSlot, name: "my-name" }); // uses name
    new TurnClickedWidget(turnOrder, params, playerSlot);
});

it("constructor (missing player)", () => {
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = {};
    const playerSlot = 7;
    new TurnClickedWidget(turnOrder, params, playerSlot);
});

it("createWidget", () => {
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = {};
    const playerSlot = 7;
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        playerSlot
    );
    turnClickedWidget.getWidget();
});

it("createWidget (optional items)", () => {
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = {
        togglePassed: true,
        toggleEliminated: true,
        customActions: [
            { name: "my-name" },
            { name: "my-name2", identifier: "my-identifier" },
        ],
        onCustomAction: () => {},
    };
    const playerSlot = 7;
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        playerSlot
    );
    const widget = turnClickedWidget.getWidget();

    const clickAll = (widget: Widget | undefined) => {
        if (widget instanceof Panel) {
            for (const child of widget.getAllChildren()) {
                clickAll(child);
            }
        } else if (widget instanceof LayoutBox) {
            clickAll(widget.getChild());
        } else if (widget instanceof Border) {
            clickAll(widget.getChild());
        } else if (widget instanceof Button) {
            const mockButton = widget as MockButton;
            const clickingPlayer = new MockPlayer();
            mockButton._clickAsPlayer(clickingPlayer);
        }
    };
    clickAll(widget);
});

it("attach/detach (defaults)", () => {
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = {};
    const playerSlot = 7;
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        playerSlot
    );
    const clickingPlayer = new MockPlayer();
    turnClickedWidget.attachToScreen(clickingPlayer);
    turnClickedWidget.attachToScreen(clickingPlayer); // safe to repeat
    turnClickedWidget.detach();
    turnClickedWidget.detach();
});

it("attach/detach (override height)", () => {
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = {
        entryHeight: 1,
    };
    const playerSlot = 7;
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        playerSlot
    );
    const clickingPlayer = new MockPlayer();
    turnClickedWidget.attachToScreen(clickingPlayer);
    turnClickedWidget.attachToScreen(clickingPlayer); // safe to repeat
    turnClickedWidget.detach();
    turnClickedWidget.detach();
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
    const params: TurnOrderWidgetParams = {};
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
    const params: TurnOrderWidgetParams = {};
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        targetPlayerSlot
    );
    const button: MockButton =
        turnClickedWidget._createTogglePassedButton() as MockButton;

    let localeKey = "turn-order.passed.set";
    let localeValue = locale(localeKey);
    expect(localeKey).not.toEqual(localeValue);
    expect(button.getText()).toEqual(localeValue);

    expect(turnOrder.getPassed(targetPlayerSlot)).toBeFalsy();
    button._clickAsPlayer(clickingPlayer);
    expect(turnOrder.getPassed(targetPlayerSlot)).toBeTruthy();

    localeKey = "turn-order.passed.toggled-by";
    localeValue = locale(localeKey, {
        clickingPlayer: clickingPlayer.getName(),
        targetPlayer: targetPlayer.getName(),
    });
    expect(localeKey).not.toEqual(localeValue);
    expect(Broadcast.lastMessage).toEqual(localeValue);

    // Clicking again keeps the opposite of initial state.
    button._clickAsPlayer(clickingPlayer);
    expect(turnOrder.getPassed(targetPlayerSlot)).toBeTruthy();

    // Create a new button to toggle again.
    const button2: MockButton =
        turnClickedWidget._createTogglePassedButton() as MockButton;

    localeKey = "turn-order.passed.clear";
    localeValue = locale(localeKey);
    expect(localeKey).not.toEqual(localeValue);
    expect(button2.getText()).toEqual(localeValue);

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
    const params: TurnOrderWidgetParams = {};
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        targetPlayerSlot
    );
    const button: MockButton =
        turnClickedWidget._createToggleEliminatedButton() as MockButton;

    let localeKey = "turn-order.eliminated.set";
    let localeValue = locale(localeKey);
    expect(localeKey).not.toEqual(localeValue);
    expect(button.getText()).toEqual(localeValue);

    expect(turnOrder.getEliminated(targetPlayerSlot)).toBeFalsy();
    button._clickAsPlayer(clickingPlayer);
    expect(turnOrder.getEliminated(targetPlayerSlot)).toBeTruthy();

    localeKey = "turn-order.eliminated.toggled-by";
    localeValue = locale(localeKey, {
        clickingPlayer: clickingPlayer.getName(),
        targetPlayer: targetPlayer.getName(),
    });
    expect(localeKey).not.toEqual(localeValue);
    expect(Broadcast.lastMessage).toEqual(localeValue);

    // Clicking again keeps the opposite of initial state.
    button._clickAsPlayer(clickingPlayer);
    expect(turnOrder.getEliminated(targetPlayerSlot)).toBeTruthy();

    // Create a new button to toggle again.
    const button2: MockButton =
        turnClickedWidget._createToggleEliminatedButton() as MockButton;

    localeKey = "turn-order.eliminated.clear";
    localeValue = locale(localeKey);
    expect(localeKey).not.toEqual(localeValue);
    expect(button2.getText()).toEqual(localeValue);

    button2._clickAsPlayer(clickingPlayer);
    expect(turnOrder.getEliminated(targetPlayerSlot)).toBeFalsy();
});

it("cancel button", () => {
    const targetPlayerSlot = 2;
    const clickingPlayer = new MockPlayer();
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = {};
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        targetPlayerSlot
    );
    const button: MockButton =
        turnClickedWidget._createCancelButton() as MockButton;

    const localeKey = "button.cancel";
    const localeValue = locale(localeKey);
    expect(localeKey).not.toEqual(localeValue);
    expect(button.getText()).toEqual(localeValue);

    button._clickAsPlayer(clickingPlayer);
});
