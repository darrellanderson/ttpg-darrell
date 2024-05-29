import { Base64 } from "js-base64";
import { TriggerableMulticastDelegate } from "../../event/triggerable-multicast-delegate/triggerable-multicast-delegate";
import { DiscordWebHook } from "../discord-web-hook/discord-web-hook";
import { SpeakingAssign } from "./speaking-assign";
import { SpeakingParser, SpeakingRecord } from "./speaking-parser";

export class DiscordSpeakingBotClient {
    public readonly onSpeakingDeltas: TriggerableMulticastDelegate<
        (deltas: Map<string, number>, summary: Array<string>) => void
    > = new TriggerableMulticastDelegate<
        (deltas: Map<string, number>, summary: Array<string>) => void
    >();

    private readonly _speakingAssign: SpeakingAssign = new SpeakingAssign();
    private readonly _speakingParser: SpeakingParser = new SpeakingParser();
    private readonly _webHook: DiscordWebHook;

    private _verbose: boolean = false;
    private _messageId: string | undefined;
    private _intervalHandle: NodeJS.Timeout | undefined;

    private _lastTimestamp: number = 0;
    private _lastSpeaker: string = "";

    constructor() {
        this._webHook = new DiscordWebHook();
    }

    setVerbose(verbose: boolean): this {
        this._verbose = verbose;
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

    static _parseBase64Data(base64data: string): {
        webhookId: string;
        webhookToken: string;
        messgeId: string;
    } {
        const json: string = Base64.decode(base64data); // base64url style
        console.log(json);
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
            console.error(
                "DiscordSpeakingBotClient._readAndProcessWebHook: reject",
                reason
            );
        };

        this._webHook.get(this._messageId).then((message: string): void => {
            if (this._verbose) {
                console.log(
                    "DiscordSpeakingBotClient._readAndProcessWebHook: read message"
                );
            }

            const speakers: Array<SpeakingRecord> =
                this._speakingParser.parse(message);

            // Speakers are in time order.
            for (const speaker of speakers) {
                // Skip old records, already processed.  Allow
                // multiple records with same timestamp.
                if (speaker.endTimestamp < this._lastTimestamp) {
                    continue;
                }
                // Skip if same speaker as the last processed record.
                if (
                    speaker.endTimestamp === this._lastTimestamp &&
                    speaker.userId === this._lastSpeaker
                ) {
                    continue;
                }

                // Remember the last processed record.
                this._lastTimestamp = speaker.endTimestamp;
                this._lastSpeaker = speaker.userId;

                const data: {
                    summary: Array<string>;
                    deltas: Map<string, number>;
                } = this._speakingAssign.summarizeSpeakingOverlaps(
                    speaker.userId,
                    speaker.startTimestamp,
                    speaker.endTimestamp
                );

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
