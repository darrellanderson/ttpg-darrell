import { Color } from "@tabletop-playground/api";

export class ChessClockData {
    private readonly _playerSlotToWidgetColor: Map<number, Color> = new Map();
    private readonly _playerSlotToRemainingTime: Map<number, number> =
        new Map();

    private _playerOrder: Array<number> = [];
    private _timeBudget: number = 0;
    private _activePlayerSlot: number = -1;
    private _intervalHandle: NodeJS.Timeout | undefined = undefined;

    // Expose for testing.
    public static readonly INTERVAL_DURATION_ASSIGN_TIME = 1000;
    public readonly _intervalAssignTimeToActivePlayer = (): void => {
        const activePlayerSlot: number = this._activePlayerSlot;
        if (activePlayerSlot === -1) {
            return;
        }
        const remainingTime: number =
            this._playerSlotToRemainingTime.get(activePlayerSlot) ??
            this._timeBudget;
        this._playerSlotToRemainingTime.set(
            activePlayerSlot,
            remainingTime - ChessClockData.INTERVAL_DURATION_ASSIGN_TIME
        );
    };

    constructor() {
        this._intervalHandle = setInterval(
            this._intervalAssignTimeToActivePlayer,
            ChessClockData.INTERVAL_DURATION_ASSIGN_TIME
        ) as NodeJS.Timeout;
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

    getPlayerOrder(): Array<number> {
        return this._playerOrder;
    }

    setPlayerOrder(playerOrder: Array<number>): this {
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

    getTimeBudget(): number {
        return this._timeBudget;
    }

    setTimeBudget(timeBudget: number): this {
        this._timeBudget = timeBudget;
        return this;
    }

    getTimeRemaining(playerSlot: number): number {
        return (
            this._playerSlotToRemainingTime.get(playerSlot) ?? this._timeBudget
        );
    }

    resetTimers(): this {
        for (const playerSlot of this._playerSlotToRemainingTime.keys()) {
            this._playerSlotToRemainingTime.set(playerSlot, this._timeBudget);
        }
        return this;
    }
}
