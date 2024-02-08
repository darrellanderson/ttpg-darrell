import { Card, CardDetails, StaticObject } from "@tabletop-playground/api";

export type ParsedNSID = {
    nsid: string;
    typeParts: string[];
    sourceParts: string[];
    nameParts: string[];
    extra: string | undefined;
};

export const DECK_NSID = "deck:?/?";

/**
 * Object metadata field uses a simple "type:source/name|extra" string.
 *
 * Each component is a dot (".") delimited series of strings.
 *
 * TYPE delineates the hierarchy to the specific object type.  Entries should
 * start generic and get more specific, for instance "card.action" is a card
 * from the action deck.  The TYPE field should be sufficient to locate where
 * the item belongs, in some cases augment with owning player slot.
 *
 * SOURCE is the produce/release with the item.  For instance, "base" could
 * mean the base game, or use an official expansion name.  Recommend homebrew
 * always start with "homebrew.{x}" where {x} is the identifier (to avoid
 * confusion with canon content sources).
 *
 * NAME is the item name.  It may include dot-delimited discriminators for
 * different versions of the same item (e.g. "direct_hit.1" vs "direct_hit.2").
 *
 * EXTRA should be avoided, there may be rare cases wanting fruther metadata.
 *
 * @see https://github.com/TI4-Online/TI4-TTPG/wiki/NSID-Namespace
 */
export abstract class NSID {
    /**
     * Create NSID from a metadata string or object.  A deck with multiple cards
     * gets a special "deck" NSID, consumers should call `stack` to get by card.
     *
     * @param input
     * @returns NSID string
     */
    static get(input: StaticObject): string {
        let metadata = "";
        if (input instanceof Card) {
            if (input.getStackSize() === 1) {
                // Singleton card: use the card metadata.
                metadata = input.getCardDetails().metadata;
            } else {
                // Deck: do not attempt to extract more here.
                metadata = DECK_NSID;
            }
        } else if (input instanceof StaticObject) {
            // Non-card table or game object.  Use template metadata.
            metadata = input.getTemplateMetadata();
        }
        return metadata;
    }

    /**
     * Get NSIDs for each card in a deck.
     *
     * @param input deck
     * @returns NSID array, per-card values
     */
    static getDeck(input: Card): string[] {
        return input.getAllCardDetails().map((cardDetails: CardDetails) => {
            return cardDetails.metadata;
        });
    }

    /**
     * Parse this NSID into components (and sub-components, if dot delimited).
     *
     * @returns parsed
     */
    static parse(nsid: string): ParsedNSID | undefined {
        const m = nsid.match(/^([^:]+):([^/]+)\/([^|]+)\|?(.*)$/);
        if (!m) {
            return undefined;
        }
        const type: string = m[1] ?? "";
        const source: string = m[2] ?? "";
        const name: string = m[3] ?? "";
        const extra: string = m[4] ?? "";
        return {
            nsid: nsid,
            typeParts: type.split("."),
            sourceParts: source.split("."),
            nameParts: name.split("."),
            extra: extra.length > 0 ? m[4] : undefined,
        };
    }
}
