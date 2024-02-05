/**
 * Nodes have tags, links connect tags.
 *
 * Links are transitive:
 * - add link1:a-b
 * - add link2:b-c
 * - implicit link:a-c
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
export type AdjacencyNode = {
    node: string;
    tags: string[];
};
export type AdjacencyLink = {
    tags: string[];
    overrideDistance: number | undefined; // defaults to 1
};

export class Adjacency {
    private readonly _tagToNodeSet: { [key: string]: Set<string> } = {};
    private readonly _tagToLinkedTagsSet: { [key: string]: Set<string> } = {};
    private readonly _transitNodes: Set<string> = new Set<string>();

    public addNodeTags(node: string, tags: string[]): this {
        let nodeSet: Set<string> | undefined;
        for (const tag of tags) {
            nodeSet = this._tagToNodeSet[tag];
            if (!nodeSet) {
                nodeSet = new Set<string>();
                this._tagToNodeSet[tag] = nodeSet;
            }
            nodeSet.add(node);
        }
        return this;
    }

    public removeNodeTags(node: string, tags: string[]): this {
        let nodeSet: Set<string> | undefined;
        for (const tag of tags) {
            nodeSet = this._tagToNodeSet[tag];
            if (nodeSet) {
                nodeSet.delete(node);
            }
        }
        return this;
    }

    public hasNodeTag(node: string, tag: string): boolean {
        const nodeSet: Set<string> | undefined = this._tagToNodeSet[tag];
        return nodeSet && nodeSet.has(node);
    }

    public addLink(tag1: string, tag2: string): this {
        let linkedTagSet: Set<string> | undefined;

        // 1 -> 2.
        linkedTagSet = this._tagToLinkedTagsSet[tag1];
        if (!linkedTagSet) {
            linkedTagSet = new Set<string>();
            this._tagToLinkedTagsSet[tag1] = linkedTagSet;
        }
        linkedTagSet.add(tag2);

        // 2 -> 1.
        linkedTagSet = this._tagToLinkedTagsSet[tag2];
        if (!linkedTagSet) {
            linkedTagSet = new Set<string>();
            this._tagToLinkedTagsSet[tag2] = linkedTagSet;
        }
        linkedTagSet.add(tag1);

        return this;
    }

    public removeLink(tag1: string, tag2: string): this {
        let linkedTagSet: Set<string> | undefined;

        // 1 -> 2.
        linkedTagSet = this._tagToLinkedTagsSet[tag1];
        if (linkedTagSet) {
            linkedTagSet.delete(tag2);
        }

        // 2 -> 1.
        linkedTagSet = this._tagToLinkedTagsSet[tag2];
        if (linkedTagSet) {
            linkedTagSet.delete(tag1);
        }

        return this;
    }

    public hasLink(tag1: string, tag2: string): boolean {
        const linkedTagSet: Set<string> | undefined =
            this._tagToLinkedTagsSet[tag1];
        return linkedTagSet && linkedTagSet.has(tag2);
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

    _getNodeToTagSets(): { [key: string]: Set<string> } {
        const nodeToTags: { [key: string]: Set<string> } = {};
        for (const [tag, nodes] of Object.entries(this._tagToNodeSet)) {
            for (const node of nodes) {
                let tagSet: Set<string> | undefined = nodeToTags[node];
                if (!tagSet) {
                    tagSet = new Set<string>();
                    nodeToTags[node] = tagSet;
                }
                tagSet.add(tag);
            }
        }
        return nodeToTags;
    }

    _getTagToTransitiveTagSet(): { [key: string]: Set<string> | undefined } {
        const tagToTransitiveTags: { [key: string]: Set<string> } = {};

        for (const originTag of Object.keys(this._tagToLinkedTagsSet)) {
            const transitiveTags: Set<string> = new Set<string>();
            const toVisit: string[] = [];
            const visited: Set<string> = new Set<string>();

            const linkedTagSet: Set<string> =
                this._tagToLinkedTagsSet[originTag];
            toVisit.push(...Array.from(linkedTagSet));

            while (toVisit.length > 0) {
                const tag = toVisit.pop();
                if (!tag) {
                    throw new Error("pop failed with positive length"); // stop 'maybe undefined' warning
                }
                transitiveTags.add(tag);
                visited.add(tag);
                const linkedTagSet: Set<string> | undefined =
                    this._tagToLinkedTagsSet[tag];
                if (linkedTagSet) {
                    for (const linkedTag of linkedTagSet) {
                        if (!visited.has(linkedTag)) {
                            toVisit.push(linkedTag);
                        }
                    }
                }
            }
        }

        return tagToTransitiveTags;
    }

    //public get(origin: string, maxDistance: number) : [] {
    //    // Compute node to tags.
    //}
}
