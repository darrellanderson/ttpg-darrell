import { ChessClock } from "./chess-clock";

it("constructor", () => {
    new ChessClock({
        playerSlotOrder: [1, 2],
    }).destroy();
});
