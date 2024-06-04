import { Player, world } from "@tabletop-playground/api";
import { ChessClock } from "./chess-clock";

const player: Player | undefined = world.getAllPlayers()[0];
if (!player) {
    throw new Error("No player found");
}

new ChessClock({
    playerSlotOrder: [0, 1, 2],
    getCurrentPlayerSlot: () => 1,
    windowAnchor: { u: 1, v: 0 },
    windowPosition: { u: 0.9, v: 0.1 },
}).openConfigWindow(player);
