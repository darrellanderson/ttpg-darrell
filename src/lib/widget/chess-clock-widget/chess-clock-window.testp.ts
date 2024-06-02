import { Color } from "@tabletop-playground/api";
import { DiscordSpeakingBotClient } from "../../discord/discord-speaking-bot-client/discord-speaking-bot-client";
import { ErrorHandler } from "../../error-handler/error-handler";
import { ChessClockData } from "./chess-clock-data";
import { ChessClockWindow } from "./chess-clock-window";
import { ChessClockConfigWindow } from "./chess-clock-config-window";

console.log("ChessClockWindow testp");
new ErrorHandler().init();

const chessClockData = new ChessClockData()
    .setPlayerCount(4)
    .setPlayerOrder([0, 1, 2, 3])
    .setWidgetColor(1, new Color(1, 1, 0))
    .setActivePlayerSlot(1)
    .setTimeBudgetSeconds(1200);
new ChessClockWindow(chessClockData);

const speaking = new DiscordSpeakingBotClient()
    .setVerbose(false)
    .setActivePlayer("player 2");

speaking.onSpeakingDeltas.add(
    (deltas: Map<string, number>, summary: Array<string>): void => {
        chessClockData.applyTimeDetlas(deltas, summary);
    }
);

speaking.onSpeakingError.add((reason: string): void => {
    chessClockData.broadcast(
        "onSpeakingError, disconnecting from Discord: " + reason
    );
    speaking.disconnect();
});

speaking.connect(
    "eyJpIjoiMTI0NjU0MjE1NDM0ODg4ODE1NyIsInQiOiJvb2NGelJHVXBJc1dpMWc3dFNPQVZQRElNUHBtQjhrSTJtOHcycDZZMnQ5UnZpOHo4Zkt0VkNkbXJIbmhoMFZxVWN1ayIsIm0iOiIxMjQ2NTQyMTU1MjAwMDY5NzYzIn0"
);

new ChessClockConfigWindow(chessClockData);
