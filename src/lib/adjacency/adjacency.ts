// Alias to make it more obvious which type is being used.
export type LinkType = string;
export type NodeType = string;
export type HubType = string;

/**
 * Compute adjacency (including at distance) from a collection of links.
 */
export class Adjacency {
    // Links from A to B.
    private readonly _linkTypeToSrcNodeToDstNodeSet: {
        [key: LinkType]: { [key: NodeType]: Set<NodeType> };
    } = {};

    // Hubs connect all nodes with the given hub type.
    private readonly _hubTypeToNodeSet: { [key: HubType]: Set<NodeType> } = {};
    private readonly _nodeToHubTypes: { [key: NodeType]: Set<HubType> } = {};

    // Hubs can link to other hubs.
    private readonly _srcHubTypeToDstHubTypeSet: {
        [key: HubType]: Set<HubType>;
    } = {};

    /**
     * Add a typed-link (e.g. "neighbor") between A and B.
     *
     * @param linkType
     * @param a
     * @param b
     * @returns
     */
    addNodeLink(linkType: LinkType, a: NodeType, b: NodeType): this {
        let srcNodeToDstNodeSet:
            | { [key: NodeType]: Set<NodeType> }
            | undefined = this._linkTypeToSrcNodeToDstNodeSet[linkType];
        if (!srcNodeToDstNodeSet) {
            srcNodeToDstNodeSet = {};
            this._linkTypeToSrcNodeToDstNodeSet[linkType] = srcNodeToDstNodeSet;
        }
        let aSet: Set<NodeType> | undefined = srcNodeToDstNodeSet[a];
        if (!aSet) {
            aSet = new Set<NodeType>();
            srcNodeToDstNodeSet[a] = aSet;
        }
        aSet.add(b);
        let bSet: Set<NodeType> | undefined = srcNodeToDstNodeSet[b];
        if (!bSet) {
            bSet = new Set<NodeType>();
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
    removeNodeLink(linkType: LinkType, a: NodeType, b: NodeType): this {
        const srcNodeToDstNodeSet:
            | { [key: NodeType]: Set<NodeType> }
            | undefined = this._linkTypeToSrcNodeToDstNodeSet[linkType];
        if (!srcNodeToDstNodeSet) {
            return this;
        }

        const aSet: Set<NodeType> | undefined = srcNodeToDstNodeSet[a];
        if (aSet) {
            aSet.delete(b);
        }
        const bSet: Set<NodeType> | undefined = srcNodeToDstNodeSet[b];
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
    hasNodeLink(linkType: LinkType, a: NodeType, b: NodeType): boolean {
        const srcNodeToDstNodeSet:
            | { [key: NodeType]: Set<NodeType> }
            | undefined = this._linkTypeToSrcNodeToDstNodeSet[linkType];
        if (!srcNodeToDstNodeSet) {
            return false;
        }
        const dstNodeSet: Set<NodeType> | undefined = srcNodeToDstNodeSet[a];
        if (!dstNodeSet) {
            false;
        }
        return dstNodeSet.has(b);
    }

    addNodeHub(a: NodeType, hubType: HubType): this {
        let nodeSet: Set<NodeType> | undefined;
        nodeSet = this._hubTypeToNodeSet[hubType];
        if (!nodeSet) {
            nodeSet = new Set<NodeType>();
            this._hubTypeToNodeSet[hubType] = nodeSet;
        }
        nodeSet.add(a);

        let hubTypes: Set<HubType> | undefined;
        hubTypes = this._nodeToHubTypes[a];
        if (!hubTypes) {
            hubTypes = new Set<HubType>();
            this._nodeToHubTypes[a] = hubTypes;
        }
        hubTypes.add(hubType);

        return this;
    }

    removeNodeHub(a: NodeType, hubType: HubType): this {
        const nodeSet: Set<NodeType> | undefined =
            this._hubTypeToNodeSet[hubType];
        if (nodeSet) {
            nodeSet.delete(a);
        }

        const hubTypes: Set<HubType> | undefined = this._nodeToHubTypes[a];
        if (hubTypes) {
            hubTypes.delete(hubType);
        }

        return this;
    }

    hasNodeHub(hubType: HubType, a: NodeType): boolean {
        const nodeSet: Set<NodeType> | undefined =
            this._hubTypeToNodeSet[hubType];
        return nodeSet && nodeSet.has(a);
    }

    addHubLink(a: HubType, b: HubType): this {
        let hubTypeSet: Set<HubType>;
        hubTypeSet = this._srcHubTypeToDstHubTypeSet[a];
        if (!hubTypeSet) {
            hubTypeSet = new Set<HubType>();
            this._srcHubTypeToDstHubTypeSet[a] = hubTypeSet;
        }
        hubTypeSet.add(b);
        hubTypeSet = this._srcHubTypeToDstHubTypeSet[b];
        if (!hubTypeSet) {
            hubTypeSet = new Set<HubType>();
            this._srcHubTypeToDstHubTypeSet[b] = hubTypeSet;
        }
        hubTypeSet.add(a);
        return this;
    }

    removeHubLink(a: HubType, b: HubType): this {
        let hubTypeSet: Set<HubType>;
        hubTypeSet = this._srcHubTypeToDstHubTypeSet[a];
        if (hubTypeSet) {
            hubTypeSet.delete(b);
        }
        hubTypeSet = this._srcHubTypeToDstHubTypeSet[b];
        if (hubTypeSet) {
            hubTypeSet.delete(a);
        }
        return this;
    }

    hasHubLink(a: HubType, b: HubType): boolean {
        const hubTypeSet: Set<HubType> = this._srcHubTypeToDstHubTypeSet[a];
        return hubTypeSet && hubTypeSet.has(b);
    }

    _getTransitiveHubTypes(hubType: HubType): HubType[] {
        const linkedHubTypes: Set<HubType> = new Set<HubType>();
        const toVisit: HubType[] = [hubType];
        const visited: Set<HubType> = new Set<HubType>();

        while (toVisit.length > 0) {
            const srcHubType: HubType | undefined = toVisit.shift();
            if (!srcHubType) {
                throw new Error("shift failed when length was positive");
            }
            visited.add(srcHubType);
            linkedHubTypes.add(srcHubType);
            const dstHubTypeSet: Set<HubType> | undefined =
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

    getAdjacentAtDistanceArray(
        origin: NodeType,
        maxDistance: number
    ): Set<string>[] {
        const nodeToDistance: { [key: NodeType]: number } = { [origin]: 0 };
        const toVisit: NodeType[] = [origin];

        const srcNodeToDstNodeSet: { [key: NodeType]: Set<NodeType> } = {};
        const addLink = (a: NodeType, b: NodeType) => {
            let bNodeSet: Set<string> = srcNodeToDstNodeSet[a];
            if (!bNodeSet) {
                bNodeSet = new Set<NodeType>();
                srcNodeToDstNodeSet[a] = bNodeSet;
            }
            bNodeSet.add(a);
            let aNodeSet: Set<string> = srcNodeToDstNodeSet[b];
            if (!aNodeSet) {
                aNodeSet = new Set<NodeType>();
                srcNodeToDstNodeSet[b] = aNodeSet;
            }
            aNodeSet.add(b);
        };

        // Get link edges.
        for (const linkSrcNodeToLinkDstNodeSet of Object.values(
            this._linkTypeToSrcNodeToDstNodeSet
        )) {
            for (const [a, bSet] of Object.entries(
                linkSrcNodeToLinkDstNodeSet
            )) {
                for (const b of bSet) {
                    addLink(a, b);
                }
            }
        }

        // Get hub edges.
        for (const hubType of Object.keys(this._hubTypeToNodeSet)) {
            console.log("looking at " + hubType);
            const aNodes: Set<NodeType> | undefined =
                this._hubTypeToNodeSet[hubType];
            if (!aNodes) {
                continue;
            }
            const transitiveHubTypes: HubType[] =
                this._getTransitiveHubTypes(hubType);
            for (const transitiveHubType of transitiveHubTypes) {
                console.log("t " + transitiveHubType);
                const bNodes: Set<NodeType> | undefined =
                    this._hubTypeToNodeSet[transitiveHubType];
                if (!bNodes) {
                    continue;
                }
                console.log(hubType + " " + transitiveHubType);
                for (const a of aNodes) {
                    console.log("a:" + a);
                    for (const b of bNodes) {
                        if (a === b) {
                            continue;
                        }
                        console.log("a:" + a + " b:" + b);
                        addLink(a, b);
                    }
                }
            }
        }

        while (toVisit.length > 0) {
            const a: NodeType | undefined = toVisit.shift();
            if (!a) {
                throw new Error("length positive but shift failed");
            }

            // Get distance to node.
            const aDistance: number | undefined = nodeToDistance[a];
            if (aDistance === undefined) {
                throw new Error("missing distance");
            }

            // Add adjacent.
            const dstNodeSet: Set<NodeType> | undefined =
                srcNodeToDstNodeSet[a];
            if (dstNodeSet) {
                for (const b of dstNodeSet) {
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
        }

        const result = Array(maxDistance + 1) // include nodes at maxDistance
            .fill(0)
            .map(() => new Set<NodeType>());
        for (const [node, distance] of Object.entries(nodeToDistance)) {
            result[distance].add(node);
        }
        return result;
    }
}
