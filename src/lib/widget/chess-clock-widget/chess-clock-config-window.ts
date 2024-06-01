import { world } from "@tabletop-playground/api";
import { ChessClockData } from "./chess-clock-data";
import { IWindowWidget, WindowParams } from "../../ui/window/window-params";
import { NamespaceId } from "../../namespace-id/namespace-id";
import { Window } from "../../ui/window/window";

export class ChessClockConfigWindow {
    constructor(chessClockData: ChessClockData) {
        if (chessClockData.getPlayerOrder().length === 0) {
            throw new Error("No players in chess clock data.");
        }

        const params: WindowParams = {
            title: "Chess Clock Config",
            size: {
                width: 500,
                height: 500,
            },
            screen: {
                anchor: { x: 0.5, y: 0.5 },
                pos: { u: 0.5, v: 0.5 },
            },
            windowWidgetGenerator: (): IWindowWidget => {
                throw new Error("Not implemented yet");
            },
        };

        const playerSlots: Array<number> = world
            .getAllPlayers()
            .filter((player) => player.isHost())
            .map((player) => player.getSlot());
        if (playerSlots.length !== 1) {
            throw new Error(
                `Expected 1 host player, got ${playerSlots.length}`
            );
        }

        chessClockData.broadcast(
            "Opening chess clock config on host's screen."
        );

        const persistenceKey: NamespaceId | undefined = undefined;
        new Window(params, playerSlots, persistenceKey).attach();
    }
}
