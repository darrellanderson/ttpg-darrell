import { globalEvents, world } from "@tabletop-playground/api";
import { closest } from "fastest-levenshtein";

export class SpeakerToPlayer {
    private _speakers: Set<string> = new Set<string>();
    private _speakerToPlayer: Map<string, string> | undefined;

    constructor() {
        globalEvents.onPlayerJoined.add(() => {
            this.invalidate();
        });
    }

    invalidate(): void {
        this._speakerToPlayer = undefined; // invalidate cache
    }

    getPlayerName(speakerName: string): string | undefined {
        if (!this._speakers.has(speakerName)) {
            this._speakers.add(speakerName);
            this.invalidate();
        }

        if (!this._speakerToPlayer) {
            this._speakerToPlayer = new Map<string, string>();

            const playerNames: Array<string> = world
                .getAllPlayers()
                .map((player) => player.getName());
            const speakerNames: Array<string> = Array.from(this._speakers);

            for (const speakerName of speakerNames) {
                // Find best player match.
                const bestPlayer: string | undefined = closest(
                    speakerName,
                    playerNames
                );
                if (!bestPlayer) {
                    continue;
                }

                // Find best speaker for that player (reversed).
                const bestSpeaker: string | undefined = closest(
                    bestPlayer,
                    speakerNames
                );
                if (!bestSpeaker) {
                    continue;
                }

                // If both directions agree add to map.
                if (speakerName === bestSpeaker) {
                    this._speakerToPlayer.set(speakerName, bestPlayer);
                }
            }
        }
        return this._speakerToPlayer.get(speakerName);
    }
}
