/**
 * Explicit link between A and B.
 */
export type AdjacencyLink = {
    type: string;
    a: string;
    b: string;
};

/**
 * Ambigous link between A and all other hubs with the same type.
 */
export type AdjacencyHub = {
    type: string;
    a: string;
};

export class Adjacency {}

/**
 * Compute adjacency (including at distance) from a collection of links.
 */
export class AdjacencyBuilder {
    private readonly _links: AdjacencyLink[] = [];
    private readonly _hubs: AdjacencyHub[] = [];

    private readonly _blockLinksStrinified: Set<string> = new Set<string>();
    private readonly _blockHubTypes: Set<string> = new Set<string>();

    private readonly _hubTypeToLinkedHubTypesSet: {
        [key: string]: Set<string>;
    } = {};

    static _createCanonicalLink(
        type: string,
        a: string,
        b: string
    ): AdjacencyLink {
        if (a < b) {
            [a, b] = [b, a];
        }
        return { type, a, b };
    }

    static _stringifyCanonicalLink(link: AdjacencyLink): string {
        return `${link.type}:${link.a}:${link.b}`;
    }

    addLink(type: string, a: string, b: string): this {
        const link = AdjacencyBuilder._createCanonicalLink(type, a, b);
        this._links.push(link);
        return this;
    }

    addHub(type: string, a: string): this {
        const hub: AdjacencyHub = { type, a };
        this._hubs.push(hub);
        return this;
    }

    blockLink(type: string, a: string, b: string): this {
        const link = AdjacencyBuilder._createCanonicalLink(type, a, b);
        const stringified = AdjacencyBuilder._stringifyCanonicalLink(link);
        this._blockLinksStrinified.add(stringified);
        return this;
    }

    linkHubs(type1: string, type2: string): this {
        let linkedHubTypesSet: Set<string> | undefined;

        // 1 -> 2
        linkedHubTypesSet = this._hubTypeToLinkedHubTypesSet[type1];
        if (!linkedHubTypesSet) {
            linkedHubTypesSet = new Set<string>();
            this._hubTypeToLinkedHubTypesSet[type1] = linkedHubTypesSet;
        }
        linkedHubTypesSet.add(type2);

        // 2 -> 1
        linkedHubTypesSet = this._hubTypeToLinkedHubTypesSet[type2];
        if (!linkedHubTypesSet) {
            linkedHubTypesSet = new Set<string>();
            this._hubTypeToLinkedHubTypesSet[type2] = linkedHubTypesSet;
        }
        linkedHubTypesSet.add(type1);
        return this;
    }

    _getUnblockedLinks(): AdjacencyLink[] {
        return this._links.filter((link) => {
            return !this._blockLinksStrinified.has(
                AdjacencyBuilder._stringifyCanonicalLink(link)
            );
        });
    }

    _getUnblockedHubs(): AdjacencyHub[] {
        return this._hubs.filter((hub) => {
            return !this._blockHubTypes.has(hub.type);
        });
    }

    _getTransitiveLinkedHubTypes(type: string): string[] {
        const linkedHubTypes: Set<string> = new Set<string>();
        const toVisit: string[] = [type];
        const visited: Set<string> = new Set<string>();

        while (toVisit.length > 0) {
            const visitType: string | undefined = toVisit.shift();
            if (!visitType) {
                throw new Error("shift failed when length was positive");
            }
            visited.add(visitType);
            const linkedTypesSet: Set<string> | undefined =
                this._hubTypeToLinkedHubTypesSet[visitType];
            if (linkedTypesSet) {
                for (const linkedType of linkedTypesSet) {
                    linkedHubTypes.add(linkedType);
                    if (!visited.has(linkedType)) {
                        toVisit.push(linkedType);
                    }
                }
            }
        }
        return Array.from(linkedHubTypes);
    }

    build(origin: string, maxDistance: number): Adjacency {}
}
