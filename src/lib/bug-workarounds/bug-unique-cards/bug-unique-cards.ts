import { IGlobal } from "../../global/i-global";

/**
 * Monitor given decks expecting no NSID (metadata) repeats.
 * Prune extra cards if found.
 */
export class BugUniqueCards implements IGlobal {
    init(): void {
        throw new Error("Method not implemented.");
    }
}
