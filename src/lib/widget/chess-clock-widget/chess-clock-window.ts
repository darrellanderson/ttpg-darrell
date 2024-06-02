import { world } from "@tabletop-playground/api";
import { NamespaceId } from "../../namespace-id/namespace-id";
import { Window } from "../../ui/window/window";
import { IWindowWidget, WindowParams } from "../../ui/window/window-params";
import { ChessClockData } from "./chess-clock-data";
import { ChessClockWidget } from "./chess-clock-widget";

/**
 * Add the chess clock as a window.
 */
export class ChessClockWindow {
    private readonly _chessClockData: ChessClockData;
    private readonly _window: Window;

    constructor(chessClockData: ChessClockData, persistenceKey?: NamespaceId) {
        if (chessClockData.getPlayerOrder().length === 0) {
            throw new Error("No players in chess clock data.");
        }

        this._chessClockData = chessClockData;

        const params: WindowParams = {
            title: "Chess Clock",
            size: {
                width: 400,
                height: chessClockData.getPlayerCount() * 60,
            },
            screen: {
                anchor: { x: 0.5, y: 0 },
                pos: { u: 0.5, v: 0.1 },
            },
            windowWidgetGenerator: function (): IWindowWidget {
                return new ChessClockWidget(chessClockData);
            },
            diableWarpScreenWorld: true,
            addToggleMenuItem: true,
        };

        // Create for all involved players.
        const playerSlots: Array<number> =
            this._chessClockData.getPlayerOrder();

        // Also create for any current spectators.
        for (const player of world.getAllPlayers()) {
            if (!playerSlots.includes(player.getSlot())) {
                playerSlots.push(player.getSlot());
            }
        }

        this._window = new Window(params, playerSlots, persistenceKey).attach();
    }

    destroy(): void {
        this._window.detach();
    }
}
