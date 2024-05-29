import { SpeakingParser, SpeakingRecord } from "./speaking-parser";

it("parse", () => {
    const summary = ["20 bob 1.0", "30 alice 2.0"].join("\n");
    const parsed: Array<SpeakingRecord> = new SpeakingParser().parse(summary);
    expect(parsed).toEqual([
        { endTimestamp: 20000, startTimestamp: 19000, userId: "bob" },
        { endTimestamp: 30000, startTimestamp: 28000, userId: "alice" },
    ]);
});
