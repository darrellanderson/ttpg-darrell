/**
 * Compute adjacency (including at distance) from a collection of links.
 */
export class Adjacency {
    // Links from A to B.
    private readonly _linkTypeToSrcNodeToDstNodeSet: {
        [key: string]: { [key: string]: Set<string> };
    } = {};

    // Hubs connect all nodes with the given hub type.
    private readonly _hubTypeToNodeSet: { [key: string]: Set<string> } = {};
    private readonly _nodeToHubTypes: { [key: string]: Set<string> } = {};

    // Hubs can link to other hubs.
    private readonly _srcHubTypeToDstHubTypeSet: {
        [key: string]: Set<string>;
    } = {};

    /**
     * Add a typed-link (e.g. "neighbor") between A and B.
     *
     * @param linkType
     * @param a
     * @param b
     * @returns
     */
    addNodeLink(linkType: string, a: string, b: string): this {
        let srcNodeToDstNodeSet: { [key: string]: Set<string> } | undefined =
            this._linkTypeToSrcNodeToDstNodeSet[linkType];
        if (!srcNodeToDstNodeSet) {
            srcNodeToDstNodeSet = {};
            this._linkTypeToSrcNodeToDstNodeSet[linkType] = srcNodeToDstNodeSet;
        }
        let aSet: Set<string> | undefined = srcNodeToDstNodeSet[a];
        if (!aSet) {
            aSet = new Set<string>();
            srcNodeToDstNodeSet[a] = aSet;
        }
        aSet.add(b);
        let bSet: Set<string> | undefined = srcNodeToDstNodeSet[b];
        if (!bSet) {
            bSet = new Set<string>();
            srcNodeToDstNodeSet[b] = bSet;
        }
        bSet.add(a);
        return this;
    }

    /**
     * Remove a typed-link (e.g. "neighbor") between A and B.
     *
     * @param linkType
     * @param a
     * @param b
     * @returns
     */
    removeNodeLink(linkType: string, a: string, b: string): this {
        const srcNodeToDstNodeSet: { [key: string]: Set<string> } | undefined =
            this._linkTypeToSrcNodeToDstNodeSet[linkType];
        if (!srcNodeToDstNodeSet) {
            return this;
        }

        const aSet: Set<string> | undefined = srcNodeToDstNodeSet[a];
        if (aSet) {
            aSet.delete(b);
        }
        const bSet: Set<string> | undefined = srcNodeToDstNodeSet[b];
        if (bSet) {
            bSet.delete(a);
        }
        return this;
    }

    /**
     * Check for a typed-link (e.g. "neighbor") between A and B.
     *
     * @param linkType
     * @param a
     * @param b
     * @returns
     */
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

        let hubTypes: Set<string> | undefined;
        hubTypes = this._nodeToHubTypes[a];
        if (!hubTypes) {
            hubTypes = new Set<string>();
            this._nodeToHubTypes[a] = hubTypes;
        }
        hubTypes.add(hubType);

        return this;
    }

    removeNodeHub(hubType: string, a: string): this {
        const nodeSet: Set<string> | undefined =
            this._hubTypeToNodeSet[hubType];
        if (nodeSet) {
            nodeSet.delete(a);
        }

        const hubTypes: Set<string> | undefined = this._nodeToHubTypes[a];
        if (hubTypes) {
            hubTypes.delete(hubType);
        }

        return this;
    }

    hasNodeHub(hubType: string, a: string): boolean {
        const nodeSet: Set<string> | undefined =
            this._hubTypeToNodeSet[hubType];
        return nodeSet && nodeSet.has(a);
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
            return this;
        }
        hubTypeSet.delete(b);
        hubTypeSet = this._srcHubTypeToDstHubTypeSet[b];
        if (!hubTypeSet) {
            return this;
        }
        hubTypeSet.delete(a);
        return this;
    }

    hasHubLink(a: string, b: string): boolean {
        const hubTypeSet: Set<string> = this._srcHubTypeToDstHubTypeSet[a];
        return hubTypeSet && hubTypeSet.has(b);
    }

    _getTransitiveHubTypes(hubTypes: string[]): string[] {
        const linkedHubTypes: Set<string> = new Set<string>();
        const toVisit: string[] = [...hubTypes];
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
        const nodeToDistance: { [key: string]: number } = { [origin]: 0 };
        const toVisit: string[] = [origin];

        // Get link edges.
        const srcNodeToDstNodeSet: { [key: string]: Set<string> } = {};
        srcNodeToDstNodeSet[origin] = new Set<string>();
        for (const linkSrcNodeToLinkDstNodeSet of Object.values(
            this._linkTypeToSrcNodeToDstNodeSet
        )) {
            for (const [linkSrcNode, linkDstNodeSet] of Object.entries(
                linkSrcNodeToLinkDstNodeSet
            )) {
                let dstNodeSet: Set<string> = srcNodeToDstNodeSet[linkSrcNode];
                if (!dstNodeSet) {
                    dstNodeSet = new Set<string>();
                    srcNodeToDstNodeSet[linkSrcNode] = dstNodeSet;
                }
                for (const linkDstNode of linkDstNodeSet) {
                    dstNodeSet.add(linkDstNode);
                }
            }
        }

        // Get hub edges.
        const hubTypes: Set<string> | undefined = this._nodeToHubTypes[origin];
        if (hubTypes) {
            const transitiveHubTypes: string[] = this._getTransitiveHubTypes(
                Array.from(hubTypes)
            );
            for (const transitiveHubType of transitiveHubTypes) {
                const nodeSet: Set<string> | undefined =
                    this._hubTypeToNodeSet[transitiveHubType];
                if (nodeSet) {
                    for (const b of nodeSet) {
                        srcNodeToDstNodeSet[origin].add(b);
                    }
                }
            }
        }

        while (toVisit.length > 0) {
            const a: string | undefined = toVisit.shift();
            if (!a) {
                throw new Error("length positive but shift failed");
            }

            // Get distance to node.
            const aDistance: number | undefined = nodeToDistance[a];
            if (aDistance === undefined) {
                throw new Error("missing distance");
            }

            // Add adjacent.
            for (const b of srcNodeToDstNodeSet[a]) {
                if (nodeToDistance[b] !== undefined) {
                    continue; // already visited
                }
                const bDistance: number = aDistance + 1;
                nodeToDistance[b] = bDistance;
                if (bDistance < maxDistance) {
                    toVisit.push(b);
                }
            }
        }

        return nodeToDistance;
    }
}
