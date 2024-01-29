import { MockPlayer } from "ttpg-mock";
import { TurnOrder } from "../../turn-order/turn-order";
import { TurnClickedWidget } from "./turn-clicked-widget";
import { TurnOrderWidgetParams } from "./turn-order-widget";

it("constructor", () => {
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = { entryWidth: 1, entryHeight: 1 };
    const playerSlot = 7;
    const clickingPlayer = new MockPlayer();
    new TurnClickedWidget(turnOrder, params, playerSlot, clickingPlayer);
});

it("createWidget", () => {
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = { entryWidth: 1, entryHeight: 1 };
    const playerSlot = 7;
    const clickingPlayer = new MockPlayer();
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        playerSlot,
        clickingPlayer
    );
    turnClickedWidget.getWidget();
});

it("attach/detach", () => {
    const turnOrder = new TurnOrder("@test/test");
    const params: TurnOrderWidgetParams = { entryWidth: 1, entryHeight: 1 };
    const playerSlot = 7;
    const clickingPlayer = new MockPlayer();
    const turnClickedWidget = new TurnClickedWidget(
        turnOrder,
        params,
        playerSlot,
        clickingPlayer
    );
    turnClickedWidget.attachToScreen().detachFromScreen();
});
