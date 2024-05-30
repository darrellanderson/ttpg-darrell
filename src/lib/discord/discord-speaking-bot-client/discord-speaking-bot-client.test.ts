import { MockPlayer, mockWorld } from "ttpg-mock";
import { DiscordSpeakingBotClient } from "./discord-speaking-bot-client";

it("decode", () => {
    const base64data: string =
        "eyJpIjoiMTI0NDc0MDA4MTU4ODExMzYwMCIsInQiOiJoMTVGaGxwSXZmdDRDZzVmYjJLc0tLWTRkc3N4V1M5ZmF5RkxJS1hONGZhMEtWb1k3ellTQlZKekUwMFp1SnI3dk0yciIsIm0iOiIxMjQ0NzQwMzMyMTE0MDIyNDQ2In0";
    const data = DiscordSpeakingBotClient._parseBase64Data(base64data);
    expect(data).toEqual({
        messgeId: "1244740332114022446",
        webhookId: "1244740081588113600",
        webhookToken:
            "h15FhlpIvft4Cg5fb2KsKKY4dssxWS9fayFLIKXN4fa0KVoY7zYSBVJzE00ZuJr7vM2r",
    });
});

it("speakerNameToPlayerName", () => {
    mockWorld._reset({
        players: [
            new MockPlayer({ name: "alice" }),
            new MockPlayer({ name: "bob" }),
        ],
    });
    let playerName: string = "";

    playerName = DiscordSpeakingBotClient._getPlayerName("alzze");
    expect(playerName).toEqual("alice");

    playerName = DiscordSpeakingBotClient._getPlayerName("alize");
    expect(playerName).toEqual("alice");

    playerName = DiscordSpeakingBotClient._getPlayerName("bzb");
    expect(playerName).toEqual("bob");
});
