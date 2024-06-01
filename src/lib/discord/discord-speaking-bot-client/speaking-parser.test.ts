import { SpeakingParser, SpeakingRecord } from "./speaking-parser";

it("parse", () => {
    const summary = ["20 bob 1.0", "30 alice 2.0"].join("\n");
    const parsed: Array<SpeakingRecord> = new SpeakingParser().parse(summary);
    expect(parsed).toEqual([
        { endSeconds: 20, startSeconds: 19, userId: "bob" },
        { endSeconds: 30, startSeconds: 28, userId: "alice" },
    ]);
});
