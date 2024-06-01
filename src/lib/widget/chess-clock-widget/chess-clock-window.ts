import { NamespaceId } from "../../namespace-id/namespace-id";
import { Window } from "../../ui/window/window";
import { IWindowWidget, WindowParams } from "../../ui/window/window-params";
import { ChessClockData } from "./chess-clock-data";

/**
 * Add the chess clock as a window.
 */
export class ChessClockWindow {
    private readonly _chessClockData: ChessClockData;
    private readonly _window: Window;

    constructor(chessClockData: ChessClockData) {
        this._chessClockData = chessClockData;

        const params: WindowParams = {
            size: {
                width: 0,
                height: 0,
            },
            windowWidgetGenerator: function (): IWindowWidget {
                throw new Error("Function not implemented.");
            },
        };
        const playerSlots: Array<number> =
            this._chessClockData.getPlayerOrder();
        const persistenceKey: NamespaceId | undefined = undefined;
        this._window = new Window(params, playerSlots, persistenceKey).attach();
    }

    destroy(): void {
        this._window.detach();
    }
}
