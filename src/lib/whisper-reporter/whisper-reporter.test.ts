import { MockPlayer, mockGlobalEvents } from "ttpg-mock";
import { WhisperReporter } from "./whisper-reporter";

it("init", () => {
    new WhisperReporter().init();
});

it("event", () => {
    const sender = new MockPlayer();
    const recipient = new MockPlayer();
    const bystander = new MockPlayer();
    const msg = "hello";
    mockGlobalEvents._whisperAsPlayer(sender, recipient, msg);
});
