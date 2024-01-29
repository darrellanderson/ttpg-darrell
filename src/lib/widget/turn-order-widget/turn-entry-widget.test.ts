import {
    Canvas,
    ContentButton,
    LayoutBox,
    Widget,
} from "@tabletop-playground/api";
import { TurnOrder } from "../../turn-order/turn-order";
import { TurnEntryWart } from "./turn-entry-wart";
import { TurnEntryWidget } from "./turn-entry-widget";
import { TurnOrderWidgetParams } from "./turn-order-widget";
import { MockContentButton, MockPlayer } from "ttpg-mock";

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

it("getFgBgColors (current player)", () => {
    const turnOrder = new TurnOrder("@test/test").setTurnOrder(
        [1, 2, 3],
        "forward",
        1
    );
    const { fgColor, bgColor } = TurnEntryWidget.getFgBgColors(turnOrder, 1);
    expect(fgColor.toHex()).toEqual("000000FF");
    expect(bgColor.toHex()).toEqual("FFFFFFFF");
});

it("getFgBgColors (not current player)", () => {
    const turnOrder = new TurnOrder("@test/test").setTurnOrder(
        [1, 2, 3],
        "forward",
        1
    );
    const { fgColor, bgColor } = TurnEntryWidget.getFgBgColors(turnOrder, 2);
    expect(fgColor.toHex()).toEqual("FFFFFFFF");
    expect(bgColor.toHex()).toEqual("000000FF");
});

it("constructor", () => {
    const params: TurnOrderWidgetParams = {};
    new TurnEntryWidget(params);
});

it("constructor (with most optional parameters)", () => {
    const params: TurnOrderWidgetParams = {
        entryWidth: 1,
        entryHeight: 1,
        reserveSlots: 6,
        margins: { left: 1, top: 1, right: 1, bottom: 1 },
        nameBox: { left: 1, top: 1, width: 1, height: 1 },
    };
    new TurnEntryWidget(params);
});

it("constructor (with wart generator)", () => {
    class MyWart extends TurnEntryWart {
        destroy(): void {}
        update(playerSlot: number): void {}
    }
    const params: TurnOrderWidgetParams = {
        wartGenerators: [
            (turnEntryWidget: TurnEntryWidget, params: TurnOrderWidgetParams) =>
                new MyWart(turnEntryWidget, params),
        ],
    };
    new TurnEntryWidget(params);
});

it("update and destroy (with warts)", () => {
    new MockPlayer({ slot: 1, name: "my-name" });
    class MyWart extends TurnEntryWart {
        destroy(): void {}
        update(playerSlot: number): void {}
    }
    const params: TurnOrderWidgetParams = {
        wartGenerators: [
            (turnEntryWidget: TurnEntryWidget, params: TurnOrderWidgetParams) =>
                new MyWart(turnEntryWidget, params),
        ],
    };
    const turnEntryWidget = new TurnEntryWidget(params);
    const turnOrder = new TurnOrder("@test/test").setTurnOrder(
        [1, 2, 3],
        "forward",
        1
    );
    turnEntryWidget.update(turnOrder, 1);
    turnEntryWidget.destroy();
});

it("update (passed)", () => {
    const params: TurnOrderWidgetParams = {};
    const turnEntryWidget = new TurnEntryWidget(params);
    const turnOrder = new TurnOrder("@test/test")
        .setTurnOrder([1, 2, 3], "forward", 1)
        .setPassed(1, true);
    turnEntryWidget.update(turnOrder, 1);
});

it("getWidget", () => {
    const params: TurnOrderWidgetParams = {};
    new TurnEntryWidget(params).getWidget();
});

it("getCanvas", () => {
    const params: TurnOrderWidgetParams = {};
    new TurnEntryWidget(params).getCanvas();
});

it("click", () => {
    const params: TurnOrderWidgetParams = {};
    const turnEntryWidget = new TurnEntryWidget(params);
    const turnOrder = new TurnOrder("@test/test");
    turnEntryWidget.update(turnOrder, 1);

    const clickAll = (widget: Widget | undefined) => {
        if (widget instanceof Canvas) {
            for (const child of widget.getChildren()) {
                clickAll(child);
            }
        } else if (widget instanceof LayoutBox) {
            clickAll(widget.getChild());
        } else if (widget instanceof ContentButton) {
            const mockButton = widget as MockContentButton;
            const clickingPlayer = new MockPlayer();
            mockButton._clickAsPlayer(clickingPlayer);
        }
    };
    clickAll(turnEntryWidget.getWidget());
});
