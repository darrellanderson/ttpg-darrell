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
    entryWidth: number;
    entryHeight: number;
    nameBox?: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
};

export class TurnEntryWidget {
    private readonly _widget: LayoutBox;
    private readonly _contentButton: ContentButton;
    private readonly _canvas: Canvas;
    private readonly _bgBorder: Border;
    private readonly _nameText: Text;
    private readonly _passedText: Text;

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

        const nameLeft = params.nameBox?.left ?? 0;
        let nameTop = params.nameBox?.top ?? 0;
        const nameWidth = params.nameBox?.width ?? params.entryWidth;
        let nameHeight = params.nameBox?.height ?? params.entryHeight;

        // Tweak name box to center text vertically.
        const d = Math.floor(nameHeight * 0.05);
        nameTop += d;
        nameHeight -= d;

        this._canvas = new Canvas()
            .addChild(
                this._bgBorder,
                0,
                0,
                params.entryWidth,
                params.entryHeight
            )
            .addChild(this._nameText, nameLeft, nameTop, nameWidth, nameHeight)
            .addChild(
                this._passedText,
                nameLeft,
                nameTop,
                nameWidth,
                nameHeight
            );

        // Strip the top and bottom from the content button border.
        // Nest it inside a slightly shorter canvas, at negative top offset.
        const borderSize = 4;
        const box = new LayoutBox()
            .setOverrideWidth(params.entryWidth - borderSize * 2)
            .setOverrideHeight(params.entryHeight)
            .setChild(this._canvas);
        this._contentButton = new ContentButton().setChild(box);
        const paddedCanvas = new Canvas().addChild(
            this._contentButton,
            0,
            -borderSize,
            params.entryWidth,
            params.entryHeight + borderSize * 2
        );

        this._widget = new LayoutBox()
            .setOverrideWidth(params.entryWidth)
            .setOverrideHeight(params.entryHeight)
            .setChild(paddedCanvas);
    }

    public getWidget(): Widget {
        return this._widget;
    }

    public getCanvas(): Canvas {
        return this._canvas;
    }

    public update(turnOrder: TurnOrder, playerSlot: number): void {
        const slotColor: Color = world.getSlotColor(playerSlot);
        const blackColor: Color = new Color(0, 0, 0, 1);

        let bgColor: Color | undefined;
        let fgColor: Color | undefined;
        if (turnOrder.getCurrentTurn() === playerSlot) {
            bgColor = slotColor;
            fgColor = blackColor;
        } else {
            bgColor = blackColor;
            fgColor = slotColor;
        }

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
