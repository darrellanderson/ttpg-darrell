import { Player } from "@tabletop-playground/api";
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
    expect(Broadcast.lastMessage).toEqual(message);
});

it("broadcastOne", () => {
    new MockPlayer(); // adds to world.getAllPlayers
    const player: Player = new MockPlayer();
    const message: string = "test broadcast one";
    Broadcast.broadcastOne(player, message);
    expect(Broadcast.lastMessage).toEqual(message);
});

it("chatAll", () => {
    new MockPlayer(); // adds to world.getAllPlayers
    const message: string = "test chat all";
    Broadcast.chatAll(message);
    expect(Broadcast.lastMessage).toEqual(message);
});

it("chatOne", () => {
    new MockPlayer(); // adds to world.getAllPlayers
    const player: Player = new MockPlayer();
    const message: string = "test chat one";
    Broadcast.chatOne(player, message);
    expect(Broadcast.lastMessage).toEqual(message);
});
