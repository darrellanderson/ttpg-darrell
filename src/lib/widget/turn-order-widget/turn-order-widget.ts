import {
    Border,
    Canvas,
    Color,
    ContentButton,
    LayoutBox,
    Player,
    Text,
    TextJustification,
    VerticalBox,
    Widget,
    world,
} from "@tabletop-playground/api";
import { TurnOrder } from "../../turn-order/turn-order";

export type TurnOrderWidgetParams = {
    // Per-turn entry size, stacked vertically.
    entryWidth: number;
    entryHeight: number;

    // Consume pixels at edges to highlight for mouseover (max useful is 4).
    margins?: {
        left?: number;
        top?: number;
        right?: number;
        bottom?: number;
    };

    // Where should the player name appear?  Defaults to full entry.
    nameBox?: {
        left: number;
        top: number;
        width: number;
        height: number;
    };

    // Attach additional items to the turn entry (e.g. score, faction, etc).
    wartGenerators?: ((
        turnEntryWidget: TurnEntryWidget,
        params: TurnOrderWidgetParams
    ) => TurnEntryWart)[];
};

/**
 * Augment a TurnEntryWidget.  May update its own widgets independently of
 * changes to turn order (e.g. change score value when score changes).
 */
export abstract class TurnEntryWart {
    protected readonly _turnEntryWidget: TurnEntryWidget;
    protected readonly _params: TurnOrderWidgetParams;

    constructor(
        turnEntryWidget: TurnEntryWidget,
        params: TurnOrderWidgetParams
    ) {
        this._turnEntryWidget = turnEntryWidget;
        this._params = params;
    }

    /**
     * TurnEntryWidget retired, remove any event handlers, etc.
     */
    abstract destroy(): void;

    /**
     * Update the turn entry widget.
     */
    abstract update(playerSlot: number): void;
}

/**
 * A single widget in the TurnOrderWidget's vertical stack.
 */
export class TurnEntryWidget {
    private readonly _widget: LayoutBox;
    private readonly _contentButton: ContentButton;
    private readonly _canvas: Canvas;
    private readonly _bgBorder: Border;
    private readonly _nameText: Text;
    private readonly _passedText: Text;
    private readonly _warts: TurnEntryWart[] = [];

    constructor(params: TurnOrderWidgetParams) {
        this._bgBorder = new Border();

        const fontSize = Math.floor(params.entryHeight * 0.5);
        this._nameText = new Text()
            .setBold(true)
            .setJustification(TextJustification.Center)
            .setFontSize(fontSize);
        this._passedText = new Text()
            .setBold(true)
            .setJustification(TextJustification.Center)
            .setFontSize(fontSize);

        // Margin aliases.
        const m = {
            l: params.margins?.left ?? 0,
            t: params.margins?.top ?? 0,
            r: params.margins?.right ?? 0,
            b: params.margins?.bottom ?? 0,
            w: 0, // remaining width
            h: 0, // remaining height
        };
        m.w = params.entryWidth - (m.l + m.r) + 2; // dunno why off by 2
        m.h = params.entryHeight - (m.t + m.b);

        // Name postition.
        const name = {
            l: (params.nameBox?.left ?? 0) - m.l,
            t: (params.nameBox?.top ?? 0) - m.t,
            w: params.nameBox?.width ?? params.entryWidth,
            h: params.nameBox?.height ?? params.entryHeight,
        };
        const d = Math.floor(name.h * 0.05); // tweak to center text vertically
        name.t += d;

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
        console.log(
            [
                m.l - borderSize,
                m.t - borderSize,
                params.entryWidth + (borderSize * 2 - (m.l + m.r)),
                params.entryHeight + (borderSize * 2 - (m.t + m.b)),
            ].join(", ")
        );
        const paddedCanvas = new Canvas().addChild(
            this._contentButton,
            m.l - borderSize,
            m.t - borderSize,
            m.w + borderSize * 2,
            m.h + borderSize * 2
        );

        this._widget = new LayoutBox()
            .setOverrideWidth(params.entryWidth)
            .setOverrideHeight(params.entryHeight)
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

    public getFgBgColors(
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

    public update(turnOrder: TurnOrder, playerSlot: number): void {
        const { fgColor, bgColor } = this.getFgBgColors(turnOrder, playerSlot);

        // Background.
        this._bgBorder.setColor(bgColor);

        // Name.
        const player: Player | undefined = world.getPlayerBySlot(playerSlot);
        const playerName = player?.getName() ?? "<>";
        this._nameText.setText(playerName).setTextColor(fgColor);

        // Passed or eliminated?
        let passedValue: string = "";
        if (
            turnOrder.getPassed(playerSlot) ||
            turnOrder.getEliminated(playerSlot)
        ) {
            passedValue = "~".repeat(playerName.length + 2);
        }
        this._passedText.setText(passedValue).setTextColor(fgColor);

        // Click behavior.
        this._contentButton.onClicked.clear();
        this._contentButton.onClicked.add(
            (button: ContentButton, player: Player) => {
                // TODO: menu [ set turn, toggle passed, toggle eliminated ] (checkbox vs toggle?)
                const msg = `${player.getName()} changed the current turn to ${playerName}`;
                for (const peer of world.getAllPlayers()) {
                    peer.sendChatMessage(msg, [1, 0, 0, 1]);
                }
                turnOrder.setCurrentTurn(playerSlot);
            }
        );

        // Warts.
        for (const wart of this._warts) {
            wart.update(playerSlot);
        }
    }
}

/**
 * Display turn order, update when turn order changes.
 */
export class TurnOrderWidget {
    private readonly _params: TurnOrderWidgetParams;
    private readonly _turnOrder: TurnOrder;
    private readonly _widget: VerticalBox;
    private _turnEntryWidgets: TurnEntryWidget[] = [];

    constructor(turnOrder: TurnOrder, params: TurnOrderWidgetParams) {
        this._params = params;
        this._turnOrder = turnOrder;

        this._widget = new VerticalBox().setChildDistance(0);

        TurnOrder.onTurnStateChanged.add((turnOrder: TurnOrder) => {
            if (turnOrder === this._turnOrder) {
                this.update();
            }
        });

        this.update();
    }

    public getWidget(): Widget {
        return this._widget;
    }

    public update(): this {
        const order = this._turnOrder.getTurnOrder();

        // Only reset turn widgets if the number of turn entries changes.
        if (this._turnEntryWidgets.length !== order.length) {
            this._widget.removeAllChildren();
            for (const turnEnryWidget of this._turnEntryWidgets) {
                turnEnryWidget.destroy();
            }
            this._turnEntryWidgets = [];
            for (let i = 0; i < order.length; i++) {
                const turnEnryWidget = new TurnEntryWidget(this._params);
                this._turnEntryWidgets.push(turnEnryWidget);
                this._widget.addChild(turnEnryWidget.getWidget());
            }
        }

        // Update turn widgets.
        for (let i = 0; i < order.length; i++) {
            const playerSlot: number = order[i];
            const turnWidget: TurnEntryWidget = this._turnEntryWidgets[i];
            turnWidget.update(this._turnOrder, playerSlot);
        }

        return this;
    }
}
