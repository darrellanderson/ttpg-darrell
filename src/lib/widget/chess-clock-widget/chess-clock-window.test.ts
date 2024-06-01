import { ChessClockWindow } from "./chess-clock-window";
import { ChessClockData } from "./chess-clock-data";

it("constructor", () => {
    const chessClockData: ChessClockData = new ChessClockData()
        .setPlayerCount(4)
        .setPlayerOrder([0, 1, 2, 3])
        .setActivePlayerSlot(1)
        .setTimeBudgetSeconds(300);
    new ChessClockWindow(chessClockData).destroy();
    chessClockData.destroy();
});
