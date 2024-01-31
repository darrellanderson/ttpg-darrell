import { AbstractGlobal } from "../global/global-init";

/**
 * Monitor given decks expecting no NSID (metadata) repeats.
 * Prune extra cards if found.
 */
export class BugUniqueCards extends AbstractGlobal {
    init(): void {
        throw new Error("Method not implemented.");
    }
}
