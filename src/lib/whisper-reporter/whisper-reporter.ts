import { Player, globalEvents, world } from "@tabletop-playground/api";
import { IGlobal } from "../global/i-global";
import { Broadcast } from "../broadcast/broadcast";

export class WhisperReporter implements IGlobal {
    private readonly _onWhisper = (
        sender: Player,
        recipient: Player,
        message: string
    ): void => {
        const msg: string = `whisper from ${sender.getName()} to ${recipient.getName()}`;
        const color = sender.getPlayerColor();
        for (const player of world.getAllPlayers()) {
            if (player !== sender && player !== recipient) {
                Broadcast.chatOne(player, msg, color);
            }
        }
    };

    init(): void {
        globalEvents.onWhisper.add(this._onWhisper);
    }
}
