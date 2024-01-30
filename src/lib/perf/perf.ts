import { globalEvents } from "@tabletop-playground/api";

export type PerfReport = {
    median: number;
    mean: number;
    scrubbed: number;
    stdDev: number;
    fps: number;
};

export class Perf {
    private readonly _window: number[];
    private _windowIndex: number = 0;
    private _onTickHandler = (prevTickDurationSecs: number) => {
        this._window[this._windowIndex] = prevTickDurationSecs;
        this._windowIndex = (this._windowIndex + 1) % this._window.length;
    };

    constructor(windowSize: number = 100) {
        this._window = Array(windowSize).fill(-1);
        globalEvents.onTick.add(this._onTickHandler);
    }

    destroy() {
        globalEvents.onTick.remove(this._onTickHandler);
    }

    getReport(): PerfReport {
        const msecs: number[] = this._window
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

        // Mean of values within 3x stdDev
        const tolerance: number = stdDev * 3;
        const scrubbedArray: number[] = msecs.filter(
            (x) => x > mean - tolerance && x < mean + tolerance
        );
        const scrubbed: number =
            scrubbedArray.reduce((a, b) => a + b, 0) /
            Math.max(scrubbedArray.length, 0);

        const fps: number = 1000 / scrubbed;

        // Round to 3 decimal places for cleaner log / json.
        return {
            median: Math.floor(median * 1000) / 1000,
            mean: Math.floor(mean * 1000) / 1000,
            scrubbed: Math.floor(scrubbed * 1000) / 1000,
            stdDev: Math.floor(stdDev * 1000) / 1000,
            fps: Math.floor(fps * 1000) / 1000,
        };
    }

    getReportStr() {
        const report: PerfReport = this.getReport();
        const median = report.median.toFixed(1);
        const mean = report.mean.toFixed(1);
        const scrubbed = report.scrubbed.toFixed(1);
        const stdDev = report.stdDev.toFixed(2);
        const fps = report.fps.toFixed(1);
        return `frame msecs: median=${median} mean=${mean} scrubbed=${scrubbed} stdDev=${stdDev} [${fps}]`;
    }
}
