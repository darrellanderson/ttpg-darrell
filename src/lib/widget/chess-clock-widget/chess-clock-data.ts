import { Color, Player, world } from "@tabletop-playground/api";
import { Broadcast } from "../../broadcast/broadcast";
import { NamespaceId } from "../../namespace-id/namespace-id";

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
        };
        const json: string = JSON.stringify(data);
        world.setSavedData(json, this._persistentKey);
    }

    destroy(): void {
        if (this._intervalHandle !== undefined) {
            clearInterval(this._intervalHandle);
            this._intervalHandle = undefined;
        }
    }

    getActivePlayerSlot(): number {
        return this._activePlayerSlot;
    }

    setActivePlayerSlot(playerSlot: number): this {
        this._activePlayerSlot = playerSlot;
        this._save();
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
