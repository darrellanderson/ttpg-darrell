import { Color, Player, world } from "@tabletop-playground/api";
import { Broadcast } from "../../broadcast/broadcast";

export class ChessClockData {
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

    constructor() {
        this._intervalHandle = setInterval(
            this._intervalAssignTimeToActivePlayer,
            ChessClockData.INTERVAL_SECONDS * 1000
        ) as NodeJS.Timeout;

        // TODO persistence.
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
        return this;
    }

    getPlayerCount(): number {
        return this._playerCount;
    }

    setPlayerCount(playerCount: number): this {
        this._playerCount = playerCount;
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
        return this;
    }

    getWidgetColor(playerSlot: number): Color {
        return (
            this._playerSlotToWidgetColor.get(playerSlot) ?? new Color(1, 1, 1)
        );
    }

    setWidgetColor(playerSlot: number, color: Color): this {
        this._playerSlotToWidgetColor.set(playerSlot, color);
        return this;
    }

    getTimeBudgetSeconds(): number {
        return this._timeBudgetSeconds;
    }

    setTimeBudgetSeconds(timeBudgetSeconds: number): this {
        this._timeBudgetSeconds = timeBudgetSeconds;
        return this;
    }

    getTimeRemainingSeconds(playerSlot: number): number {
        return (
            this._playerSlotToRemainingSeconds.get(playerSlot) ??
            this._timeBudgetSeconds
        );
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
        return this;
    }

    broadcast(msg: string): this {
        const msgColor: Color = new Color(1, 0.55, 0, 1);
        Broadcast.chatAll(msg, msgColor);
        return this;
    }
}
