import { TimeSpanRecord, TimeSpans } from "./time-span";

it("record constructor", () => {
    const record = new TimeSpanRecord(1, 2);
    expect(record.start).toBe(1);
    expect(record.end).toBe(2);
});

it("record clone", () => {
    const record = new TimeSpanRecord(1, 2);
    const clone = record.clone(3, 4);
    expect(clone.start).toBe(3);
    expect(clone.end).toBe(4);
});

it("record toString", () => {
    const record = new TimeSpanRecord(1, 2);
    expect(record.toString()).toBe("[1:2]");
});

it("time spans add/get", () => {
    const spans = new TimeSpans();
    const record = new TimeSpanRecord(1, 2);
    spans.add(record);
    expect(spans.getSpans()).toEqual([record]);
});

it("add at start", () => {
    const spans = new TimeSpans();
    const record = new TimeSpanRecord(0, Infinity);
    spans.add(record);
    expect(spans.getSpans()).toEqual([record]);
    spans.split(0);
    expect(spans.getSpans()).toEqual([record]);
});

it("time spans evict old", () => {
    const spans = new TimeSpans();
    const record1 = new TimeSpanRecord(1, 2);
    const record2 = new TimeSpanRecord(3, 4);
    spans.add(record1).add(record2);
    expect(spans.getSpans()).toEqual([record1, record2]);
    spans.evictOld(3);
    expect(spans.getSpans()).toEqual([record2]);
});

it("time spans clamp last", () => {
    const spans = new TimeSpans();
    const record1 = new TimeSpanRecord(1, 2);
    const record2 = new TimeSpanRecord(3, 4);
    spans.add(record1).add(record2);
    expect(spans.getSpans()).toEqual([record1, record2]);
    spans.clampLast(5);
    expect(spans.getSpans()).toEqual([record1, new TimeSpanRecord(3, 5)]);
});

it("time spans clamp last empty", () => {
    const spans = new TimeSpans();
    spans.clampLast(5);
    expect(spans.getSpans()).toEqual([]);
});

it("clamp last at start", () => {
    const spans = new TimeSpans();
    spans.clampLast(0);
    expect(spans.getSpans()).toEqual([]);
});

it("time spans split", () => {
    const spans = new TimeSpans();
    const record1 = new TimeSpanRecord(1, 3);
    const record2 = new TimeSpanRecord(3, 5);
    spans.add(record1).add(record2);
    expect(spans.getSpans()).toEqual([record1, record2]);
    spans.split(2);
    expect(spans.getSpans()).toEqual([
        new TimeSpanRecord(1, 2),
        new TimeSpanRecord(2, 3),
        record2,
    ]);
    spans.split(2); // already split here
    expect(spans.getSpans()).toEqual([
        new TimeSpanRecord(1, 2),
        new TimeSpanRecord(2, 3),
        record2,
    ]);
    spans.split(4);
    expect(spans.getSpans()).toEqual([
        new TimeSpanRecord(1, 2),
        new TimeSpanRecord(2, 3),
        new TimeSpanRecord(3, 4),
        new TimeSpanRecord(4, 5),
    ]);
});

it("time spans overlap", () => {
    const spans = new TimeSpans();
    const record1 = new TimeSpanRecord(1, 3);
    const record2 = new TimeSpanRecord(3, 5);
    spans.add(record1).add(record2);

    expect(spans.overlaps(1, 3)).toEqual([record1]);
    expect(spans.overlaps(0, 4)).toEqual([record1]);
    expect(spans.overlaps(1, 5)).toEqual([record1, record2]);
    expect(spans.overlaps(0, 6)).toEqual([record1, record2]);
});

it("split at start", () => {
    const spans = new TimeSpans();
    const record = new TimeSpanRecord(0, 1);
    spans.add(record);
    expect(spans.getSpans()).toEqual([new TimeSpanRecord(0, 1)]);

    spans.split(0);
    spans.split(1);
    expect(spans.getSpans()).toEqual([new TimeSpanRecord(0, 1)]);
});
