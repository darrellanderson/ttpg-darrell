import { DiscordWebHook } from "./discord-web-hook";

it("constructor/setters", () => {
    new DiscordWebHook().setId("id").setToken("token");
});
