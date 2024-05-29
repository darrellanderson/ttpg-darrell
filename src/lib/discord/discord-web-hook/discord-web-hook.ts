import { fetch } from "@tabletop-playground/api";

/**
 * Create, read, and delete discord messages using a webhook.
 * Only needs the "fetch" API, suitable for use in Tabletop Playground.
 */
export class DiscordWebHook {
    private readonly URL: string = "https://discord.com/api/webhooks"; // +id/token

    private _id: string = "";
    private _token: string = "";

    setId(id: string): this {
        this._id = id;
        return this;
    }

    setToken(token: string): this {
        this._token = token;
        return this;
    }

    /**
     * Post a message to the webhook channel.
     *
     * @param message
     * @returns messsageId
     */
    put(message: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fetch(`${this.URL}/${this._id}/${this._token}?wait=true`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: message }),
            }).then((response) => {
                if (!response.ok) {
                    reject(new Error(`HTTP error: ${response.status}`));
                    return;
                }
                const text = response.text();
                const json = JSON.parse(text);
                const messageId = json.id ?? "";
                resolve(messageId);
            }, reject);
        });
    }

    /**
     * Read the content of a webhook-posted message.
     *
     * @param messageId
     * @returns message content
     */
    get(messageId: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fetch(
                `${this.URL}/${this._id}/${this._token}/messages/${messageId}`
            ).then((response) => {
                if (!response.ok) {
                    reject(`HTTP error: ${response.status}`);
                    return;
                }
                const text: string = response.text();
                const json = JSON.parse(text);
                const content: string = json.content ?? "";
                resolve(content);
            }, reject);
        });
    }

    /**
     * Delete a message posted by the webhook.
     *
     * @param messageId
     * @returns void
     */
    dele(messageId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fetch(
                `${this.URL}/${this._id}/${this._token}/messages/${messageId}`,
                {
                    method: "DELETE",
                }
            ).then((response) => {
                if (!response.ok) {
                    reject(new Error(`HTTP error: ${response.status}`));
                    return;
                }
                resolve();
            }, reject);
        });
    }
}
