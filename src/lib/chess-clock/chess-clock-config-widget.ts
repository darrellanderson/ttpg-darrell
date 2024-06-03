import {
    Button,
    HorizontalBox,
    LayoutBox,
    Panel,
    Slider,
    Text,
    TextBox,
    VerticalBox,
    Widget,
} from "@tabletop-playground/api";
import { IWindowWidget, WindowWidgetParams } from "../ui/window/window-params";
import { ChessClockData } from "./chess-clock-data";
import { ChessClockWindow } from "./chess-clock-window";

export class ChessClockConfigWidget implements IWindowWidget {
    private readonly _chessClockData: ChessClockData;

    constructor(chessClockData: ChessClockData) {
        this._chessClockData = chessClockData;

        if (chessClockData.getPlayerOrder().length === 0) {
            throw new Error("No players in chess clock data.");
        }
    }

    create(params: WindowWidgetParams): Widget {
        const panel: Panel = new VerticalBox().setChildDistance(
            params.spacing * 3
        );

        panel.addChild(
            new Text()
                .setFontSize(params.fontSize * 0.6)
                .setAutoWrap(true)
                .setText(
                    "Create a countdown timer for each player, click a player name to override the active player. Click edit to adjust remaining time manually."
                )
        );
        panel.addChild(
            new Text()
                .setFontSize(params.fontSize * 0.6)
                .setAutoWrap(true)
                .setText(
                    "The optional discord bot token enables monitoring active speakers, applying time to them instead of the current player."
                )
        );

        const timeBudgetLabel: Text = new Text()
            .setFontSize(params.fontSize)
            .setText("Time Budget (minutes):");
        const timeBudget: Slider = new Slider()
            .setMinValue(1)
            .setMaxValue(60)
            .setValue(20)
            .setStepSize(1)
            .setFontSize(params.fontSize)
            .setTextBoxWidth(params.fontSize * 4);
        const timeBudgetRow: Panel = new HorizontalBox()
            .setChildDistance(params.spacing)
            .addChild(timeBudgetLabel, 0)
            .addChild(timeBudget, 1);
        panel.addChild(timeBudgetRow);

        const discordKeyLabel: Text = new Text()
            .setFontSize(params.fontSize)
            .setText("Bot token:");
        const discordKey: TextBox = new TextBox()
            .setFontSize(params.fontSize)
            .setMaxLength(1023);
        const discordKeyRow: Panel = new HorizontalBox()
            .setChildDistance(params.spacing)
            .addChild(discordKeyLabel, 0)
            .addChild(discordKey, 1);
        panel.addChild(discordKeyRow);

        // Push buttons to bottom.
        panel.addChild(new LayoutBox(), 1);

        const cancelButton: Button = new Button()
            .setFontSize(params.fontSize)
            .setText("CANCEL");
        const okButton: Button = new Button()
            .setFontSize(params.fontSize)
            .setText("OK");
        const buttonRow: Panel = new HorizontalBox()
            .setChildDistance(params.spacing)
            .addChild(cancelButton, 1)
            .addChild(okButton, 1);
        panel.addChild(buttonRow);

        cancelButton.onClicked.add(() => {
            params.close();
        });

        okButton.onClicked.add(() => {
            params.close();

            const timeBudgetMinutes: number = timeBudget.getValue();
            const discordToken: string = discordKey.getText();

            this._chessClockData.setTimeBudgetSeconds(timeBudgetMinutes * 60);
            if (discordToken && discordToken.length > 0) {
                this._chessClockData.connectDiscordSpeaking(discordToken);
            }
            new ChessClockWindow(this._chessClockData);
        });

        return panel;
    }

    destroy(): void {
        // nop
    }
}
