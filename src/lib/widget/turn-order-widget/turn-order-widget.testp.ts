// Resolution options are all 16/9 aspect ratio, but what about full screen?
// Tests see window height is 720 when using the smallest option for screen resolution.

import { Border, Player, refObject } from "@tabletop-playground/api";
import { ErrorHandler } from "../../error-handler/error-handler";
import { TurnEntryWart } from "./turn-entry-wart";
import { TurnEntryWidget } from "./turn-entry-widget";
import { TurnOrder } from "../../turn-order/turn-order";
import { TurnOrderWidget } from "./turn-order-widget";

new ErrorHandler().init();

console.log("--- TURN ORDER WIDGET TEST ---");

const turnOrder = TurnOrder.getInstance("@test/test")
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
    reserveSlots: 6,
    wartGenerators: [
        (turnEntryWidget: TurnEntryWidget) => {
            class MyWart extends TurnEntryWart {
                constructor(turnEntryWidget: TurnEntryWidget) {
                    super();
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
                update(): void {}
            }
            return new MyWart(turnEntryWidget);
        },
    ],
    togglePassed: true,
    customActions: [
        {
            name: "My action!",
        },
    ],
    onCustomAction: (player: Player, identifier: string) => {
        console.log(
            `turn order custom action "${identifier}" by "${player.getName()}"`
        );
    },
});

turnOrderWidget.attachToScreen();

refObject.onPrimaryAction.add(() => {
    turnOrder.nextTurn();
});
