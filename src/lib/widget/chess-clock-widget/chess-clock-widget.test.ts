import { ChessClockData } from "./chess-clock-data";
import { ChessClockWidget } from "./chess-clock-widget";

it("constructor", () => {
    const chessClockData: ChessClockData = new ChessClockData()
        .setPlayerCount(4)
        .setPlayerOrder([0, 1, 2, 3]);

    new ChessClockWidget(chessClockData);

    chessClockData.destroy();
});

it("create/update/destroy", () => {
    const chessClockData: ChessClockData = new ChessClockData()
        .setPlayerCount(4)
        .setPlayerOrder([0, 1, 2, 3]);
    const chessClockWidget: ChessClockWidget = new ChessClockWidget(
        chessClockData
    );
    chessClockWidget.create({
        scale: 1,
        fontSize: 10,
        spacing: 1,
        playerSlot: 7,
    });
    chessClockWidget.update();
    chessClockWidget.destroy();
    chessClockData.destroy();
});
