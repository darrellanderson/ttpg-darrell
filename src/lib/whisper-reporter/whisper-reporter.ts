import { Player, globalEvents, world } from "@tabletop-playground/api";
import { IGlobal } from "../global/i-global";
import { Broadcast } from "../broadcast/broadcast";
import { locale } from "../locale/locale";
import { WhisperReporterLocaleData } from "./whisper-reporter-locale.data";

locale.inject(WhisperReporterLocaleData);

export class WhisperReporter implements IGlobal {
    private readonly _onWhisper =
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (sender: Player, recipient: Player, message: string): void => {
            const msg: string = locale("whisper-reporter.message", {
                sender: sender.getName(),
                recipient: recipient.getName(),
            });
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
