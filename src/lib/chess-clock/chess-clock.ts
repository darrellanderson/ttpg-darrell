import { Player, world } from "@tabletop-playground/api";
import { NamespaceId } from "../namespace-id/namespace-id";
import { ChessClockData } from "./chess-clock-data";
import { ChessClockWidget } from "./chess-clock-widget";
import { IWindowWidget, WindowParams } from "../ui/window/window-params";
import { Window } from "../ui/window/window";
import { ChessClockConfigWindow } from "./chess-clock-config-window";

export type ChessClockParams = {
    playerSlotOrder: Array<number>;
    windowAnchor?: { u: number; v: number };
    windowPosition?: { u: number; v: number };
    getCurrentPlayerSlot?: () => number;
};

export class ChessClock {
    private static readonly KEY_CHESS_DATA: NamespaceId | undefined = undefined; // "@data/chess-clock";
    private static readonly KEY_WINDOW: NamespaceId = "@window/chess-clock";

    private readonly _chessClockData: ChessClockData;
    private readonly _chessClockWindow: Window;
    private readonly _getCurrentPlayerSlot: (() => number) | undefined;

    constructor(params: ChessClockParams) {
        const playerCount = params.playerSlotOrder.length;
        if (playerCount === 0) {
            throw new Error("No players in chess clock data.");
        }

        // Create core chess clock data.  Still need colors.
        this._chessClockData = new ChessClockData(ChessClock.KEY_CHESS_DATA)
            .setPlayerCount(playerCount)
            .setPlayerOrder(params.playerSlotOrder);

        // Create (but not yet attach) the chess clock window.
        // Persistence may trigger an attach.
        const chessClockData = this._chessClockData;
        const windowParams: WindowParams = {
            title: "Chess Clock",
            size: {
                width: 400,
                height: playerCount * 60,
            },
            screen: {
                anchor: {
                    u: params.windowAnchor?.u ?? 0.5,
                    v: params.windowAnchor?.v ?? 0,
                },
                pos: {
                    u: params.windowPosition?.u ?? 0.5,
                    v: params.windowPosition?.v ?? 0.1,
                },
            },
            windowWidgetGenerator: function (): IWindowWidget {
                return new ChessClockWidget(chessClockData);
            },
            diableWarpScreenWorld: true,
            addToggleMenuItem: true,
        };
        const visibleTo: Array<number> = [...params.playerSlotOrder];
        for (const player of world.getAllPlayers()) {
            const playerSlot: number = player.getSlot();
            if (!visibleTo.includes(playerSlot)) {
                visibleTo.push(playerSlot);
            }
        }

        this._chessClockWindow = new Window(
            windowParams,
            visibleTo,
            ChessClock.KEY_WINDOW
        );
        this._getCurrentPlayerSlot = params.getCurrentPlayerSlot;
    }

    getChessClockData(): ChessClockData {
        return this._chessClockData;
    }

    openConfigWindow(clickingPlayer: Player): void {
        const visibleToPlayerSlot: number = clickingPlayer.getSlot();
        this._chessClockWindow.detach();
        const onOkClicked = () => {
            if (this._getCurrentPlayerSlot) {
                const playerSlot: number = this._getCurrentPlayerSlot();
                this._chessClockData.overrideActivePlayerSlot(playerSlot);
            }

            this._chessClockWindow.attach();
        };
        new ChessClockConfigWindow(
            visibleToPlayerSlot,
            this._chessClockData,
            onOkClicked
        );
    }

    destroy() {
        this._chessClockWindow.detach();
        this._chessClockData.destroy();
    }
}
