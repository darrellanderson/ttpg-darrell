import { Color, Player, world } from "@tabletop-playground/api";
import { Broadcast } from "../../broadcast/broadcast";
import { NamespaceId } from "../../namespace-id/namespace-id";
import { DiscordSpeakingBotClient } from "../../discord/discord-speaking-bot-client/discord-speaking-bot-client";

export class ChessClockData {
    private readonly _persistentKey: NamespaceId | undefined;

    private readonly _playerSlotToWidgetColor: Map<number, Color> = new Map();
    private readonly _playerSlotToRemainingSeconds: Map<number, number> =
        new Map();

    private _playerCount: number = -1;
    private _playerOrder: Array<number> = [];
    private _timeBudgetSeconds: number = 0;
    private _activePlayerSlot: number = -1;
    private _intervalHandle: NodeJS.Timeout | undefined = undefined;

    private _discordToken: string | undefined = undefined;
    private _discordSpeaking: DiscordSpeakingBotClient | undefined = undefined;

    // Expose for testing.
    public static readonly INTERVAL_SECONDS = 1;
    public readonly _intervalAssignTimeToActivePlayer = (): void => {
        const activePlayerSlot: number = this._activePlayerSlot;
        if (activePlayerSlot === -1) {
            return;
        }
        const remainingTime: number =
            this._playerSlotToRemainingSeconds.get(activePlayerSlot) ??
            this._timeBudgetSeconds;
        this._playerSlotToRemainingSeconds.set(
            activePlayerSlot,
            remainingTime - ChessClockData.INTERVAL_SECONDS
        );
    };

    constructor(persistenceKey?: NamespaceId) {
        this._persistentKey = persistenceKey;

        this._intervalHandle = setInterval(
            this._intervalAssignTimeToActivePlayer,
            ChessClockData.INTERVAL_SECONDS * 1000
        ) as NodeJS.Timeout;

        this._load();

        if (this._discordToken) {
            this.connectDiscordSpeaking(this._discordToken);
        }
    }

    private _load(): void {
        if (!this._persistentKey) {
            return;
        }
        const json: string = world.getSavedData(this._persistentKey);
        if (!json || json.length === 0) {
            return;
        }

        // Should use Zod for validation...
        const data = JSON.parse(json);
        if (data.rs) {
            for (const [playerSlot, remainingSeconds] of data.rs) {
                this._playerSlotToRemainingSeconds.set(
                    playerSlot,
                    remainingSeconds
                );
            }
        }
        if (data.tb) {
            this._timeBudgetSeconds = data.tb;
        }
        if (data.ap !== undefined) {
            this._activePlayerSlot = data.ap;
        }
        if (data.dt && data.dt.length > 0) {
            this._discordToken = data.dt;
        }
    }

    private _save(): void {
        if (!this._persistentKey) {
            return;
        }

        // Only persist some fields, assume recreation handles most.
        const data = {
            rs: Array.from(this._playerSlotToRemainingSeconds.entries()),
            tb: this._timeBudgetSeconds,
            ap: this._activePlayerSlot,
            dt: this._discordToken ?? "",
        };
        const json: string = JSON.stringify(data);
        world.setSavedData(json, this._persistentKey);
    }

    destroy(): void {
        if (this._intervalHandle !== undefined) {
            clearInterval(this._intervalHandle);
            this._intervalHandle = undefined;
        }
        if (this._discordSpeaking) {
            this._discordSpeaking.disconnect();
            this._discordSpeaking = undefined;
        }
    }

    private readonly _onSpeakingDeltas = (
        deltas: Map<string, number>,
        summary: Array<string>
    ): void => {
        this.applyTimeDetlas(deltas, summary);
    };
    private readonly _onSpeakingError = (reason: string): void => {
        this.broadcast(
            "onSpeakingError, disconnecting from Discord: " + reason
        );
        this.disconnectDiscordSpeaking();
    };

    connectDiscordSpeaking(discordToken: string) {
        this.disconnectDiscordSpeaking();

        this._discordToken = discordToken;
        this._discordSpeaking = new DiscordSpeakingBotClient().setVerbose(true);
        this._discordSpeaking.onSpeakingDeltas.add(this._onSpeakingDeltas);
        this._discordSpeaking.onSpeakingError.add(this._onSpeakingError);
        this._discordSpeaking.connect(discordToken);
    }

    disconnectDiscordSpeaking() {
        if (!this._discordSpeaking) {
            return; // already disconnected
        }
        this._discordSpeaking.onSpeakingDeltas.remove(this._onSpeakingDeltas);
        this._discordSpeaking.onSpeakingError.remove(this._onSpeakingError);
        this._discordSpeaking.disconnect();
        this._discordSpeaking = undefined;
    }

    getActivePlayerSlot(): number {
        return this._activePlayerSlot;
    }

    /**
     * Override the current turn player.
     *
     * @param playerSlot
     * @returns
     */
    setActivePlayerSlot(playerSlot: number): this {
        this._activePlayerSlot = playerSlot;
        this._save();
        return this;
    }

    setCurrentTurn(playerSlot: number): this {
        this.setActivePlayerSlot(playerSlot);
        if (this._discordSpeaking) {
            const playerName: string | undefined = world
                .getPlayerBySlot(playerSlot)
                ?.getName();
            this._discordSpeaking.setCurrentTurn(playerName);
        }
        return this;
    }

    getPlayerCount(): number {
        return this._playerCount;
    }

    setPlayerCount(playerCount: number): this {
        this._playerCount = playerCount;
        this._save();
        return this;
    }

    getPlayerOrder(): Array<number> {
        return this._playerOrder;
    }

    setPlayerOrder(playerOrder: Array<number>): this {
        if (playerOrder.length !== this._playerCount) {
            throw new Error("player count mismatch");
        }
        this._playerOrder = [...playerOrder];
        this._save();
        return this;
    }

    getWidgetColor(playerSlot: number): Color {
        return (
            this._playerSlotToWidgetColor.get(playerSlot) ?? new Color(1, 1, 1)
        );
    }

    setWidgetColor(playerSlot: number, color: Color): this {
        this._playerSlotToWidgetColor.set(playerSlot, color);
        this._save();
        return this;
    }

    getTimeBudgetSeconds(): number {
        return this._timeBudgetSeconds;
    }

    setTimeBudgetSeconds(timeBudgetSeconds: number): this {
        this._timeBudgetSeconds = timeBudgetSeconds;
        this._save();
        return this;
    }

    getTimeRemainingSeconds(playerSlot: number): number {
        return (
            this._playerSlotToRemainingSeconds.get(playerSlot) ??
            this._timeBudgetSeconds
        );
    }

    setTimeRemainingSeconds(playerSlot: number, seconds: number): this {
        this._playerSlotToRemainingSeconds.set(playerSlot, seconds);
        this._save();
        return this;
    }

    resetTimers(): this {
        for (const playerSlot of this._playerSlotToRemainingSeconds.keys()) {
            this._playerSlotToRemainingSeconds.set(
                playerSlot,
                this._timeBudgetSeconds
            );
        }
        return this;
    }

    applyTimeDetlas(deltas: Map<string, number>, summary: Array<string>): this {
        const msg: string = "Chess clock: " + summary.join("\n");
        this.broadcast(msg);

        for (const [playerName, delta] of deltas.entries()) {
            const player: Player | undefined =
                world.getPlayerByName(playerName);
            if (!player) {
                console.log(
                    `ChessClockData.applyTimeDetlas: player not found: ${playerName}`
                );
                continue;
            }
            const playerSlot: number = player.getSlot();

            const remainingTime: number =
                this._playerSlotToRemainingSeconds.get(playerSlot) ??
                this._timeBudgetSeconds;

            console.log(
                `ChessClockData.applyTimeDetlas: ${playerName} ${delta} ${remainingTime}`
            );

            this._playerSlotToRemainingSeconds.set(
                playerSlot,
                remainingTime - delta // counting down, subtract to remove time
            );
        }
        this._save();
        return this;
    }

    broadcast(msg: string): this {
        const msgColor: Color = new Color(1, 0.55, 0, 1);
        Broadcast.chatAll(msg, msgColor);
        return this;
    }
}
