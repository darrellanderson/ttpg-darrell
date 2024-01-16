import { Player, globalEvents, world } from "@tabletop-playground/api";
import { AbstractGlobal } from "../global/abstract-global";

/**
 * Global content menu item to leave seat.  Move to an unused slot, NOT the
 * spectator slot (spectators cannot interact, preventing them from clicking
 * any "take seat" buttons).
 */
export class LeaveSeat implements AbstractGlobal {
    public init(): void {
        const actionName: string = "*Leave seat";
        const tooltip: string = "Switch to non-seat player slot";
        world.addCustomAction(actionName, tooltip);

        globalEvents.onCustomAction.add(
            (player: Player, identifier: string) => {
                if (identifier === actionName) {
                    LeaveSeat.leaveSeat(player);
                }
            }
        );
    }

    /**
     * Move player to an "unused" slot, meaning no existing player NOR any
     * object's owning player slot.
     *
     * @param clickingPlayer
     */
    static leaveSeat(clickingPlayer: Player) {
        const busy = new Set();
        for (const player of world.getAllPlayers()) {
            busy.add(player.getSlot());
        }
        const skipContained = false;
        for (const obj of world.getAllObjects(skipContained)) {
            busy.add(obj.getOwningPlayerSlot());
        }
        for (let i = 0; i < 20; i++) {
            if (!busy.has(i)) {
                console.log(
                    `LeaveSeat: moving "${clickingPlayer.getName()}" to open slot ${i}`
                );
                clickingPlayer.switchSlot(i);
                return;
            }
        }
        console.log("LeaveSeat: no available player slot");
    }
}
