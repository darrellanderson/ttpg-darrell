import { Player, globalEvents, world } from "@tabletop-playground/api";
import { ChessClock } from "./chess-clock";

const player: Player | undefined = world.getAllPlayers()[0];
if (!player) {
    throw new Error("No player found");
}

const playerSlotOrder: Array<number> = [0, 1, 2];
const u: number = 1.1; // width 400, offset 40
const v: number = 1 + 40 / (playerSlotOrder.length * 60); // height 60*count, offset 40

const chessClock: ChessClock = new ChessClock({
    playerSlotOrder,
    getCurrentPlayerSlot: () => 1,
    windowAnchor: { u, v },
    windowPosition: { u: 1, v: 1 },
}); //.openConfigWindow(player);

globalEvents.onChatMessage.add((sender: Player, message: string): void => {
    if (message === "/chess") {
        chessClock.openConfigWindow(sender);
    }
});
