import { Base64 } from "js-base64";
import { TriggerableMulticastDelegate } from "../../event/triggerable-multicast-delegate/triggerable-multicast-delegate";
import { DiscordWebHook } from "../discord-web-hook/discord-web-hook";
import { SpeakingAssign } from "./speaking-assign";
import { SpeakingParser, SpeakingRecord } from "./speaking-parser";
import { SpeakerToPlayer } from "./speaker-to-player";

export class DiscordSpeakingBotClient {
    public readonly onSpeakingDeltas: TriggerableMulticastDelegate<
        (deltas: Map<string, number>, summary: Array<string>) => void
    > = new TriggerableMulticastDelegate<
        (deltas: Map<string, number>, summary: Array<string>) => void
    >();
    public readonly onSpeakingError: TriggerableMulticastDelegate<
        (reason: string) => void
    > = new TriggerableMulticastDelegate<(reason: string) => void>();

    private readonly _speakingAssign: SpeakingAssign = new SpeakingAssign();
    private readonly _speakingParser: SpeakingParser = new SpeakingParser();
    private readonly _webHook: DiscordWebHook;
    private readonly _speakerToPlayer: SpeakerToPlayer = new SpeakerToPlayer();

    private _verbose: boolean = false;
    private _messageId: string | undefined;
    private _intervalHandle: NodeJS.Timeout | undefined;

    private _lastSeconds: number = 0;
    private _lastSpeaker: string = "";

    static _parseBase64Data(base64data: string): {
        webhookId: string;
        webhookToken: string;
        messgeId: string;
    } {
        const json: string = Base64.decode(base64data); // base64url style
        const data = JSON.parse(json);

        const webhookId: string | undefined = data.i;
        const webhookToken: string | undefined = data.t;
        const messgeId: string | undefined = data.m;

        if (!webhookId || !webhookToken || !messgeId) {
            throw new Error("Invalid base64 data");
        }

        return {
            webhookId,
            webhookToken,
            messgeId,
        };
    }

    constructor() {
        this._webHook = new DiscordWebHook();
    }

    setVerbose(verbose: boolean): this {
        this._verbose = verbose;
        return this;
    }

    setCurrentTurn(playerName: string | undefined): this {
        const seconds: number = Date.now() / 1000;
        this._speakingAssign.addChangeTurn(playerName, seconds);
        return this;
    }

    connect(base64data: string): this {
        if (this._verbose) {
            console.log("DiscordSpeakingBotClient.connect");
        }

        const { webhookId, webhookToken, messgeId } =
            DiscordSpeakingBotClient._parseBase64Data(base64data);
        this._webHook.setId(webhookId).setToken(webhookToken);
        this._messageId = messgeId;

        if (this._intervalHandle) {
            clearInterval(this._intervalHandle);
            this._intervalHandle = undefined;
        }
        this._intervalHandle = setInterval(() => {
            this._readAndProcessWebHook();
        }, 5000);

        return this;
    }

    disconnect(): this {
        if (this._verbose) {
            console.log("DiscordSpeakingBotClient.disconnect");
        }

        if (this._intervalHandle) {
            clearInterval(this._intervalHandle);
            this._intervalHandle = undefined;
        }
        return this;
    }

    _readAndProcessWebHook(): void {
        if (this._verbose) {
            console.log("DiscordSpeakingBotClient._readAndProcessWebHook");
        }

        if (!this._messageId) {
            if (this._verbose) {
                console.log(
                    "DiscordSpeakingBotClient._readAndProcessWebHook: no message id"
                );
            }
            return;
        }

        const reject = (reason: string): void => {
            const msg =
                "DiscordSpeakingBotClient._readAndProcessWebHook: reject " +
                reason;
            console.log(msg);
            this.onSpeakingError.trigger(reason);
        };

        this._webHook.get(this._messageId).then((message: string): void => {
            if (this._verbose) {
                console.log(
                    "DiscordSpeakingBotClient._readAndProcessWebHook: read message"
                );
                console.log(`MESSAGE: """\n${message}\n"""`);
            }
            if (message.startsWith("Waiting for data")) {
                return; // nothing to process
            }

            const speakers: Array<SpeakingRecord> =
                this._speakingParser.parse(message);

            // Speakers are in time order.
            for (const speaker of speakers) {
                // Skip old records, already processed.  Allow
                // multiple records with same timestamp.
                if (speaker.endSeconds < this._lastSeconds) {
                    continue;
                }
                // Skip if same speaker as the last processed record.
                if (
                    speaker.endSeconds === this._lastSeconds &&
                    speaker.userId === this._lastSpeaker
                ) {
                    continue;
                }

                // Remember the last processed record.
                this._lastSeconds = speaker.endSeconds;
                this._lastSpeaker = speaker.userId;

                const playerName: string | undefined =
                    this._speakerToPlayer.getPlayerName(speaker.userId) ??
                    speaker.userId;

                const data: {
                    summary: Array<string>;
                    deltas: Map<string, number>;
                } = this._speakingAssign.summarizeSpeakingOverlaps(
                    playerName,
                    speaker.startSeconds,
                    speaker.endSeconds
                );

                if (data.deltas.size === 0) {
                    continue;
                }

                if (this._verbose) {
                    console.log(
                        `DiscordSpeakingBotClient: [\n${data.summary.join("\n")}\n]`
                    );
                }

                this.onSpeakingDeltas.trigger(data.deltas, data.summary);
            }
        }, reject);
    }
}
