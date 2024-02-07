/**
 * Nodes have tags, links connect tags.  Merged tags are treated as one tag.
 *
 * A tag does NOT link to itself by default, specify a self-link to do so.
 * - node1:tagAlpha
 * - node2:tagAlpha
 * - node1 NOT adjacent to node2
 * - add link:tagAlpha-tagAlpha
 * - node1 is now adjacent to node2
 *
 * Tansit nodes are on a path, but do not add to distance ("hyperlane").
 */

export type AdjacencyResult = {
    node: string;
    distance: number;
    path: string[];
};

export class Adjacency {
    private readonly _nodeToTagSet: { [key: string]: Set<string> } = {};
    private readonly _tagToNodeSet: { [key: string]: Set<string> } = {};
    private readonly _tagToLinkedTagSet: { [key: string]: Set<string> } = {};
    private readonly _tagToMergedTagSet: { [key: string]: Set<string> } = {};
    private readonly _transitNodes: Set<string> = new Set<string>();

    public addNodeTags(node: string, tags: string[]): this {
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
                this._tagToLinkedTagSet[tag] = nodeSet;
            }
            nodeSet.add(tag);
        }
        return this;
    }

    public removeNodeTags(node: string, tags: string[]): this {
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
        return tagSet && tagSet.has(tag);
    }

    public hasTagNode(tag: string, node: string): boolean {
        const nodeSet: Set<string> | undefined = this._tagToNodeSet[tag];
        return nodeSet && nodeSet.has(node);
    }

    public addLink(tag1: string, tag2: string): this {
        let linkedTagSet: Set<string> | undefined;

        // 1 -> 2.
        linkedTagSet = this._tagToLinkedTagSet[tag1];
        if (!linkedTagSet) {
            linkedTagSet = new Set<string>();
            this._tagToLinkedTagSet[tag1] = linkedTagSet;
        }
        linkedTagSet.add(tag2);

        // 2 -> 1.
        linkedTagSet = this._tagToLinkedTagSet[tag2];
        if (!linkedTagSet) {
            linkedTagSet = new Set<string>();
            this._tagToLinkedTagSet[tag2] = linkedTagSet;
        }
        linkedTagSet.add(tag1);

        return this;
    }

    public removeLink(tag1: string, tag2: string): this {
        let linkedTagSet: Set<string> | undefined;

        // 1 -> 2.
        linkedTagSet = this._tagToLinkedTagSet[tag1];
        if (linkedTagSet) {
            linkedTagSet.delete(tag2);
        }

        // 2 -> 1.
        linkedTagSet = this._tagToLinkedTagSet[tag2];
        if (linkedTagSet) {
            linkedTagSet.delete(tag1);
        }

        return this;
    }

    public hasLink(tag1: string, tag2: string): boolean {
        const linkedTagSet: Set<string> | undefined =
            this._tagToLinkedTagSet[tag1];
        return linkedTagSet && linkedTagSet.has(tag2);
    }

    public addMergedTag(tag1: string, tag2: string): this {
        let mergedTagSet: Set<string> | undefined;

        mergedTagSet = this._tagToMergedTagSet[tag1];
        if (!mergedTagSet) {
            mergedTagSet = new Set<string>();
            this._tagToMergedTagSet[tag1] = mergedTagSet;
        }
        mergedTagSet.add(tag2);

        mergedTagSet = this._tagToMergedTagSet[tag2];
        if (!mergedTagSet) {
            mergedTagSet = new Set<string>();
            this._tagToMergedTagSet[tag2] = mergedTagSet;
        }
        mergedTagSet.add(tag1);

        return this;
    }

    public removeMergedTag(tag1: string, tag2: string): this {
        let mergedTagSet: Set<string> | undefined;

        mergedTagSet = this._tagToMergedTagSet[tag1];
        if (mergedTagSet) {
            mergedTagSet.delete(tag2);
        }

        mergedTagSet = this._tagToMergedTagSet[tag2];
        if (mergedTagSet) {
            mergedTagSet.delete(tag1);
        }

        return this;
    }

    public hasMergedTag(tag1: string, tag2: string): boolean {
        const mergedTagSet: Set<string> | undefined =
            this._tagToMergedTagSet[tag1];
        return mergedTagSet && mergedTagSet.has(tag2);
    }

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

    _getMergedTagSet(tagSet: Set<string>): Set<string> {
        const overallMergedTagsSet: Set<string> = new Set<string>();
        const toVisit: string[] = Array.from(tagSet);
        const visited: Set<string> = new Set<string>();

        while (toVisit.length > 0) {
            const tag = toVisit.pop();
            if (!tag) {
                throw new Error("pop failed with positive length"); // stop 'maybe undefined' warning
            }
            visited.add(tag);
            overallMergedTagsSet.add(tag);
            const mergedTagSet: Set<string> | undefined =
                this._tagToMergedTagSet[tag];
            if (mergedTagSet) {
                for (const mergedTag of mergedTagSet) {
                    overallMergedTagsSet.add(tag);
                    if (!visited.has(mergedTag)) {
                        toVisit.push(mergedTag);
                    }
                }
            }
        }
        return overallMergedTagsSet;
    }

    _getAdjacentNodeSet(node: string): Set<string> {
        const tagSet: Set<string> | undefined = this._nodeToTagSet[node];
        const mergedTagSet: Set<string> = this._getMergedTagSet(tagSet);
        const adjNodeSet: Set<string> = new Set<string>();

        for (const tag of mergedTagSet) {
            const linkedTagSet = this._tagToLinkedTagSet[tag];
            console.log(`linked: ${Array.from(linkedTagSet).join(", ")}`);
            for (const linkedTag of linkedTagSet) {
                const nodeSet: Set<string> | undefined =
                    this._tagToNodeSet[linkedTag];
                console.log(
                    `linked node set: ${Array.from(nodeSet).join(", ")}`
                );
                if (nodeSet) {
                    for (const node of nodeSet) {
                        adjNodeSet.add(node);
                    }
                }
            }
        }

        console.log(`tagSet: ${Array.from(tagSet).join(", ")}`);
        console.log(`mergedTagSet: ${Array.from(mergedTagSet).join(", ")}`);
        console.log(`adj: ${Array.from(adjNodeSet).join(", ")}`);

        return adjNodeSet;
    }

    public get(origin: string, maxDistance: number): AdjacencyResult[] {
        const originAdjacencyResult: AdjacencyResult = {
            node: origin,
            distance: 0,
            path: [],
        };
        const nodeToAdjacencyResult: { [key: string]: AdjacencyResult } = {
            [origin]: originAdjacencyResult,
        };
        const toVisit: Set<AdjacencyResult> = new Set<AdjacencyResult>([
            originAdjacencyResult,
        ]);
        const visited: Set<string> = new Set<string>();

        while (toVisit.size > 0) {
            // Find the closest of the to-visit nodes.
            // A heap would be better but the size here is small.
            let closest: AdjacencyResult | undefined;
            for (const candidate of toVisit) {
                if (!closest || candidate.distance < closest.distance) {
                    closest = candidate;
                }
            }
            if (!closest) {
                throw new Error("no closest node but list was not empty");
            }
            toVisit.delete(closest);
            visited.add(closest.node);

            console.log(`closest: ${closest.node}`);

            if (closest.distance < maxDistance) {
                const adjNodeSet: Set<string> = this._getAdjacentNodeSet(
                    closest.node
                );
                for (const adjNode of adjNodeSet) {
                    console.log(`XXX ${adjNode}`);
                    if (!visited.has(adjNode)) {
                        // Add to result.
                        const isTransit = this._transitNodes.has(adjNode);
                        const extraDistance = isTransit ? 0 : 1;
                        const adjResult: AdjacencyResult = {
                            node: adjNode,
                            distance: closest.distance + extraDistance,
                            path: [...closest.path, adjNode],
                        };
                        nodeToAdjacencyResult[adjNode] = adjResult;

                        toVisit.add(adjResult);
                    }
                }
            }
        }
        return Object.values(nodeToAdjacencyResult);
    }
}
