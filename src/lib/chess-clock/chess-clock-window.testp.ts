import { Color } from "@tabletop-playground/api";
import { ErrorHandler } from "../error-handler/error-handler";
import { ChessClockData } from "./chess-clock-data";
//import { ChessClockWindow } from "./chess-clock-window";
import { ChessClockConfigWindow } from "./chess-clock-config-window";

console.log("ChessClockWindow testp");
new ErrorHandler().init();

const chessClockData = new ChessClockData()
    .setPlayerCount(4)
    .setPlayerOrder([0, 1, 2, 3])
    .setWidgetColor(1, new Color(1, 1, 0))
    .setCurrentTurn(1)
    .overrideActivePlayerSlot(1)
    .setTimeBudgetSeconds(1200);

//chessClockData.connectDiscordSpeaking(
//    "eyJpIjoiMTI0NjU0MjE1NDM0ODg4ODE1NyIsInQiOiJvb2NGelJHVXBJc1dpMWc3dFNPQVZQRElNUHBtQjhrSTJtOHcycDZZMnQ5UnZpOHo4Zkt0VkNkbXJIbmhoMFZxVWN1ayIsIm0iOiIxMjQ2NTQyMTU1MjAwMDY5NzYzIn0"
//);

//new ChessClockWindow(chessClockData);

// config will create the chess clock window
new ChessClockConfigWindow(chessClockData);
