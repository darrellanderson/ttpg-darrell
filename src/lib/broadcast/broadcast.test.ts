import { GameWorld, Player } from "@tabletop-playground/api";
import { MockPlayer } from "ttpg-mock";
import { Broadcast } from "./broadcast";

it("ERROR", () => {
    const color = Broadcast.ERROR;
    expect(color.toHex()).toEqual("FF0000FF");
});

it("broadcastAll", () => {
    new MockPlayer(); // adds to world.getAllPlayers
    const message: string = "test broadcast all";
    Broadcast.broadcastAll(message);
    Broadcast.broadcastAll(message, [1, 1, 1, 1]);
    expect(Broadcast.lastMessage).toEqual(message);
});

it("broadcastOne", () => {
    new MockPlayer(); // adds to world.getAllPlayers
    const player: Player = new MockPlayer();
    const message: string = "test broadcast one";
    Broadcast.broadcastOne(player, message);
    Broadcast.broadcastOne(player, message, [1, 1, 1, 1]);
    expect(Broadcast.lastMessage).toEqual(message);
});

it("chatAll", () => {
    new MockPlayer(); // adds to world.getAllPlayers
    const message: string = "test chat all";
    Broadcast.chatAll(message);
    Broadcast.chatAll(message, [1, 1, 1, 1]);
    expect(Broadcast.lastMessage).toEqual(message);
});

it("chatOne", () => {
    new MockPlayer(); // adds to world.getAllPlayers
    const player: Player = new MockPlayer();
    const message: string = "test chat one";
    Broadcast.chatOne(player, message);
    Broadcast.chatOne(player, message, [1, 1, 1, 1]);
    expect(Broadcast.lastMessage).toEqual(message);
});

it("suppress unittest, fake console", () => {
    const player: Player = new MockPlayer();
    jest.spyOn(GameWorld, "getExecutionReason").mockImplementation(() => {
        return "other";
    });
    jest.spyOn(console, "log").mockImplementation(() => {});
    Broadcast.broadcastAll("");
    Broadcast.broadcastOne(player, "");
    Broadcast.chatAll("");
    Broadcast.chatOne(player, "");
    jest.restoreAllMocks();
});
