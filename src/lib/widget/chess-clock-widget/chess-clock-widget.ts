import {
    Border,
    Color,
    ContentButton,
    HorizontalBox,
    Player,
    Text,
    TextJustification,
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

        const widget: VerticalBox = new VerticalBox().setChildDistance(
            params.spacing
        );

        this._buttonData = [];
        const playerCount: number = this._chessClockData.getPlayerCount();
        for (let i: number = 0; i < playerCount; i++) {
            const buttonData: ChessClockWidgetButtonData = {
                bg: new Border(),
                playerName: new Text().setJustification(TextJustification.Left),
                time: new Text().setJustification(TextJustification.Right),
            };

            buttonData.bg.setChild(
                new HorizontalBox()
                    .addChild(buttonData.playerName)
                    .addChild(buttonData.time)
            );
            const button: ContentButton = new ContentButton().setChild(
                buttonData.bg
            );

            button.onClicked.add((button: ContentButton, player: Player) => {
                const targetPlayerSlot: number | undefined =
                    this._chessClockData.getPlayerOrder()[i];
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
                    const msg: string = `Player ${clickingPlayerName} stopped the clock`;
                    console.log(msg);
                    this._chessClockData.setActivePlayerSlot(-1);
                } else {
                    const msg: string = `Player ${clickingPlayerName} set the clock to ${targetPlayerName}`;
                    console.log(msg);
                    this._chessClockData.setActivePlayerSlot(targetPlayerSlot);
                }
            });
            this._buttonData.push(buttonData);
        }

        this.update();

        return widget;
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
            if (color !== undefined) {
                throw new Error("invalid color");
            }

            let playerName: string = `<player ${i}>`;
            const player: Player | undefined =
                world.getPlayerBySlot(playerSlot);
            if (player !== undefined) {
                playerName = player.getName();
            }

            const time: number =
                this._chessClockData.getTimeRemaining(playerSlot) / 1000;
            const minutes: string = Math.floor(time / 60).toString();
            const seconds: string = Math.floor(time % 60)
                .toString()
                .padStart(2, "0");
            const timeStr: string = `${minutes}:${seconds}`;

            buttonData.playerName.setText(playerName);
            buttonData.time.setText(timeStr);

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
