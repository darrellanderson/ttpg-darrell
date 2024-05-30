import { Base64 } from "js-base64";
import { TriggerableMulticastDelegate } from "../../event/triggerable-multicast-delegate/triggerable-multicast-delegate";
import { DiscordWebHook } from "../discord-web-hook/discord-web-hook";
import { SpeakingAssign } from "./speaking-assign";
import { SpeakingParser, SpeakingRecord } from "./speaking-parser";
import { world } from "@tabletop-playground/api";
import { closest } from "fastest-levenshtein";

export class DiscordSpeakingBotClient {
    private static readonly _speakerNameToPlayerName: Map<string, string> =
        new Map();

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

    static _getPlayerName(speakerName: string): string {
        // Get the closest player name.
        const playerNames: Array<string> = world
            .getAllPlayers()
            .map((player) => player.getName());
        const bestName: string = closest(speakerName, playerNames);

        // If the current mapping better?
        const currentName: string | undefined =
            DiscordSpeakingBotClient._speakerNameToPlayerName.get(speakerName);
        if (currentName && currentName !== bestName) {
            const vs: string = closest(speakerName, [currentName, bestName]);
            if (vs === currentName) {
                return currentName; // existing mapping is better
            }
        }

        DiscordSpeakingBotClient._speakerNameToPlayerName.set(
            speakerName,
            bestName
        );
        return bestName;
    }

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

                const playerName: string =
                    DiscordSpeakingBotClient._getPlayerName(speaker.userId);

                const data: {
                    summary: Array<string>;
                    deltas: Map<string, number>;
                } = this._speakingAssign.summarizeSpeakingOverlaps(
                    playerName,
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
