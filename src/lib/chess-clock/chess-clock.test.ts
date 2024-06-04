import { ChessClock } from "./chess-clock";

it("constructor", () => {
    new ChessClock({
        playerSlotOrder: [1, 2],
        activePlayerSlot: 1,
    }).destroy();
});
