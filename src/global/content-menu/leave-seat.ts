import { Player, globalEvents, world } from "@tabletop-playground/api";
import { AbstractGlobal } from "../abstract-global";

export class LeaveSeat implements AbstractGlobal {
  init(): void {
    const actionName: string = "*Leave seat";
    const tooltip: string = "Switch to spectator";
    world.addCustomAction(actionName, tooltip);

    globalEvents.onCustomAction.add((player: Player, identifier: string) => {
      if (identifier === actionName) {
        player.switchSlot(-1);
      }
    });
  }
}
