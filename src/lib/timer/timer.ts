import { world } from "@tabletop-playground/api";
import { NamespaceId } from "../namespace-id/namespace-id";
import { TriggerableMulticastDelegate } from "../event/triggerable-multicast-delegate/triggerable-multicast-delegate";

/**
 * Timer state, used to recreate the timer in the streamer overlay.
 */
export type TimerExportType = {
    anchorTimestamp: number;
    anchorValue: number;
    direction: -1 | 0 | 1;
};

export class TimerBreakdown {
    private _sign: -1 | 1;
    private _hours: number;
    private _minutes: number;
    private _seconds: number;

    constructor(overallSeconds: number) {
        this._sign = overallSeconds < 0 ? -1 : 1;
        overallSeconds = Math.abs(overallSeconds);
        this._seconds = Math.floor(overallSeconds % 60);
        this._minutes = Math.floor(overallSeconds / 60) % 60;
        this._hours = Math.floor(overallSeconds / 3600);
    }

    decrHours(): this {
        this._hours = (this._hours + 99) % 100;
        return this;
    }

    decrMinutes(): this {
        this._minutes = (this._minutes + 59) % 60;
        return this;
    }

    decrSeconds(): this {
        this._seconds = (this._seconds + 59) % 60;
        return this;
    }

    getHours(): number {
        return this._hours;
    }

    getMinutes(): number {
        return this._minutes;
    }

    getSeconds(): number {
        return this._seconds;
    }

    getOverallSeconds(): number {
        return (
            this._sign *
            (this._seconds + this._minutes * 60 + this._hours * 3600)
        );
    }

    incrHours(): this {
        this._hours = (this._hours + 1) % 100;
        return this;
    }

    incrMinutes(): this {
        this._minutes = (this._minutes + 1) % 60;
        return this;
    }

    incrSeconds(): this {
        this._seconds = (this._seconds + 1) % 60;
        return this;
    }

    toTimeString(): string {
        return (
            (this._sign < 0 ? "-" : "") +
            [
                this._hours.toLocaleString().padStart(2, "0"),
                this._minutes.toLocaleString().padStart(2, "0"),
                this._seconds.toLocaleString().padStart(2, "0"),
            ].join(" : ")
        );
    }
}

/**
 * Timer, counts up or down.
 */
export class Timer {
    public readonly onTimerExpired: TriggerableMulticastDelegate<() => void> =
        new TriggerableMulticastDelegate();
    public readonly onTimerTick: TriggerableMulticastDelegate<() => void> =
        new TriggerableMulticastDelegate();

    private readonly _nameSpaceId: NamespaceId;

    // Track based on start time, per-second timeouts can drift.
    private _anchorTimestamp: number = 0;
    private _anchorValue: number = 0;
    private _direction: -1 | 0 | 1 = 1;
    private _active: boolean = false;

    private _intervalHandle: NodeJS.Timeout | undefined;

    _saveState(): void {
        const json: string = JSON.stringify({
            v: this.getSeconds(),
            d: this._direction,
            a: this._active,
        });
        world.setSavedData(json, this._nameSpaceId);
    }

    _loadState(): void {
        const json: string = world.getSavedData(this._nameSpaceId);
        if (json) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data: any = JSON.parse(json);

            const value: number = data.v;
            const direction: -1 | 0 | 1 = data.d;
            const active: boolean = data.a;

            if (active) {
                this.start(value, direction);
            }
        }
    }

    constructor(nameSpaceId: NamespaceId) {
        this._nameSpaceId = nameSpaceId;
    }

    export(): TimerExportType {
        return {
            anchorTimestamp: this._anchorTimestamp,
            anchorValue: this._anchorValue,
            direction: this._active ? this._direction : 0,
        };
    }

    getDirection(): -1 | 0 | 1 {
        return this._direction;
    }

    /**
     * Get absolute seconds, does not account for countdown.
     *
     * @returns number
     */
    getSeconds(): number {
        let seconds: number = this._anchorValue;
        if (this._active) {
            const now: number = Date.now() / 1000;
            const delta: number = now - this._anchorTimestamp;
            seconds += delta * this._direction;
        }
        return seconds;
    }

    getTimeString(): string {
        return new TimerBreakdown(this.getSeconds()).toTimeString();
    }

    start(value: number, direction: -1 | 0 | 1): this {
        this._anchorValue = value;
        this._anchorTimestamp = Date.now() / 1000;
        this._direction = direction;
        this._active = true;
        this._saveState();

        if (this._intervalHandle) {
            clearInterval(this._intervalHandle);
            this._intervalHandle = undefined;
        }

        let lastValue: number = this.getSeconds();
        this._intervalHandle = setInterval(() => {
            this._saveState();
            this.onTimerTick.trigger();

            if (this._direction === -1) {
                const newValue: number = this.getSeconds();

                if (lastValue > 0 && newValue <= 0) {
                    // Timer reached zero.
                    this.onTimerExpired.trigger();
                }

                lastValue = newValue;
            }
        }, 500);

        return this;
    }

    stop(): this {
        // Store currect value (keep direction).
        this._anchorValue = this.getSeconds();
        this._anchorTimestamp = 0;
        this._active = false;

        if (this._intervalHandle) {
            clearInterval(this._intervalHandle);
            this._intervalHandle = undefined;
        }
        return this;
    }

    toggle(): this {
        if (this._active) {
            this.stop();
        } else {
            const value: number = this.getSeconds();
            const direction: -1 | 0 | 1 = this._direction;
            this.start(value, direction);
        }
        return this;
    }
}
