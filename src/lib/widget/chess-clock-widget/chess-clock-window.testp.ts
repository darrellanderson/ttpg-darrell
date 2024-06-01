import { DiscordSpeakingBotClient } from "../../discord/discord-speaking-bot-client/discord-speaking-bot-client";
import { ErrorHandler } from "../../error-handler/error-handler";
import { ChessClockData } from "./chess-clock-data";
import { ChessClockWindow } from "./chess-clock-window";

console.log("ChessClockWindow testp");
new ErrorHandler().init();

const chessClockData = new ChessClockData()
    .setPlayerCount(4)
    .setPlayerOrder([0, 1, 2, 3])
    .setActivePlayerSlot(1)
    .setTimeBudgetSeconds(300);
new ChessClockWindow(chessClockData);

const speaking = new DiscordSpeakingBotClient()
    .setVerbose(false)
    .setActivePlayer("player 2")
    .connect(
        "eyJpIjoiMTI0NjU0MjE1NDM0ODg4ODE1NyIsInQiOiJvb2NGelJHVXBJc1dpMWc3dFNPQVZQRElNUHBtQjhrSTJtOHcycDZZMnQ5UnZpOHo4Zkt0VkNkbXJIbmhoMFZxVWN1ayIsIm0iOiIxMjQ2NTQyMTU1MjAwMDY5NzYzIn0"
    );

speaking.onSpeakingDeltas.add(
    (deltas: Map<string, number>, summary: Array<string>): void => {
        chessClockData.applyTimeDetlas(deltas, summary);
    }
);
