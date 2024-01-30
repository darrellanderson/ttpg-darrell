import {
    Border,
    Canvas,
    Color,
    ContentButton,
    LayoutBox,
    Player,
    Text,
    TextJustification,
    Widget,
    world,
} from "@tabletop-playground/api";
import { locale } from "../../locale/locale";
import { DICT as TurnOrderLocaleData } from "./turn-order-locale.data";
import { TurnClickedWidget } from "./turn-clicked-widget";
import { TurnEntryWart } from "./turn-entry-wart";
import { TurnOrder } from "../../turn-order/turn-order";
import {
    TurnOrderWidgetDefaults,
    TurnOrderWidgetParams,
} from "./turn-order-widget-params";

locale.inject(TurnOrderLocaleData);

/**
 * A single widget in the TurnOrderWidget's vertical stack.
 */
export class TurnEntryWidget {
    private readonly _nameWidth: number;
    private readonly _entryHeight: number;
    private readonly _widget: LayoutBox;
    private readonly _contentButton: ContentButton;
    private readonly _canvas: Canvas;
    private readonly _bgBorder: Border;
    private readonly _nameText: Text;
    private readonly _passedText: Text;
    private readonly _warts: TurnEntryWart[] = [];

    static computeFontSize(boxHeight: number): number {
        return Math.ceil(boxHeight * 0.5);
    }

    static truncateLongText(boxWidth: number, text: string): string {
        const maxLength = Math.floor(boxWidth / 12);
        if (text.length > maxLength) {
            return text.substring(0, maxLength);
        }
        return text;
    }

    public static getFgBgColors(
        turnOrder: TurnOrder,
        playerSlot: number
    ): { fgColor: Color; bgColor: Color } {
        let fgColor: Color = world.getSlotColor(playerSlot);
        let bgColor: Color = new Color(0, 0, 0, 1);
        if (turnOrder.getCurrentTurn() === playerSlot) {
            [fgColor, bgColor] = [bgColor, fgColor];
        }
        return { fgColor, bgColor };
    }

    constructor(params: TurnOrderWidgetParams) {
        const w: number =
            params.entryWidth ?? TurnOrderWidgetDefaults.DEFAULT_ENTRY_WIDTH;
        const h: number =
            params.entryHeight ?? TurnOrderWidgetDefaults.DEFAULT_ENTRY_WIDTH;

        // Margin aliases.
        const m = {
            l: params.margins?.left ?? 0,
            t: params.margins?.top ?? 0,
            r: params.margins?.right ?? 0,
            b: params.margins?.bottom ?? 0,
            w: 0, // remaining width
            h: 0, // remaining height
        };
        m.w = w - (m.l + m.r);
        m.h = w - (m.t + m.b);

        // Name postition.
        const name = {
            l: (params.nameBox?.left ?? 0) - m.l,
            t: (params.nameBox?.top ?? 0) - m.t,
            w: params.nameBox?.width ?? w,
            h: params.nameBox?.height ?? h,
        };
        const d = Math.floor(name.h * 0.06); // tweak to center text vertically
        name.t += d;

        this._entryHeight = h;
        this._nameWidth = name.w;

        this._bgBorder = new Border();

        const fontSize = TurnEntryWidget.computeFontSize(name.h);
        this._nameText = new Text()
            .setBold(true)
            .setJustification(TextJustification.Center)
            .setFontSize(fontSize);
        this._passedText = new Text()
            .setBold(true)
            .setJustification(TextJustification.Center)
            .setFontSize(fontSize);

        // Wrap the primary canvas in a layout box to enforce size.
        this._canvas = new Canvas()
            .addChild(this._bgBorder, 0, 0, m.w, m.h)
            .addChild(this._nameText, name.l, name.t, name.w, name.h)
            .addChild(this._passedText, name.l, name.t, name.w, name.h);
        const innerCanvasBox = new LayoutBox()
            .setOverrideWidth(m.w)
            .setOverrideHeight(m.h)
            .setChild(this._canvas);

        // Place primary canvas in a content button, then nest that in another
        // canvas positioned to keep margin amounts of content button border.
        const borderSize = 4;
        this._contentButton = new ContentButton().setChild(innerCanvasBox);
        const paddedCanvas = new Canvas().addChild(
            this._contentButton,
            m.l - borderSize,
            m.t - borderSize,
            m.w + borderSize * 2,
            m.h + borderSize * 2
        );

        this._widget = new LayoutBox()
            .setOverrideWidth(w)
            .setOverrideHeight(h)
            .setChild(paddedCanvas);

        // Attach warts.
        if (params.wartGenerators) {
            for (const wartGenerator of params.wartGenerators) {
                const wart: TurnEntryWart = wartGenerator(this, params);
                this._warts.push(wart);
            }
        }
    }

    public destroy(): void {
        for (const wart of this._warts) {
            wart.destroy();
        }
    }

    public getWidget(): Widget {
        return this._widget;
    }

    public getCanvas(): Canvas {
        return this._canvas;
    }

    public update(turnOrder: TurnOrder, playerSlot: number): void {
        const { fgColor, bgColor } = TurnEntryWidget.getFgBgColors(
            turnOrder,
            playerSlot
        );

        // Background.
        this._bgBorder.setColor(bgColor);

        // Name.
        const player: Player | undefined = world.getPlayerBySlot(playerSlot);
        const playerName = TurnEntryWidget.truncateLongText(
            this._nameWidth,
            player?.getName() ?? locale("turn-order.player-name.missing")
        );
        this._nameText.setText(playerName).setTextColor(fgColor);

        // Passed or eliminated?
        let passedValue: string = "";
        if (
            turnOrder.getPassed(playerSlot) ||
            turnOrder.getEliminated(playerSlot)
        ) {
            passedValue = "–".repeat(playerName.length + 2);
        }
        this._passedText.setText(passedValue).setTextColor(fgColor);

        // Click behavior.
        this._contentButton.onClicked.clear();
        this._contentButton.onClicked.add(
            (button: ContentButton, clickingPlayer: Player) => {
                new TurnClickedWidget(
                    turnOrder,
                    this._entryHeight,
                    playerSlot
                ).attachToScreen(clickingPlayer);
            }
        );

        // Warts.
        for (const wart of this._warts) {
            wart.update(playerSlot, fgColor, bgColor);
        }
    }
}
