import { Color, VerticalBox, Widget } from "@tabletop-playground/api";
import { WindowWidgetParams } from "../../ui/window/window-params";

type CheckClockEntry = {
    playerName: string;
    color: Color;
    time: number;
    active: boolean;
};

export class ChessClockWidget {
    private static readonly _entries: Array<CheckClockEntry> = [];
    private static readonly _playerSlotToWidget: Map<number, ChessClockWidget> =
        new Map();
    private static _timeLimit: number = 0;

    public static setTimeLimit(timeLimit: number): void {
        ChessClockWidget._timeLimit = timeLimit;
    }

    public static updatePlayer(
        playerIndex: number,
        playerName: string,
        color: Color
    ): void {
        const entry: CheckClockEntry | undefined =
            ChessClockWidget._entries[playerIndex];
        if (!entry) {
            throw new Error("Invalid player index");
        }
        entry.playerName = playerName;
        entry.color = color;
    }

    static setActivePlayer(playerIndex: number) {
        ChessClockWidget._entries.forEach((entry, index) => {
            entry.active = index === playerIndex;
        });
    }

    static reset() {
        ChessClockWidget._entries.forEach((entry) => {
            entry.active = false;
        });
    }

    constructor() {}

    createWidget(params: WindowWidgetParams): Widget {
        const widget: VerticalBox = new VerticalBox().setChildDistance(
            params.spacing
        );
        // TODO
        ChessClockWidget._playerSlotToWidget.set(params.playerSlot, this);
        return widget;
    }
}
