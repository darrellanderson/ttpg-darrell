/**
 * Compute adjacency (including at distance) from a collection of links.
 */
export class Adjacency {
    private readonly _linkTypeToSrcNodeToDstNodeSet: {
        [key: string]: { [key: string]: Set<string> };
    } = {};
    private readonly _hubTypeToNodeSet: { [key: string]: Set<string> } = {};
    private readonly _srcHubTypeToDstHubTypeSet: {
        [key: string]: Set<string>;
    } = {};

    addNodeLink(linkType: string, a: string, b: string): this {
        let srcNodeToDstNodeSet: { [key: string]: Set<string> } | undefined;
        let dstNodeSet: Set<string> | undefined;

        srcNodeToDstNodeSet = this._linkTypeToSrcNodeToDstNodeSet[linkType];
        if (!srcNodeToDstNodeSet) {
            srcNodeToDstNodeSet = {};
            this._linkTypeToSrcNodeToDstNodeSet[linkType] = srcNodeToDstNodeSet;
        }

        dstNodeSet = srcNodeToDstNodeSet[a];
        if (!dstNodeSet) {
            dstNodeSet = new Set<string>();
            srcNodeToDstNodeSet[a] = dstNodeSet;
        }
        dstNodeSet.add(b);

        dstNodeSet = srcNodeToDstNodeSet[b];
        if (!dstNodeSet) {
            dstNodeSet = new Set<string>();
            srcNodeToDstNodeSet[b] = dstNodeSet;
        }
        dstNodeSet.add(a);

        return this;
    }

    removeNodeLink(linkType: string, a: string, b: string): this {
        let srcNodeToDstNodeSet: { [key: string]: Set<string> } | undefined;
        srcNodeToDstNodeSet = this._linkTypeToSrcNodeToDstNodeSet[linkType];
        if (!srcNodeToDstNodeSet) {
            srcNodeToDstNodeSet = {};
            this._linkTypeToSrcNodeToDstNodeSet[linkType] = srcNodeToDstNodeSet;
        }
        let dstNodeSet: Set<string> | undefined;
        dstNodeSet = srcNodeToDstNodeSet[a];
        if (!dstNodeSet) {
            dstNodeSet = new Set<string>();
            srcNodeToDstNodeSet[a] = dstNodeSet;
        }
        dstNodeSet.delete(b);
        dstNodeSet = srcNodeToDstNodeSet[b];
        if (!dstNodeSet) {
            dstNodeSet = new Set<string>();
            srcNodeToDstNodeSet[b] = dstNodeSet;
        }
        dstNodeSet.delete(a);
        return this;
    }

    hasNodeLink(linkType: string, a: string, b: string): boolean {
        const srcNodeToDstNodeSet: { [key: string]: Set<string> } | undefined =
            this._linkTypeToSrcNodeToDstNodeSet[linkType];
        if (!srcNodeToDstNodeSet) {
            return false;
        }
        const dstNodeSet: Set<string> | undefined = srcNodeToDstNodeSet[a];
        if (!dstNodeSet) {
            false;
        }
        return dstNodeSet.has(b);
    }

    addNodeHub(hubType: string, a: string): this {
        let nodeSet: Set<string> | undefined;
        nodeSet = this._hubTypeToNodeSet[hubType];
        if (!nodeSet) {
            nodeSet = new Set<string>();
            this._hubTypeToNodeSet[hubType] = nodeSet;
        }
        nodeSet.add(a);
        return this;
    }

    removeNodeHub(hubType: string, a: string): this {
        let nodeSet: Set<string> | undefined;
        nodeSet = this._hubTypeToNodeSet[hubType];
        if (!nodeSet) {
            nodeSet = new Set<string>();
            this._hubTypeToNodeSet[hubType] = nodeSet;
        }
        nodeSet.delete(a);
        return this;
    }

    hasNodeHub(hubType: string, a: string): boolean {
        const nodeSet: Set<string> | undefined =
            this._hubTypeToNodeSet[hubType];
        if (!nodeSet) {
            return false;
        }
        return nodeSet.has(a);
    }

    addHubLink(a: string, b: string): this {
        let hubTypeSet: Set<string>;
        hubTypeSet = this._srcHubTypeToDstHubTypeSet[a];
        if (!hubTypeSet) {
            hubTypeSet = new Set<string>();
            this._srcHubTypeToDstHubTypeSet[a] = hubTypeSet;
        }
        hubTypeSet.add(b);
        hubTypeSet = this._srcHubTypeToDstHubTypeSet[b];
        if (!hubTypeSet) {
            hubTypeSet = new Set<string>();
            this._srcHubTypeToDstHubTypeSet[b] = hubTypeSet;
        }
        hubTypeSet.add(a);
        return this;
    }

    removeHubLink(a: string, b: string): this {
        let hubTypeSet: Set<string>;
        hubTypeSet = this._srcHubTypeToDstHubTypeSet[a];
        if (!hubTypeSet) {
            hubTypeSet = new Set<string>();
            this._srcHubTypeToDstHubTypeSet[a] = hubTypeSet;
        }
        hubTypeSet.delete(b);
        hubTypeSet = this._srcHubTypeToDstHubTypeSet[b];
        if (!hubTypeSet) {
            hubTypeSet = new Set<string>();
            this._srcHubTypeToDstHubTypeSet[b] = hubTypeSet;
        }
        hubTypeSet.delete(a);
        return this;
    }

    hasHubLink(a: string, b: string): boolean {
        const hubTypeSet: Set<string> = this._srcHubTypeToDstHubTypeSet[a];
        if (!hubTypeSet) {
            return false;
        }
        return hubTypeSet.has(b);
    }

    _getTransitiveHubTypes(hubType: string): string[] {
        const linkedHubTypes: Set<string> = new Set<string>();
        const toVisit: string[] = [hubType];
        const visited: Set<string> = new Set<string>();

        while (toVisit.length > 0) {
            const srcHubType: string | undefined = toVisit.shift();
            if (!srcHubType) {
                throw new Error("shift failed when length was positive");
            }
            visited.add(srcHubType);
            const dstHubTypeSet: Set<string> | undefined =
                this._srcHubTypeToDstHubTypeSet[srcHubType];
            if (dstHubTypeSet) {
                for (const dstHubType of dstHubTypeSet) {
                    linkedHubTypes.add(dstHubType);
                    if (!visited.has(dstHubType)) {
                        toVisit.push(dstHubType);
                    }
                }
            }
        }
        return Array.from(linkedHubTypes);
    }

    getAdjacent(
        origin: string,
        maxDistance: number
    ): { [key: string]: number } {
        const nodeToDistance: { [key: string]: number } = {};

        const ab: { [key: string]: string } = {};
        for (const srcNodeToDstNodeSet of Object.values(
            this._linkTypeToSrcNodeToDstNodeSet
        )) {
        }
        return nodeToDistance;
    }
}
