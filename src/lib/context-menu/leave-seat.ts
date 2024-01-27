import { Player, globalEvents, world } from "@tabletop-playground/api";
import { AbstractGlobal } from "../global/abstract-global";

/**
 * Global content menu item to leave seat.  Move to an unused slot, NOT the
 * spectator slot (spectators cannot interact, preventing them from clicking
 * any "take seat" buttons).
 */
export class LeaveSeat implements AbstractGlobal {
    public static readonly CUSTOM_ACTION_NAME = "* Leave seat";
    private static readonly _customActionHandler = (
        player: Player,
        identifier: string
    ) => {
        if (identifier === LeaveSeat.CUSTOM_ACTION_NAME) {
            LeaveSeat.leaveSeat(player);
        }
    };

    public init(): void {
        const tooltip: string = "Switch to non-seat player slot";
        world.removeCustomAction(LeaveSeat.CUSTOM_ACTION_NAME);
        world.addCustomAction(LeaveSeat.CUSTOM_ACTION_NAME, tooltip);

        globalEvents.onCustomAction.remove(LeaveSeat._customActionHandler);
        globalEvents.onCustomAction.add(LeaveSeat._customActionHandler);
    }

    /**
     * Move player to an "unused" slot, meaning no existing player NOR any
     * object's owning player slot.
     *
     * @param player
     */
    static leaveSeat(player: Player): boolean {
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
                    `LeaveSeat: moving "${player.getName()}" to open slot ${i}`
                );
                player.switchSlot(i);
                return true;
            }
        }
        console.log("LeaveSeat: no available player slot");
        return false;
    }
}
