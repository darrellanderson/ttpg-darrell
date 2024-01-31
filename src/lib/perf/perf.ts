import { globalEvents } from "@tabletop-playground/api";
import { IGlobal } from "../global/i-global";

export type PerfReport = {
    median: number;
    mean: number;
    scrubbed: number;
    stdDev: number;
    fps: number;
};

export class Perf implements IGlobal {
    private static _instance: Perf | undefined;

    private readonly _windowFrameSecs: number[];
    private _nextWindowFrameMsecsIndex: number = 0;

    private readonly _windowFps: number[] = Array(60).fill(0);
    private _nextWindowFpsIndex: number = 0;
    private _lastFpsUpdateSecond: number = -1;

    private _onTickHandler = (prevTickDurationSecs: number) => {
        this._windowFrameSecs[this._nextWindowFrameMsecsIndex] =
            prevTickDurationSecs;
        this._nextWindowFrameMsecsIndex =
            (this._nextWindowFrameMsecsIndex + 1) %
            this._windowFrameSecs.length;

        // Store one minute of FPS values, as per-second intervals.
        const nowSeconds = Math.floor(Date.now() / 1000);
        if (nowSeconds !== this._lastFpsUpdateSecond) {
            const fps = this.getReport().fps;
            this._windowFps[this._nextWindowFpsIndex] = fps;
            this._nextWindowFpsIndex =
                (this._nextWindowFpsIndex + 1) % this._windowFps.length;
        }
    };

    public static getInstance(): Perf {
        if (!Perf._instance) {
            Perf._instance = new Perf();
        }
        return Perf._instance;
    }

    constructor(windowSize: number = 50) {
        this._windowFrameSecs = Array(windowSize).fill(-1);
        globalEvents.onTick.add(this._onTickHandler);
    }

    init(): void {
        Perf.getInstance();
    }

    destroy(): void {
        globalEvents.onTick.remove(this._onTickHandler);
    }

    getReport(): PerfReport {
        const msecs: number[] = this._windowFrameSecs
            .filter((seconds) => seconds > 0)
            .map((seconds) => seconds * 1000);
        if (msecs.length === 0) {
            msecs.push(0);
        }
        const n: number = msecs.length;
        const mean: number = msecs.reduce((a, b) => a + b, 0) / n;
        const stdDev: number = Math.sqrt(
            msecs.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
        );
        const sorted: number[] = msecs.sort((a, b) => b - a);
        const median: number = sorted[Math.floor(sorted.length / 2)];

        // Mean of values within 3x stdDev (in the unlikely event of none,
        // use the regular mean).
        const tolerance: number = stdDev * 3;
        const scrubbedArray: number[] = msecs.filter(
            (x) => x > mean - tolerance && x < mean + tolerance
        );
        const scrubbed: number =
            scrubbedArray.length > 0
                ? scrubbedArray.reduce((a, b) => a + b, 0) /
                  scrubbedArray.length
                : mean;

        const fps: number = scrubbed > 0 ? 1000 / scrubbed : 0;

        // Round to 3 decimal places for cleaner log / json.
        return {
            median: Math.floor(median * 1000) / 1000,
            mean: Math.floor(mean * 1000) / 1000,
            scrubbed: Math.floor(scrubbed * 1000) / 1000,
            stdDev: Math.floor(stdDev * 1000) / 1000,
            fps: Math.floor(fps * 1000) / 1000,
        };
    }

    getReportStr(): string {
        const report: PerfReport = this.getReport();
        const median = report.median.toFixed(1);
        const mean = report.mean.toFixed(1);
        const scrubbed = report.scrubbed.toFixed(1);
        const stdDev = report.stdDev.toFixed(2);
        const fps = report.fps.toFixed(1);
        return `frame msecs: median=${median} mean=${mean} scrubbed=${scrubbed} stdDev=${stdDev} [${fps}]`;
    }

    /**
     * Get per-second FPS for the last minute, in time order.
     *
     * @returns
     */
    getFpsHistory(): number[] {
        return [
            ...this._windowFps.slice(this._nextWindowFpsIndex),
            ...this._windowFps.slice(0, this._nextWindowFpsIndex),
        ];
    }
}
