import { SpeakingAssign, SpeakingAssignRecord } from "./speaking-assign";

it("speaking assign record clone", () => {
    const record = new SpeakingAssignRecord(1, 2, "default");
    record.speakers.push("a", "b");
    expect(record.start).toBe(1);
    expect(record.end).toBe(2);
    expect(record.defaultUser).toBe("default");
    expect(record.speakers).toEqual(["a", "b"]);

    const clone = record.clone(3, 4) as SpeakingAssignRecord;
    expect(clone.start).toBe(3);
    expect(clone.end).toBe(4);
    expect(clone.defaultUser).toBe("default");
    expect(clone.speakers).toEqual(["a", "b"]);
});

it("speaking assign add change turn", () => {
    const assign = new SpeakingAssign();
    expect(assign.getSpans().map((span) => span.toString())).toEqual([
        "[0:Infinity] undefined {}",
    ]);

    assign.addChangeTurn("a", 1);
    expect(assign.getSpans().map((span) => span.toString())).toEqual([
        "[0:1] undefined {}",
        "[1:Infinity] a {}",
    ]);
});

it("speaking assign add speaking", () => {
    const assign = new SpeakingAssign();
    expect(assign.getSpans().map((span) => span.toString())).toEqual([
        "[0:Infinity] undefined {}",
    ]);

    assign._addSpeaking("a", 1, 2);
    expect(assign.getSpans().map((span) => span.toString())).toEqual([
        "[0:1] undefined {}",
        "[1:2] undefined {a}",
        "[2:Infinity] undefined {}",
    ]);

    assign._addSpeaking("b", 1, 3);
    expect(assign.getSpans().map((span) => span.toString())).toEqual([
        "[0:1] undefined {}",
        "[1:2] undefined {a,b}",
        "[2:3] undefined {b}",
        "[3:Infinity] undefined {}",
    ]);

    assign._addSpeaking("c", 2, 3);
    expect(assign.getSpans().map((span) => span.toString())).toEqual([
        "[0:1] undefined {}",
        "[1:2] undefined {a,b}",
        "[2:3] undefined {b,c}",
        "[3:Infinity] undefined {}",
    ]);
});

it("speaking assing summarizeSpeakingOverlaps", () => {
    const assign = new SpeakingAssign();
    assign.addChangeTurn("a", 1);
    assign.addChangeTurn("b", 2);
    expect(assign.getSpans().map((span) => span.toString())).toEqual([
        "[0:1] undefined {}",
        "[1:2] a {}",
        "[2:Infinity] b {}",
    ]);

    const one = assign.summarizeSpeakingOverlaps("c", 0, 1);
    expect(assign.getSpans().map((span) => span.toString())).toEqual([
        "[0:1] undefined {c}",
        "[1:2] a {}",
        "[2:Infinity] b {}",
    ]);
    expect(one.summary).toEqual(["c spoke 1.0 seconds"]);
    expect([...one.deltas.entries()].sort()).toEqual([]);

    const two = assign.summarizeSpeakingOverlaps("d", 1, 3);
    expect(assign.getSpans().map((span) => span.toString())).toEqual([
        "[0:1] undefined {c}",
        "[1:2] a {d}",
        "[2:3] b {d}",
        "[3:Infinity] b {}",
    ]);
    expect(two.summary).toEqual([
        "d spoke 2.0 seconds",
        "[0.0:1.0] during a's turn, reassigning time",
        "[1.0:2.0] during b's turn, reassigning time",
    ]);
    expect(JSON.stringify(two.deltas)).toEqual("{}");
    expect([...two.deltas.entries()].sort()).toEqual([
        ["a", -1],
        ["b", -1],
        ["d", 2],
    ]);

    const three = assign.summarizeSpeakingOverlaps("e", 0, 5);
    expect(assign.getSpans().map((span) => span.toString())).toEqual([
        "[0:1] undefined {c,e}",
        "[1:2] a {d,e}",
        "[2:3] b {d,e}",
        "[3:5] b {e}",
        "[5:Infinity] b {}",
    ]);
    expect(three.summary).toEqual([
        "e spoke 5.0 seconds",
        "[1.0:2.0] over d; splitting cost with them",
        "[2.0:3.0] over d; splitting cost with them",
        "[3.0:5.0] during b's turn, reassigning time",
    ]);
    expect([...three.deltas.entries()].sort()).toEqual([
        ["b", -2],
        ["d", -1],
        ["e", 3],
    ]);
});

it("simpler speaking over", () => {
    const assign = new SpeakingAssign();
    expect(assign.getSpans().map((span) => span.toString())).toEqual([
        "[0:Infinity] undefined {}",
    ]);

    assign.addChangeTurn("a", 1);
    expect(assign.getSpans().map((span) => span.toString())).toEqual([
        "[0:1] undefined {}",
        "[1:Infinity] a {}",
    ]);

    const one = assign.summarizeSpeakingOverlaps("b", 1, 2);
    expect(assign.getSpans().map((span) => span.toString())).toEqual([
        "[0:1] undefined {}",
        "[1:2] a {b}",
        "[2:Infinity] a {}",
    ]);
    expect([...one.deltas.entries()].sort()).toEqual([
        ["a", -1],
        ["b", 1],
    ]);

    const two = assign.summarizeSpeakingOverlaps("c", 1, 2);
    expect(assign.getSpans().map((span) => span.toString())).toEqual([
        "[0:1] undefined {}",
        "[1:2] a {b,c}",
        "[2:Infinity] a {}",
    ]);
    expect([...two.deltas.entries()].sort()).toEqual([
        ["b", -0.5],
        ["c", 0.5],
    ]);
});
