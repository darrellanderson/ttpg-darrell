import { Color, VerticalBox, Widget } from "@tabletop-playground/api";
import {
    IWindowWidget,
    WindowWidgetParams,
} from "../../ui/window/window-params";
import { TriggerableMulticastDelegate } from "../../event/triggerable-multicast-delegate/triggerable-multicast-delegate";

export class ChessClockData {
    public readonly onActivePlayerChanged: TriggerableMulticastDelegate<
        (playerSlot: number) => void
    > = new TriggerableMulticastDelegate();

    public readonly onPlayerOrderChanged: TriggerableMulticastDelegate<
        (playerSlots: Array<number>) => void
    > = new TriggerableMulticastDelegate();

    private readonly _playerSlotToWidgetColor: Map<number, Color> = new Map();
    private readonly _playerSlotToRemainingTime: Map<number, number> =
        new Map();

    private _playerOrder: Array<number> = [];
    private _timeBudget: number = 0;
    private _activePlayerSlot: number = -1;

    private _intervalHandle: NodeJS.Timeout | undefined = undefined;

    constructor() {
        this.onActivePlayerChanged.add((playerSlot: number): void => {
            this._activePlayerSlot = playerSlot;
        });
        this.onPlayerOrderChanged.add((playerSlots: Array<number>): void => {
            this._playerOrder = playerSlots;
        });

        const intervalDuration: number = 1000;
        this._intervalHandle = setInterval(() => {
            const activePlayerSlot: number = this._activePlayerSlot;
            if (activePlayerSlot === -1) {
                return;
            }
            const remainingTime: number =
                this._playerSlotToRemainingTime.get(activePlayerSlot) ?? 0;
            this._playerSlotToRemainingTime.set(
                activePlayerSlot,
                remainingTime - intervalDuration
            );
        }, intervalDuration) as NodeJS.Timeout;
    }

    destroy(): void {
        if (this._intervalHandle !== undefined) {
            clearInterval(this._intervalHandle);
        }
    }

    getActivePlayerSlot(): number {
        return this._activePlayerSlot;
    }

    getPlayerOrder(): Array<number> {
        return this._playerOrder;
    }

    getTimeRemaining(playerSlot: number): number {
        return this._playerSlotToRemainingTime.get(playerSlot) ?? 0;
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

    resetTimers(): this {
        for (const playerSlot of this._playerSlotToRemainingTime.keys()) {
            this._playerSlotToRemainingTime.set(playerSlot, this._timeBudget);
        }
        return this;
    }
}

export const chessClockData: ChessClockData = new ChessClockData();

export class ChessClockWidget implements IWindowWidget {
    private readonly _activePlayerChanged = (playerSlot: number): void => {
        console.log("active player changed", playerSlot);
    };

    private readonly _playerOrderChanged = (
        playerSlots: Array<number>
    ): void => {
        console.log("player order changed", playerSlots);
    };

    constructor() {}

    create(params: WindowWidgetParams): Widget {
        chessClockData.onActivePlayerChanged.add(this._activePlayerChanged);
        chessClockData.onPlayerOrderChanged.add(this._playerOrderChanged);

        const widget: VerticalBox = new VerticalBox().setChildDistance(
            params.spacing
        );
        return widget;
    }

    destroy(): void {
        chessClockData.onActivePlayerChanged.remove(this._activePlayerChanged);
        chessClockData.onPlayerOrderChanged.remove(this._playerOrderChanged);
    }
}
