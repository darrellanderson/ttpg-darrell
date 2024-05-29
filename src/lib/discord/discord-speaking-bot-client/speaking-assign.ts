import { TimeSpanRecord, TimeSpans } from "../../time-span/time-span";

export class SpeakingAssignRecord extends TimeSpanRecord {
    public readonly defaultUser: string | undefined;
    public readonly speakers: Array<string> = [];

    constructor(start: number, end: number, defaultUser: string | undefined) {
        super(start, end);
        this.defaultUser = defaultUser;
    }

    clone(start: number, end: number): TimeSpanRecord {
        const clone = new SpeakingAssignRecord(start, end, this.defaultUser);
        clone.speakers.push(...this.speakers);
        return clone;
    }

    toString(): string {
        return `[${this.start}:${this.end}] ${
            this.defaultUser
        } {${this.speakers.join(",")}}`;
    }
}

/**
 * Spans get assigned a default user (the current turn, may be undefined).
 * Speaking events carve up and add speakers to spans.
 */
export class SpeakingAssign {
    private readonly _spans: TimeSpans<SpeakingAssignRecord> = new TimeSpans();

    constructor() {
        this._spans.add(new SpeakingAssignRecord(0, Infinity, undefined));
    }

    getSpans(): Array<SpeakingAssignRecord> {
        return this._spans.getSpans();
    }

    addChangeTurn(name: string | undefined, timestamp: number): this {
        this._spans.clampLast(timestamp);
        this._spans.add(new SpeakingAssignRecord(timestamp, Infinity, name));
        return this;
    }

    _addSpeaking(
        name: string,
        start: number,
        end: number
    ): Array<SpeakingAssignRecord> {
        const result: Array<SpeakingAssignRecord> = [];

        // Split any existing spans at the speaking start/end times.
        this._spans.split(start);
        this._spans.split(end);

        // Add this new speaker to the matching spans.
        const overlaps: Array<SpeakingAssignRecord> = this._spans.overlaps(
            start,
            end
        );
        for (const overlap of overlaps) {
            if (overlap.defaultUser === name) {
                continue; // do not count the default user as a speaker
            }
            if (overlap.speakers.includes(name)) {
                continue; // do not count the same speaker twice
            }
            overlap.speakers.push(name);
            result.push(overlap);
        }
        return result;
    }

    summarizeSpeakingOverlaps(
        name: string,
        start: number,
        end: number
    ): {
        summary: Array<string>;
        deltas: Map<string, number>;
    } {
        const summary: Array<string> = [];
        const deltas: Map<string, number> = new Map();

        const duration = end - start;
        summary.push(`${name} spoke ${duration.toFixed(1)} seconds`);

        const records: Array<SpeakingAssignRecord> = this._addSpeaking(
            name,
            start,
            end
        );

        for (const record of records) {
            if (!record.defaultUser) {
                continue;
            }

            const offsetStart = record.start - start;
            const offsetEnd = record.end - start;
            const prefix = `[${offsetStart.toFixed(1)}:${offsetEnd.toFixed(1)}]`;
            const duration = record.end - record.start;
            const speakerCount = record.speakers.length;

            if (speakerCount === 1) {
                summary.push(
                    `${prefix} during ${record.defaultUser}'s turn, reassigning time`
                );
                const src: string = record.defaultUser;
                const srcTime: number = deltas.get(src) ?? 0;
                const dst: string = name;
                const dstTime: number = deltas.get(dst) ?? 0;
                deltas.set(src, srcTime - duration);
                deltas.set(dst, dstTime + duration);
            }

            if (speakerCount > 1) {
                const others = record.speakers
                    .filter((s) => s !== name)
                    .join(", ");
                summary.push(
                    `${prefix} over ${others}; splitting cost with them`
                );

                // Last entry of speakers is the new one, not yet charged.
                const oldShare = duration / (speakerCount - 1);
                const newShare = duration / speakerCount;
                for (const speaker of record.speakers) {
                    let delta: number = deltas.get(speaker) ?? 0;
                    if (speaker !== name) {
                        delta -= oldShare;
                    }
                    delta += newShare;
                    deltas.set(speaker, delta);
                }
            }
        }
        return { summary, deltas };
    }
}
