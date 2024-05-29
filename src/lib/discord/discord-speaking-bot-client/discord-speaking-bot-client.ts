import { TriggerableMulticastDelegate } from "../../event/triggerable-multicast-delegate/triggerable-multicast-delegate";
import { DiscordWebHook } from "../discord-web-hook/discord-web-hook";
import { SpeakingAssign } from "./speaking-assign";
import { SpeakingParser } from "./speaking-parser";

export class DiscordSpeakingBotClient {
    public readonly OnSpeakingDeltas: TriggerableMulticastDelegate<
        (a: number) => void
    > = new TriggerableMulticastDelegate();

    private readonly _speakingAssign: SpeakingAssign = new SpeakingAssign();
    private readonly _speakingParser: SpeakingParser = new SpeakingParser();
    private readonly _webHook: DiscordWebHook;
    private readonly _messageId: string;

    constructor(webookId: string, webhookToken: string, messageId: string) {
        this._webHook = new DiscordWebHook()
            .setId(webookId)
            .setToken(webhookToken);
        this._messageId = messageId;
    }
}
