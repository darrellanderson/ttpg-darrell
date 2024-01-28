// Resolution options are all 16/9 aspect ratio, but what about full screen?
// Tests see window height is 720 when using the smallest option for screen resolution.

import {
    Border,
    ScreenUIElement,
    refObject,
    world,
} from "@tabletop-playground/api";
import { TurnOrder } from "../../turn-order/turn-order";
import {
    TurnEntryWart,
    TurnEntryWidget,
    TurnOrderWidget,
    TurnOrderWidgetParams,
} from "./turn-order-widget";

console.log("--- TURN ORDER WIDGET TEST ---");

const turnOrder = new TurnOrder("@test/test")
    .setTurnOrder([0, 1, 2, 3, 4, 5], "forward", 0)
    .setPassed(0, true);

const w = 150 + 50;
const h = 25;
const turnOrderWidget = new TurnOrderWidget(turnOrder, {
    entryWidth: w,
    entryHeight: h,
    nameBox: {
        left: 50,
        width: 150,
    },
    margins: {
        left: 4,
        right: 4,
        top: 0,
        bottom: 0,
    },
    wartGenerators: [
        (turnEntryWidget: TurnEntryWidget, params: TurnOrderWidgetParams) => {
            class MyWart extends TurnEntryWart {
                constructor(
                    turnEntryWidget: TurnEntryWidget,
                    params: TurnOrderWidgetParams
                ) {
                    super(turnEntryWidget, params);
                    turnEntryWidget
                        .getCanvas()
                        .addChild(
                            new Border().setColor([1, 0, 0, 1]),
                            5,
                            5,
                            15,
                            15
                        );
                }
                destroy(): void {}
                update(playerSlot: number): void {}
            }
            return new MyWart(turnEntryWidget, params);
        },
    ],
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
