import { Heap } from "../heap/heap";

export type AdjacencyResult = {
    node: string;
    distance: number;
    path: Array<string>;
};

/**
 * Nodes have tags, links connect tags.
 * Tansit nodes are on a path, but do not add to distance ("hyperlane").
 *
 * If two nodes share a tag they are NOT connected UNLESS there is a link
 * from tag back to itself.
 *
 * A link may connect to multiple nodes that share the tag.
 */
export class Adjacency {
    private readonly _nodeToTagSet: { [key: string]: Set<string> } = {};
    private readonly _tagToNodeSet: { [key: string]: Set<string> } = {};
    private readonly _tagToLinkedTagSet: { [key: string]: Set<string> } = {};
    private readonly _transitNodes: Set<string> = new Set<string>();

    /**
     * Add a node tag.  Node tags may name the node, a specific edge, or a
     * possibly-many-neighbors "hub tag" such as a wormhole.
     *
     * @param node
     * @param tags
     * @returns
     */
    public addNodeTags(node: string, tags: Array<string>): this {
        let tagSet: Set<string> | undefined;
        let nodeSet: Set<string> | undefined;
        tagSet = this._nodeToTagSet[node];
        if (!tagSet) {
            tagSet = new Set<string>();
            this._nodeToTagSet[node] = tagSet;
        }
        for (const tag of tags) {
            tagSet.add(tag);
            nodeSet = this._tagToNodeSet[tag];
            if (!nodeSet) {
                nodeSet = new Set<string>();
                this._tagToNodeSet[tag] = nodeSet;
            }
            nodeSet.add(node);
        }
        return this;
    }

    public removeNodeTags(node: string, tags: Array<string>): this {
        const tagSet: Set<string> | undefined = this._nodeToTagSet[node];
        for (const tag of tags) {
            if (tagSet) {
                tagSet.delete(tag);
            }
            const nodeSet: Set<string> | undefined = this._tagToNodeSet[tag];
            if (nodeSet) {
                nodeSet.delete(node);
            }
        }
        return this;
    }

    public hasNodeTag(node: string, tag: string): boolean {
        const tagSet: Set<string> | undefined = this._nodeToTagSet[node];
        return tagSet?.has(tag) ?? false;
    }

    public _hasTagNode(tag: string, node: string): boolean {
        const nodeSet: Set<string> | undefined = this._tagToNodeSet[tag];
        return nodeSet?.has(node) ?? false;
    }

    /**
     * Add a link.  A node with one tag is connected to a node with the other.
     *
     * @param tag1
     * @param tag2
     * @returns
     */
    public addLink(tag1: string, tag2: string): this {
        let linkedTagSet: Set<string> | undefined;

        // 1 -> 1, 1 -> 2.
        linkedTagSet = this._tagToLinkedTagSet[tag1];
        if (!linkedTagSet) {
            linkedTagSet = new Set<string>();
            this._tagToLinkedTagSet[tag1] = linkedTagSet;
        }
        linkedTagSet.add(tag1);
        linkedTagSet.add(tag2);

        // 2 -> 1, 2 -> 2.
        linkedTagSet = this._tagToLinkedTagSet[tag2];
        if (!linkedTagSet) {
            linkedTagSet = new Set<string>();
            this._tagToLinkedTagSet[tag2] = linkedTagSet;
        }
        linkedTagSet.add(tag1);
        linkedTagSet.add(tag2);

        return this;
    }

    public removeLink(tag1: string, tag2: string): this {
        let linkedTagSet: Set<string> | undefined;

        // 1 -> 1, 1 -> 2.
        linkedTagSet = this._tagToLinkedTagSet[tag1];
        if (linkedTagSet) {
            linkedTagSet.delete(tag1);
            linkedTagSet.delete(tag2);
        }

        // 2 -> 1, 2 -> 2.
        linkedTagSet = this._tagToLinkedTagSet[tag2];
        if (linkedTagSet) {
            linkedTagSet.delete(tag1);
            linkedTagSet.delete(tag2);
        }

        return this;
    }

    public hasLink(tag1: string, tag2: string): boolean {
        const linkedTagSet: Set<string> | undefined =
            this._tagToLinkedTagSet[tag1];
        return linkedTagSet?.has(tag2) ?? false;
    }

    /**
     * Transit nodes can appear along a path but do not add to distance
     * (e.g. hyperlanes).
     *
     * @param node
     * @returns
     */
    public addTransitNode(node: string): this {
        this._transitNodes.add(node);
        return this;
    }

    public removeTransitNode(node: string): this {
        this._transitNodes.delete(node);
        return this;
    }

    public hasTransitNode(node: string): boolean {
        return this._transitNodes.has(node);
    }

    _getAdjacentNodeSet(node: string): Set<string> {
        const tagSet: Set<string> | undefined = this._nodeToTagSet[node];
        const adjNodeSet: Set<string> = new Set<string>();

        if (tagSet) {
            for (const tag of tagSet) {
                const linkedTagSet: Set<string> | undefined =
                    this._tagToLinkedTagSet[tag];
                if (linkedTagSet) {
                    for (const linkedTag of linkedTagSet) {
                        const nodeSet: Set<string> | undefined =
                            this._tagToNodeSet[linkedTag];
                        if (nodeSet) {
                            for (const linkedNode of nodeSet) {
                                if (linkedNode !== node) {
                                    adjNodeSet.add(linkedNode);
                                }
                            }
                        }
                    }
                }
            }
        }
        return adjNodeSet;
    }

    /**
     * Compute shortest paths to all nodes within maxDistance.
     *
     * @param origin
     * @param maxDistance
     * @returns
     */
    public get(origin: string, maxDistance: number): Array<AdjacencyResult> {
        const originAdjacencyResult: AdjacencyResult = {
            node: origin,
            distance: 0,
            path: [origin],
        };
        const nodeToAdjacencyResult: { [key: string]: AdjacencyResult } = {
            [origin]: originAdjacencyResult,
        };
        const toVisit: Set<AdjacencyResult> = new Set<AdjacencyResult>([
            originAdjacencyResult,
        ]);
        const visited: Set<string> = new Set<string>();

        const heap: Heap<string> = new Heap<string>().add(origin, 0);

        while (toVisit.size > 0) {
            // Find the closest of the to-visit nodes.
            const closestNode: string | undefined = heap.removeMin();
            if (closestNode) {
                const closest: AdjacencyResult | undefined =
                    nodeToAdjacencyResult[closestNode];
                if (closest) {
                    toVisit.delete(closest);
                    visited.add(closest.node);

                    const adjNodeSet: Set<string> = this._getAdjacentNodeSet(
                        closest.node
                    );
                    for (const adjNode of adjNodeSet) {
                        if (!visited.has(adjNode)) {
                            // Add to result.
                            const isTransit = this._transitNodes.has(adjNode);
                            const extraDistance = isTransit ? 0 : 1;
                            const distance = closest.distance + extraDistance;
                            if (distance <= maxDistance) {
                                const adjResult: AdjacencyResult = {
                                    node: adjNode,
                                    distance,
                                    path: [...closest.path, adjNode],
                                };
                                nodeToAdjacencyResult[adjNode] = adjResult;
                                toVisit.add(adjResult);
                                heap.add(adjNode, distance);
                            }
                        }
                    }
                }
            }
        }
        return Object.values(nodeToAdjacencyResult);
    }
}
