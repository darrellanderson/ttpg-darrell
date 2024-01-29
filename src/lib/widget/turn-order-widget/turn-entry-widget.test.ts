import { TurnEntryWart } from "./turn-entry-wart";
import { TurnEntryWidget } from "./turn-entry-widget";
import { TurnOrderWidgetParams } from "./turn-order-widget";

it("computeFontSize", () => {
    const value: number = TurnEntryWidget.computeFontSize(100);
    expect(value).toEqual(50);
});

it("truncateLongText (long)", () => {
    const value: string = TurnEntryWidget.truncateLongText(
        100,
        "abcdefghijklmnopqrstuvwxyz"
    );
    expect(value).toEqual("abcdefgh");
});

it("truncateLongText (short)", () => {
    const value: string = TurnEntryWidget.truncateLongText(100, "abc");
    expect(value).toEqual("abc");
});

it("constructor", () => {
    const params: TurnOrderWidgetParams = { entryWidth: 1, entryHeight: 1 };
    new TurnEntryWidget(params);
});

it("constructor (with margin)", () => {
    const params: TurnOrderWidgetParams = {
        entryWidth: 1,
        entryHeight: 1,
        margins: { left: 1, top: 1, right: 1, bottom: 1 },
    };
    new TurnEntryWidget(params);
});

it("constructor (with wart generator)", () => {
    class MyWart extends TurnEntryWart {
        destroy(): void {}
        update(playerSlot: number): void {}
    }
    const params: TurnOrderWidgetParams = {
        entryWidth: 1,
        entryHeight: 1,
        wartGenerators: [
            (turnEntryWidget: TurnEntryWidget, params: TurnOrderWidgetParams) =>
                new MyWart(turnEntryWidget, params),
        ],
    };
    new TurnEntryWidget(params);
});
