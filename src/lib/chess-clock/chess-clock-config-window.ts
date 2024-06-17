import { ChessClockData } from "./chess-clock-data";
import { ChessClockConfigWidget } from "./chess-clock-config-widget";
import { IWindowWidget, WindowParams } from "../ui/window/window-params";
import { NamespaceId } from "../namespace-id/namespace-id";
import { Window } from "../ui/window/window";

export class ChessClockConfigWindow {
    constructor(
        visibleToPlayerSlot: number,
        chessClockData: ChessClockData,
        onOkClicked: () => void
    ) {
        if (chessClockData.getPlayerOrder().length === 0) {
            throw new Error("No players in chess clock data.");
        }

        const params: WindowParams = {
            title: "Chess Clock Config",
            size: {
                width: 750,
                height: 400,
            },
            screen: {
                anchor: { u: 0.5, v: 0.5 },
                pos: { u: 0.5, v: 0.5 },
            },
            windowWidgetGenerator: (): IWindowWidget => {
                return new ChessClockConfigWidget(chessClockData, onOkClicked);
            },
            diableWarpScreenWorld: true,
        };

        const playerSlots: Array<number> = [visibleToPlayerSlot];
        const persistenceKey: NamespaceId | undefined = undefined;
        new Window(params, playerSlots, persistenceKey).attach();
    }
}
