import { Heap } from "../heap/heap";

/**
 * Opaque node id.  Could be a hex coordinate, a wormhole class, etc.
 */
export type AdjacencyNodeType = string;

/**
 * Edge between two nodes.
 * Paths cannot end with a transit node; they must connect two non-transit nodes.
 */
export type AdjacencyEdgeType = {
    src: AdjacencyNodeType;
    dst: AdjacencyNodeType;
    distance: number;
    isTransit: boolean;
};

export type AdjacencyPathType = {
    node: AdjacencyNodeType; // final node in path
    distance: number;
    path: ReadonlyArray<AdjacencyEdgeType>;
};

export class Adjacency {
    private readonly _srcNodeToOutgoingEdges: Map<
        AdjacencyNodeType,
        Set<AdjacencyEdgeType>
    > = new Map();

    public addEdge(edge: AdjacencyEdgeType): this {
        // Create the src->edge set if missing.
        let outgoingEdges: Set<AdjacencyEdgeType> | undefined =
            this._srcNodeToOutgoingEdges.get(edge.src);
        if (!outgoingEdges) {
            outgoingEdges = new Set<AdjacencyEdgeType>();
            this._srcNodeToOutgoingEdges.set(edge.src, outgoingEdges);
        }

        // Add immutable edge.
        edge = Object.freeze(edge); // make immutable
        outgoingEdges.add(edge);
        return this;
    }

    public hasEdge(edge: AdjacencyEdgeType): boolean {
        const outgoingEdges: Set<AdjacencyEdgeType> | undefined =
            this._srcNodeToOutgoingEdges.get(edge.src);
        if (outgoingEdges) {
            for (const existingEdge of outgoingEdges) {
                if (
                    existingEdge.src === edge.src &&
                    existingEdge.dst === edge.dst &&
                    existingEdge.distance === edge.distance
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Remove all edges starting OR ENDING from the given node.
     *
     * @param node
     */
    public removeNode(node: AdjacencyNodeType): this {
        this._srcNodeToOutgoingEdges.delete(node);

        for (const outgoingEdges of this._srcNodeToOutgoingEdges.values()) {
            const dele: Set<AdjacencyEdgeType> = new Set<AdjacencyEdgeType>();
            for (const edge of outgoingEdges) {
                if (edge.dst === node) {
                    dele.add(edge);
                }
            }
            for (const edge of dele) {
                outgoingEdges.delete(edge);
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
            if (closest) {
                // Mark as explored.
                toExplore.delete(closest.node);
                explored.add(closest.node);

                // Walk the outgoing edge destinations.
                const outgoingEdges: Set<AdjacencyEdgeType> | undefined =
                    this._srcNodeToOutgoingEdges.get(closest.node);
                if (outgoingEdges) {
                    for (const outgoingEdge of outgoingEdges) {
                        const dst: AdjacencyNodeType = outgoingEdge.dst;
                        if (!explored.has(dst)) {
                            const distance: number =
                                closest.distance + outgoingEdge.distance;
                            const path: Array<AdjacencyEdgeType> = [
                                ...closest.path,
                                outgoingEdge,
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
                const lastEdge: AdjacencyEdgeType | undefined =
                    adjacencyPathType.path[adjacencyPathType.path.length - 1];
                return lastEdge !== undefined && !lastEdge.isTransit;
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
