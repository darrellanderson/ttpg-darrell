import { Color, GameWorld, Player, world } from "@tabletop-playground/api";

export class Broadcast {
    public static get ERROR(): Color {
        return new Color(1, 0, 0, 1);
    }

    public static lastMessage: string = "";

    public static broadcastAll(
        message: string,
        color?: Color | [r: number, g: number, b: number, a: number]
    ) {
        if (GameWorld.getExecutionReason() !== "unittest") {
            console.log(`Broadcast.broadcastAll: ${message}`);
        }
        for (const player of world.getAllPlayers()) {
            player.showMessage(message);
            player.sendChatMessage(message, color ?? [1, 1, 1, 1]);
        }
        Broadcast.lastMessage = message;
    }

    public static broadcastOne(
        player: Player,
        message: string,
        color?: Color | [r: number, g: number, b: number, a: number]
    ) {
        if (GameWorld.getExecutionReason() !== "unittest") {
            console.log(`Broadcast.broadcastOne: ${message}`);
        }
        player.showMessage(message);
        player.sendChatMessage(message, color ?? [1, 1, 1, 1]);
        Broadcast.lastMessage = message;
    }

    public static chatAll(
        message: string,
        color?: Color | [r: number, g: number, b: number, a: number]
    ) {
        if (GameWorld.getExecutionReason() !== "unittest") {
            console.log(`Broadcast.chatAll: ${message}`);
        }
        for (const player of world.getAllPlayers()) {
            player.sendChatMessage(message, color ?? [1, 1, 1, 1]);
        }
        Broadcast.lastMessage = message;
    }

    public static chatOne(
        player: Player,
        message: string,
        color?: Color | [r: number, g: number, b: number, a: number]
    ) {
        if (GameWorld.getExecutionReason() !== "unittest") {
            console.log(`Broadcast.chatOne (${player.getName()}): ${message}`);
        }
        player.sendChatMessage(message, color ?? [1, 1, 1, 1]);
        Broadcast.lastMessage = message;
    }
}
