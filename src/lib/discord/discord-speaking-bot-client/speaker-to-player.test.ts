import { MockPlayer, mockWorld } from "ttpg-mock";
import { SpeakerToPlayer } from "./speaker-to-player";

it("get", () => {
    const speakerToPlayer = new SpeakerToPlayer();
    let aliceName: string | undefined;
    let bobName: string | undefined;

    aliceName = speakerToPlayer.getPlayerName("alzce");
    bobName = speakerToPlayer.getPlayerName("bzb");
    expect(aliceName).toBeUndefined();
    expect(bobName).toBeUndefined();

    mockWorld._reset({ players: [new MockPlayer({ name: "alice" })] });
    speakerToPlayer.invalidate();

    aliceName = speakerToPlayer.getPlayerName("alzce");
    bobName = speakerToPlayer.getPlayerName("bzb");
    expect(aliceName).toEqual("alice");
    expect(bobName).toBeUndefined();

    mockWorld._reset({
        players: [
            new MockPlayer({ name: "alice" }),
            new MockPlayer({ name: "bob" }),
        ],
    });
    speakerToPlayer.invalidate();

    aliceName = speakerToPlayer.getPlayerName("alzce");
    bobName = speakerToPlayer.getPlayerName("bzb");
    expect(aliceName).toEqual("alice");
    expect(bobName).toEqual("bob");
});
