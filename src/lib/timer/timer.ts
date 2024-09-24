import { world } from "@tabletop-playground/api";
import { NamespaceId } from "../namespace-id/namespace-id";

/**
 * Timer state, used to recreate the timer in the streamer overlay.
 */
export type TimerExportType = {
    countdownFromSeconds: number;
    anchorTimestamp: number;
    anchorValue: number;
};

/**
 * Timer, counts up or down.
 */
export class Timer {
    private readonly _nameSpaceId: NamespaceId;

    private _countdownFromSeconds: number = 0;

    // Track based on start time, per-second timeouts can drift.
    private _anchorTimestamp: number = 0;
    private _anchorValue: number = 0;
    private _active: boolean = false;

    private _intervalHandle: NodeJS.Timeout | undefined;

    static getTimeString(overallSeconds: number): string {
        const sign: string = overallSeconds < 0 ? "-" : "";
        overallSeconds = Math.abs(overallSeconds);

        const seconds: number = Math.floor(overallSeconds % 60);
        const minutes: number = Math.floor(overallSeconds / 60) % 60;
        const hours: number = Math.floor(overallSeconds / 3600);

        return [
            sign + hours.toLocaleString().padStart(2, "0"),
            minutes.toLocaleString().padStart(2, "0"),
            seconds.toLocaleString().padStart(2, "0"),
        ].join(":");
    }

    _saveState(): void {
        const json: string = JSON.stringify({
            cfs: this._countdownFromSeconds,
            v: this.getSecondsFromAnchorTimestamp(),
            a: this._active,
        });
        world.setSavedData(json, this._nameSpaceId);
    }

    _loadState(): void {
        const json: string = world.getSavedData(this._nameSpaceId);
        if (json) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data: any = JSON.parse(json);

            this._countdownFromSeconds = data.cfs;
            this._anchorValue = data.v;

            const active: boolean = data.a;
            if (active) {
                this.start();
            }
        }
    }

    constructor(nameSpaceId: NamespaceId) {
        this._nameSpaceId = nameSpaceId;
    }

    getCountdownFromSeconds(): number {
        return this._countdownFromSeconds;
    }

    getExport(): TimerExportType {
        return {
            countdownFromSeconds: this._countdownFromSeconds,
            anchorTimestamp: this._anchorTimestamp,
            anchorValue: this._anchorValue,
        };
    }

    /**
     * Get timer seconds, accounting for countdown active.
     *
     * @returns number
     */
    getSeconds(): number {
        let seconds: number = this.getSecondsFromAnchorTimestamp();
        if (this._countdownFromSeconds > 0) {
            seconds = this._countdownFromSeconds - seconds;
        }
        return seconds;
    }

    /**
     * Get absolute seconds, does not account for countdown.
     *
     * @returns number
     */
    getSecondsFromAnchorTimestamp(): number {
        let seconds: number = this._anchorValue;
        if (this._active) {
            const now: number = Date.now() / 1000;
            const delta: number = now - this._anchorTimestamp;
            seconds = seconds + delta;
        }
        return seconds;
    }

    getTimeString(): string {
        return Timer.getTimeString(this.getSeconds());
    }

    setCountdownFromSeconds(countdownFromSeconds: number): this {
        this._countdownFromSeconds = countdownFromSeconds;
        return this;
    }

    start(overrideValue?: number): this {
        if (overrideValue !== undefined) {
            this._anchorValue = overrideValue;
        }
        this._anchorTimestamp = Date.now() / 1000;
        this._active = true;
        this._saveState();

        if (this._intervalHandle) {
            clearTimeout(this._intervalHandle);
            this._intervalHandle = undefined;
        }
        setTimeout(() => {
            this._saveState;
        }, 1000);

        return this;
    }

    stop(): this {
        this._anchorValue = this.getSecondsFromAnchorTimestamp();
        this._anchorTimestamp = 0;
        this._active = false;

        if (this._intervalHandle) {
            clearTimeout(this._intervalHandle);
            this._intervalHandle = undefined;
        }
        return this;
    }

    toggle(): this {
        if (this._active) {
            this.stop();
        } else {
            this.start();
        }
        return this;
    }
}
