import { Color, GameWorld, Player, world } from "@tabletop-playground/api";

/**
 * Send messages to one or all players.
 */
export class Broadcast {
    public static get ERROR(): Color {
        return new Color(1, 0, 0, 1);
    }

    public static lastMessage: string = "";

    /**
     * Sends a message to all players, appears on screen and in chat.
     *
     * @param {string} message - The message to send.
     * @param {Color | [number, number, number, number]} [color] - The color of the message.
     */
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

    /**
     * Sends a message to one player, appears on screen and in chat.
     *
     * @param {Player} player - The player to send the message to.
     * @param {string} message - The message to send.
     * @param {Color | [number, number, number, number]} [color] - The color of the message.
     */
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

    /**
     * Sends a chat message to all players.
     *
     * @param {string} message - The message to send.
     * @param {Color | [number, number, number, number]} [color] - The color of the message.
     */
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

    /**
     * Sends a chat message to one player.
     *
     * @param {Player} player - The player to send the message to.
     * @param {string} message - The message to send.
     * @param {Color | [number, number, number, number]} [color] - The color of the message.
     */
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
