import {
    Border,
    Button,
    Color,
    ContentButton,
    HorizontalAlignment,
    HorizontalBox,
    LayoutBox,
    Player,
    Text,
    TextBox,
    TextJustification,
    VerticalAlignment,
    VerticalBox,
    Widget,
    WidgetSwitcher,
    world,
} from "@tabletop-playground/api";
import { IWindowWidget, WindowWidgetParams } from "../ui/window/window-params";
import { ChessClockData } from "./chess-clock-data";

type ChessClockWidgetButtonData = {
    bg: Border;
    playerName: Text;
    time: Text;
    editTime: TextBox;
    timeWidgetSwitcher: WidgetSwitcher;
};

export class ChessClockWidget implements IWindowWidget {
    private readonly _chessClockData: ChessClockData;

    private _buttonData: Array<ChessClockWidgetButtonData> = [];
    private _isEditing: boolean = false;
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
        // Use an extra half row for an edit button.
        const h: number = (params.windowSize.height - 2) / (playerCount + 0.5);

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
                editTime: new TextBox()
                    .setFontSize(params.fontSize)
                    .setText("00:00"),
                timeWidgetSwitcher: new WidgetSwitcher(),
            };

            buttonData.timeWidgetSwitcher
                .addChild(buttonData.time)
                .addChild(buttonData.editTime);

            const horizontalBox: Widget = new HorizontalBox()
                .addChild(buttonData.playerName, 0.7)
                .addChild(buttonData.timeWidgetSwitcher, 0.3);

            const p = params.spacing * 2;
            const layoutBox: Widget = new LayoutBox()
                .setHorizontalAlignment(HorizontalAlignment.Fill)
                .setVerticalAlignment(VerticalAlignment.Center)
                .setOverrideHeight(h)
                .setOverrideWidth(params.windowSize.width)
                .setPadding(p, p, 0, 0)
                .setChild(horizontalBox);

            buttonData.bg.setChild(layoutBox);
            const button: ContentButton = new ContentButton().setChild(
                buttonData.bg
            );

            button.onClicked.add(
                (button: ContentButton, clickingPlayer: Player) => {
                    if (!clickingPlayer) {
                        throw new Error("invalid player");
                    }
                    const clickingPlayerName: string = clickingPlayer.getName();

                    const targetPlayerSlot: number | undefined =
                        this._chessClockData.getPlayerOrder()[i];
                    if (targetPlayerSlot === undefined) {
                        throw new Error("invalid player slot");
                    }
                    const targetPlayer: Player | undefined =
                        world.getPlayerBySlot(targetPlayerSlot);

                    const targetPlayerName: string =
                        targetPlayer?.getName() ?? "<?>";

                    if (
                        this._chessClockData.getActivePlayerSlot() ===
                        targetPlayerSlot
                    ) {
                        const msg: string = `${clickingPlayerName} stopped the clock`;
                        this._chessClockData.broadcast(msg);
                        this._chessClockData.overrideActivePlayerSlot(-1);
                    } else {
                        const msg: string = `${clickingPlayerName} set the clock to ${targetPlayerName}`;
                        this._chessClockData.broadcast(msg);
                        this._chessClockData.overrideActivePlayerSlot(
                            targetPlayerSlot
                        );
                    }

                    this.update();
                }
            );
            this._buttonData.push(buttonData);

            // Remove the content button border.
            const buttonBox: Widget = new LayoutBox()
                .setPadding(-4, -4, -4, -4)
                .setOverrideHeight(h)
                .setChild(button);
            verticalBox.addChild(buttonBox);
        }

        // Edit button.
        const editButton: Button = new Button()
            .setFontSize(params.fontSize * 0.4)
            .setText("EDIT");
        const editButtonBox = new LayoutBox()
            .setOverrideHeight(h / 2)
            .setChild(editButton);
        verticalBox.addChild(editButtonBox);

        editButton.onClicked.add((button: Button, clickingPlayer: Player) => {
            if (this._isEditing) {
                this.editEnd(clickingPlayer);
                editButton.setText("EDIT");
            } else {
                this.editStart(clickingPlayer);
                editButton.setText("SAVE");
            }
        });

        this.update();
        return verticalBox;
    }

    destroy(): void {
        if (this._intervalUpdateWidget !== undefined) {
            clearInterval(this._intervalUpdateWidget);
            this._intervalUpdateWidget = undefined;
        }
    }

    editStart(clickingPlayer: Player): void {
        if (!clickingPlayer) {
            throw new Error("editStart: invalid player");
        }

        this._isEditing = true;

        const clickingPlayerName: string = clickingPlayer.getName();
        const msg = `${clickingPlayerName} stopped the clock to edit remaining time(s)`;
        this._chessClockData.broadcast(msg);

        // Pause updates.
        this._chessClockData.overrideActivePlayerSlot(-1);

        for (const buttonData of this._buttonData) {
            const value: string = buttonData.time.getText();
            buttonData.editTime.setText(value);
            buttonData.timeWidgetSwitcher.setActiveWidget(buttonData.editTime);
        }

        this.update();
    }

    editEnd(clickingPlayer: Player): void {
        if (!clickingPlayer) {
            throw new Error("editEnd: invalid player");
        }

        this._isEditing = false;

        const clickingPlayerName: string = clickingPlayer.getName();
        const msg: string = `${clickingPlayerName} finished editing remaining time(s), click a player to resume time allocation`;
        this._chessClockData.broadcast(msg);

        // Resume updates.
        for (const buttonData of this._buttonData) {
            buttonData.timeWidgetSwitcher.setActiveWidget(buttonData.time);
        }

        // Attempt to transfer times from edit boxes to time widgets.
        const newTimes: Array<number> = [];
        for (const buttonData of this._buttonData) {
            const text: string = buttonData.editTime.getText();

            // Update the time, reject if malformed.
            const m = text.match(/^(-?)(\d+):(\d+)$/);
            let sign: number = 1;
            let seconds: number = -1;
            let minutes: number = -1;

            if (m) {
                sign = m[1] === "-" ? -1 : 1;
                minutes = parseInt(m[2] ?? "-1");
                seconds = parseInt(m[3] ?? "-1");
            }

            if (seconds < 0 || seconds >= 60 || minutes < 0 || minutes > 120) {
                const msg: string = `Invalid time format "${text}", use MM:SS. Restoring old time values.`;
                this._chessClockData.broadcast(msg);
                return;
            }

            const time: number = sign * (minutes * 60 + seconds);
            newTimes.push(time);
        }

        // If all times are valid, update the chess clock data.
        const playerSlots: Array<number> =
            this._chessClockData.getPlayerOrder();
        for (let i = 0; i < newTimes.length; i++) {
            const playerSlot: number | undefined = playerSlots[i];
            const newTime: number | undefined = newTimes[i];
            if (playerSlot === undefined || newTime === undefined) {
                throw new Error("invalid index");
            }
            this._chessClockData.setTimeRemainingSeconds(playerSlot, newTime);
        }

        this.update();
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
                .toFixed(0)
                .padStart(2, "0");
            const timeStr: string = `${sign}${minutes}:${seconds}`;

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
