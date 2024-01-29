import { TurnEntryWart } from "./turn-entry-wart";
import { TurnEntryWidget } from "./turn-entry-widget";
import { TurnOrderWidgetParams } from "./turn-order-widget";

it("constructor", () => {
    class MyTurnEntryWart extends TurnEntryWart {
        destroy(): void {
            throw new Error("Method not implemented.");
        }
        update(playerSlot: number): void {
            throw new Error("Method not implemented.");
        }
    }

    const params: TurnOrderWidgetParams = {
        entryWidth: 1,
        entryHeight: 1,
    };
    const turnEntryWidget = new TurnEntryWidget(params);
    new MyTurnEntryWart(turnEntryWidget, params);
});
