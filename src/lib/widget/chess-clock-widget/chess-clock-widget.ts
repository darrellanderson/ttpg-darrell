import {
    Border,
    Color,
    ContentButton,
    HorizontalAlignment,
    HorizontalBox,
    LayoutBox,
    Player,
    Text,
    TextJustification,
    VerticalAlignment,
    VerticalBox,
    Widget,
    world,
} from "@tabletop-playground/api";
import {
    IWindowWidget,
    WindowWidgetParams,
} from "../../ui/window/window-params";
import { ChessClockData } from "./chess-clock-data";

type ChessClockWidgetButtonData = {
    bg: Border;
    playerName: Text;
    time: Text;
};

export class ChessClockWidget implements IWindowWidget {
    private readonly _chessClockData: ChessClockData;

    private _buttonData: Array<ChessClockWidgetButtonData> = [];

    private _intervalUpdateWidget: NodeJS.Timeout | undefined = undefined;

    constructor(chessClockData: ChessClockData) {
        this._chessClockData = chessClockData;

        const playerCount: number = this._chessClockData.getPlayerCount();
        if (playerCount <= 0) {
            throw new Error("invalid player count");
        }
    }

    create(params: WindowWidgetParams): Widget {
        this._intervalUpdateWidget = setInterval(() => {
            this.update();
        }, 1000);

        const verticalBox: VerticalBox = new VerticalBox().setChildDistance(0);

        const playerCount: number = this._chessClockData.getPlayerCount();
        const playerSlots: Array<number> =
            this._chessClockData.getPlayerOrder();
        if (playerSlots.length !== playerCount) {
            throw new Error("player count mismatch");
        }

        // ContentButton does not support Fill alignment (yet),
        // set a layout box with exact size.  Content button adds
        // 4 padding to the contained widget (unless stripped).
        const h: number = (params.windowSize.height - 2) / playerCount;

        this._buttonData = [];

        for (let i: number = 0; i < playerCount; i++) {
            const buttonData: ChessClockWidgetButtonData = {
                bg: new Border(),
                playerName: new Text()
                    .setJustification(TextJustification.Left)
                    .setFontSize(params.fontSize)
                    .setAutoWrap(false),
                time: new Text()
                    .setJustification(TextJustification.Right)
                    .setFontSize(params.fontSize)
                    .setAutoWrap(false),
            };

            const horizontalBox: Widget = new HorizontalBox()
                .addChild(buttonData.playerName, 0)
                .addChild(buttonData.time, 1);

            const layoutBox: Widget = new LayoutBox()
                .setHorizontalAlignment(HorizontalAlignment.Fill)
                .setVerticalAlignment(VerticalAlignment.Center)
                .setOverrideHeight(h)
                .setOverrideWidth(params.windowSize.width)
                .setChild(horizontalBox);

            buttonData.bg.setChild(layoutBox);
            const button: ContentButton = new ContentButton().setChild(
                buttonData.bg
            );

            button.onClicked.add((button: ContentButton, player: Player) => {
                const targetPlayerSlot: number | undefined = playerSlots[i];
                if (targetPlayerSlot === undefined) {
                    throw new Error("invalid player slot");
                }
                const targetPlayer: Player | undefined =
                    world.getPlayerBySlot(targetPlayerSlot);

                const clickingPlayerName: string = player.getName();
                const targetPlayerName: string =
                    targetPlayer?.getName() ?? "<?>";

                if (
                    this._chessClockData.getActivePlayerSlot() ===
                    targetPlayerSlot
                ) {
                    const msg: string = `${clickingPlayerName} stopped the clock`;
                    this._chessClockData.broadcast(msg);
                    this._chessClockData.setActivePlayerSlot(-1);
                } else {
                    const msg: string = `${clickingPlayerName} set the clock to ${targetPlayerName}`;
                    this._chessClockData.broadcast(msg);
                    this._chessClockData.setActivePlayerSlot(targetPlayerSlot);
                }

                this.update();
            });
            this._buttonData.push(buttonData);

            // Remove the content button border.
            const buttonBox: Widget = new LayoutBox()
                .setPadding(-4, -4, -4, -4)
                .setOverrideHeight(h)
                .setChild(button);
            verticalBox.addChild(buttonBox);
        }

        this.update();
        return verticalBox;
    }

    destroy(): void {
        if (this._intervalUpdateWidget !== undefined) {
            clearInterval(this._intervalUpdateWidget);
            this._intervalUpdateWidget = undefined;
        }
    }

    update(): void {
        const playerOrder: Array<number> =
            this._chessClockData.getPlayerOrder();

        for (
            let i: number = 0;
            i < this._chessClockData.getPlayerCount();
            i++
        ) {
            const playerSlot: number | undefined = playerOrder[i];
            if (playerSlot === undefined) {
                throw new Error("invalid player slot");
            }

            const buttonData: ChessClockWidgetButtonData | undefined =
                this._buttonData[i];
            if (buttonData === undefined) {
                throw new Error("invalid button data");
            }

            const color: Color | undefined =
                this._chessClockData.getWidgetColor(playerSlot);
            if (color === undefined) {
                throw new Error("invalid color");
            }

            let playerName: string = `<player ${i + 1}>`;
            const player: Player | undefined =
                world.getPlayerBySlot(playerSlot);
            if (player !== undefined) {
                playerName = player.getName();
            }

            const time: number =
                this._chessClockData.getTimeRemainingSeconds(playerSlot);
            const sign: string = time < 0 ? "-" : "";
            const minutes: string = Math.floor(Math.abs(time) / 60).toString();
            const seconds: string = (Math.abs(time) % 60)
                .toFixed(1)
                .padStart(4, "0");
            const timeStr: string = `${sign}${minutes}:${seconds}`;

            buttonData.playerName.setText(" " + playerName + "   ");
            buttonData.time.setText(timeStr + " ");

            const isActive: boolean =
                this._chessClockData.getActivePlayerSlot() === playerSlot;
            const fg: Color = isActive ? new Color(0, 0, 0) : color;
            const bg: Color = isActive ? color : new Color(0, 0, 0);
            buttonData.playerName.setTextColor(fg);
            buttonData.time.setTextColor(fg);
            buttonData.bg.setColor(bg);
        }
    }
}
