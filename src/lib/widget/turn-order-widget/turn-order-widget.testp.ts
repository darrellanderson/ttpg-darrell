// Resolution options are all 16/9 aspect ratio, but what about full screen?
// Tests see window height is 720 when using the smallest option for screen resolution.

import { ScreenUIElement, refObject, world } from "@tabletop-playground/api";
import { TurnOrder } from "../../turn-order/turn-order";
import { TurnOrderWidget } from "./turn-order-widget";

console.log("--- TURN ORDER WIDGET TEST ---");

const turnOrder = new TurnOrder("@test/test")
    .setTurnOrder([0, 1, 2, 3, 4, 5], "forward", 0)
    .setPassed(0, true);

const w = 200;
const h = 50;
const turnOrderWidget = new TurnOrderWidget(turnOrder, {
    entryWidth: w,
    entryHeight: h,
    margins: {
        left: 4,
        right: 4,
        top: 0,
        bottom: 0,
    },
});

const screenUI = new ScreenUIElement();
screenUI.anchorX = 1.1;
screenUI.anchorY = -0.1;
screenUI.positionX = 1;
screenUI.relativePositionX = true;
screenUI.height = h * turnOrder.getTurnOrder().length + 2;
screenUI.width = w + 2;
screenUI.widget = turnOrderWidget.getWidget();

world.addScreenUI(screenUI);

refObject.onPrimaryAction.add(() => {
    turnOrder.nextTurn();
});
