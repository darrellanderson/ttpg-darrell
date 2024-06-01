import { ChessClockWindow } from "./chess-clock-window";
import { ChessClockData } from "./chess-clock-data";

it("constructor", () => {
    const chessClockData: ChessClockData = new ChessClockData();
    new ChessClockWindow(chessClockData).destroy();
    chessClockData.destroy();
});
