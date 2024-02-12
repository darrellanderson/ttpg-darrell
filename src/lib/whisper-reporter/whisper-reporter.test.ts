import { MockPlayer, mockGlobalEvents } from "ttpg-mock";
import { WhisperReporter } from "./whisper-reporter";
import { Broadcast } from "../broadcast/broadcast";

it("init", () => {
    new WhisperReporter().init();
});

it("event", () => {
    const sender = new MockPlayer({ name: "src" });
    const recipient = new MockPlayer({ name: "dst" });
    const msg = "hello";
    mockGlobalEvents._whisperAsPlayer(sender, recipient, msg);
    expect(Broadcast.lastMessage).toEqual("whisper from src to dst");
});
