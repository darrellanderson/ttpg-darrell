export class TimeSpanRecord {
    public readonly start: number;
    public readonly end: number;

    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
    }

    /**
     * Create an identical copy with different start and end values.
     *
     * @param start
     * @param end
     * @returns
     */
    clone(start: number, end: number): TimeSpanRecord {
        return new TimeSpanRecord(start, end);
    }

    toString(): string {
        return `[${this.start}:${this.end}]`;
    }
}

/**
 * Collect non-overlapping time spans.
 * Split will break spans into two at the given time.
 */
export class TimeSpans<T extends TimeSpanRecord> {
    private readonly _spans: Array<T> = [];

    /**
     * Add a new record.
     *
     * @param timeSpanRecord
     * @returns
     */
    add(timeSpanRecord: T): this {
        this._spans.push(timeSpanRecord);
        return this;
    }

    getSpans(): Array<T> {
        return this._spans;
    }

    /**
     * Remove spans ending before the given time.
     *
     * @param time
     * @returns
     */
    evictOld(time: number): this {
        for (let index = 0; index < this._spans.length; index++) {
            const span: TimeSpanRecord | undefined = this._spans[index];
            if (span && span.end < time) {
                this._spans.splice(index, 1);
            }
        }
        return this;
    }

    /**
     * "Rewrite" the end time of the last span.
     * Used to mark the end of a time span that previously had no end.
     *
     * @param time
     * @returns
     */
    clampLast(time: number): this {
        const last: TimeSpanRecord | undefined = this._spans.pop();
        if (last !== undefined) {
            const clone = last.clone(last.start, time);
            this._spans.push(clone as T);
        }
        return this;
    }

    /**
     * Split any span that contains the given time into two at that time.
     *
     * @param time
     * @returns
     */
    split(time: number): this {
        for (let index = 0; index < this._spans.length; index++) {
            const span: TimeSpanRecord | undefined = this._spans[index];
            if (span && span.start < time && time < span.end) {
                const a: T = span.clone(span.start, time) as T;
                const b: T = span.clone(time, span.end) as T;
                this._spans.splice(index, 1, a, b);
            }
        }
        return this;
    }

    /**
     * Get all spans that fully overlap the given time span.
     *
     * @param start
     * @param end
     * @returns
     */
    overlaps(start: number, end: number): Array<T> {
        const result: Array<T> = [];
        for (const span of this._spans) {
            if (span.start >= start && span.end <= end) {
                result.push(span);
            }
        }
        return result;
    }
}
