import { Heap } from "../heap/heap";

/**
 * Opaque node id.  Could be a hex coordinate, a wormhole class, etc.
 */
export type AdjacencyNodeType = string;

/**
 * Directed link between two nodes.
 * Paths cannot end with a transit node; they must connect two non-transit nodes.
 */
export type AdjacencyLinkType = {
    src: AdjacencyNodeType;
    dst: AdjacencyNodeType;
    distance: number;
    isTransit: boolean;
};

export type AdjacencyPathType = {
    node: AdjacencyNodeType; // final node in path
    distance: number;
    path: ReadonlyArray<AdjacencyLinkType>;
};

export class Adjacency {
    private readonly _srcNodeOutgoingLinks: Map<
        AdjacencyNodeType,
        Set<AdjacencyLinkType>
    > = new Map();

    public addLink(link: AdjacencyLinkType): this {
        // Create the src->link set if missing.
        let outgoingLinks: Set<AdjacencyLinkType> | undefined =
            this._srcNodeOutgoingLinks.get(link.src);
        if (!outgoingLinks) {
            outgoingLinks = new Set<AdjacencyLinkType>();
            this._srcNodeOutgoingLinks.set(link.src, outgoingLinks);
        }

        // Add immutable link.
        link = Object.freeze(link); // make immutable
        outgoingLinks.add(link);
        return this;
    }

    public hasLink(link: AdjacencyLinkType): boolean {
        const outgoingLinks: Set<AdjacencyLinkType> | undefined =
            this._srcNodeOutgoingLinks.get(link.src);
        if (outgoingLinks) {
            for (const outgoingLink of outgoingLinks) {
                if (
                    outgoingLink.src === link.src &&
                    outgoingLink.dst === link.dst &&
                    outgoingLink.distance === link.distance &&
                    outgoingLink.isTransit === link.isTransit
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Remove all links starting OR ENDING from the given node.
     *
     * @param node
     */
    public removeNode(node: AdjacencyNodeType): this {
        this._srcNodeOutgoingLinks.delete(node);

        for (const outgoingLinks of this._srcNodeOutgoingLinks.values()) {
            const dele: Set<AdjacencyLinkType> = new Set<AdjacencyLinkType>();
            for (const link of outgoingLinks) {
                if (link.dst === node) {
                    dele.add(link);
                }
            }
            for (const link of dele) {
                outgoingLinks.delete(link);
            }
        }
        return this;
    }

    /**
     * Compute shortest paths to all nodes within maxDistance.
     *
     * @param origin
     * @param maxDistance
     * @returns
     */
    public get(
        origin: AdjacencyNodeType,
        maxDistance: number
    ): ReadonlyArray<AdjacencyPathType> {
        const nodeToAdjacencyPath: Map<AdjacencyNodeType, AdjacencyPathType> =
            new Map<AdjacencyNodeType, AdjacencyPathType>();
        const toExplore: Set<AdjacencyNodeType> = new Set<AdjacencyNodeType>();
        const explored: Set<AdjacencyNodeType> = new Set<string>();

        // Start with the origin.
        toExplore.add(origin); // start from the origin
        const heap: Heap<string> = new Heap<string>().add(origin, 0);

        nodeToAdjacencyPath.set(origin, {
            node: origin,
            distance: 0,
            path: [],
        });

        let closestNode: string | undefined;
        while (toExplore.size > 0 && (closestNode = heap.removeMin())) {
            // Find the closest of the to-visit nodes.
            const closest: AdjacencyPathType | undefined =
                nodeToAdjacencyPath.get(closestNode);
            if (closest && !explored.has(closest.node)) {
                // Mark as explored.
                toExplore.delete(closest.node);
                explored.add(closest.node);

                // Walk the outgoing link destinations.
                const outgoingLinks: Set<AdjacencyLinkType> | undefined =
                    this._srcNodeOutgoingLinks.get(closest.node);
                if (outgoingLinks) {
                    for (const outgoingLink of outgoingLinks) {
                        const dst: AdjacencyNodeType = outgoingLink.dst;
                        if (!explored.has(dst)) {
                            const distance: number =
                                closest.distance + outgoingLink.distance;
                            const path: Array<AdjacencyLinkType> = [
                                ...closest.path,
                                outgoingLink,
                            ];

                            if (distance <= maxDistance) {
                                // This dst is new and within range, add it to to-explore list.
                                toExplore.add(dst);
                                heap.add(dst, distance);

                                // Also add to the adjacency paths, even if ends with a transit.
                                nodeToAdjacencyPath.set(dst, {
                                    node: dst,
                                    distance,
                                    path,
                                });
                            }
                        }
                    }
                }
            }
        }

        // Get paths not ending with a transit node and make immutable.
        const result: Array<AdjacencyPathType> = [
            ...nodeToAdjacencyPath.values(),
        ]
            .filter((adjacencyPathType: AdjacencyPathType): boolean => {
                const lastLink: AdjacencyLinkType | undefined =
                    adjacencyPathType.path[adjacencyPathType.path.length - 1];
                return lastLink !== undefined && !lastLink.isTransit;
            })
            .map((adjacencyPathType: AdjacencyPathType): AdjacencyPathType => {
                return Object.freeze(adjacencyPathType);
            });

        // Sort by distance.
        result.sort((a, b) => {
            if (a.distance < b.distance) {
                return -1;
            } else if (a.distance > b.distance) {
                return 1;
            }
            if (a.node < b.node) {
                return -1;
            } else if (a.node > b.node) {
                return 1;
            }
            return 0;
        });

        return result;
    }
}
