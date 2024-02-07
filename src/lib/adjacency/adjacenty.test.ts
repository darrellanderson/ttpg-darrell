import { Adjacency, AdjacencyResult } from "./adjacency";

it("constructor", () => {
    new Adjacency();
});

it("add/remove node tag", () => {
    const adj = new Adjacency();
    const node = "my-node";
    const tag1 = "my-tag-1";
    const tag2 = "my-tag-2";
    const tag3 = "my-tag-3";
    expect(adj.hasNodeTag(node, tag1)).toBeFalsy();
    expect(adj.hasNodeTag(node, tag2)).toBeFalsy();
    expect(adj.hasNodeTag(node, tag3)).toBeFalsy();
    expect(adj.hasTagNode(tag1, node)).toBeFalsy();
    expect(adj.hasTagNode(tag1, node)).toBeFalsy();
    expect(adj.hasTagNode(tag1, node)).toBeFalsy();

    adj.addNodeTags(node, [tag1, tag2, tag3]);
    expect(adj.hasNodeTag(node, tag1)).toBeTruthy();
    expect(adj.hasNodeTag(node, tag2)).toBeTruthy();
    expect(adj.hasNodeTag(node, tag3)).toBeTruthy();
    expect(adj.hasTagNode(tag1, node)).toBeTruthy();
    expect(adj.hasTagNode(tag1, node)).toBeTruthy();
    expect(adj.hasTagNode(tag1, node)).toBeTruthy();

    adj.removeNodeTags(node, [tag1, tag3]);
    expect(adj.hasNodeTag(node, tag1)).toBeFalsy();
    expect(adj.hasNodeTag(node, tag2)).toBeTruthy();
    expect(adj.hasNodeTag(node, tag3)).toBeFalsy();
    expect(adj.hasTagNode(tag1, node)).toBeTruthy();
    expect(adj.hasTagNode(tag1, node)).toBeFalsy();
    expect(adj.hasTagNode(tag1, node)).toBeTruthy();
});

it("add/remove link", () => {
    const adj = new Adjacency();
    const tag1 = "my-tag-1";
    const tag2 = "my-tag-2";
    expect(adj.hasLink(tag1, tag2)).toBeFalsy();
    expect(adj.hasLink(tag2, tag1)).toBeFalsy();

    adj.addLink(tag1, tag2);
    expect(adj.hasLink(tag1, tag2)).toBeTruthy();
    expect(adj.hasLink(tag2, tag1)).toBeTruthy();

    adj.removeLink(tag1, tag2);
    expect(adj.hasLink(tag1, tag2)).toBeFalsy();
    expect(adj.hasLink(tag2, tag1)).toBeFalsy();
});

it("add/remove link (reverse arg order)", () => {
    const adj = new Adjacency();
    const tag1 = "my-tag-1";
    const tag2 = "my-tag-2";
    expect(adj.hasLink(tag1, tag2)).toBeFalsy();
    expect(adj.hasLink(tag2, tag1)).toBeFalsy();

    adj.addLink(tag2, tag1);
    expect(adj.hasLink(tag1, tag2)).toBeTruthy();
    expect(adj.hasLink(tag2, tag1)).toBeTruthy();

    adj.removeLink(tag2, tag1);
    expect(adj.hasLink(tag1, tag2)).toBeFalsy();
    expect(adj.hasLink(tag2, tag1)).toBeFalsy();
});

it("add/remove transit node", () => {
    const adj = new Adjacency();
    const node = "my-node";
    expect(adj.hasTransitNode(node)).toBeFalsy();

    adj.addTransitNode(node);
    expect(adj.hasTransitNode(node)).toBeTruthy();

    adj.removeTransitNode(node);
    expect(adj.hasTransitNode(node)).toBeFalsy();
});

it("_getMergedTagSet", () => {
    const adj = new Adjacency();
    const tag1 = "my-tag-1";
    const tag2 = "my-tag-2";
    const tag3 = "my-tag-3";
    const tag4 = "my-tag-4";
    const tag5 = "my-tag-5";

    const tag1and4Set = new Set<string>().add(tag1).add(tag4);
    let mergedTagSet: Set<string> | undefined;
    mergedTagSet = adj._getMergedTagSet(tag1and4Set);
    expect(mergedTagSet?.has(tag1)).toBeTruthy();
    expect(mergedTagSet?.has(tag2)).toBeFalsy();
    expect(mergedTagSet?.has(tag3)).toBeFalsy();
    expect(mergedTagSet?.has(tag4)).toBeTruthy();
    expect(mergedTagSet?.has(tag5)).toBeFalsy();

    adj.addMergedTag(tag1, tag1);
    mergedTagSet = adj._getMergedTagSet(tag1and4Set);
    expect(mergedTagSet?.has(tag1)).toBeTruthy();
    expect(mergedTagSet?.has(tag2)).toBeFalsy();
    expect(mergedTagSet?.has(tag3)).toBeFalsy();
    expect(mergedTagSet?.has(tag4)).toBeTruthy();
    expect(mergedTagSet?.has(tag5)).toBeFalsy();

    adj.addMergedTag(tag1, tag2);
    mergedTagSet = adj._getMergedTagSet(tag1and4Set);
    expect(mergedTagSet?.has(tag1)).toBeTruthy();
    expect(mergedTagSet?.has(tag2)).toBeTruthy();
    expect(mergedTagSet?.has(tag3)).toBeFalsy();
    expect(mergedTagSet?.has(tag4)).toBeTruthy();
    expect(mergedTagSet?.has(tag5)).toBeFalsy();

    adj.addMergedTag(tag2, tag3);
    mergedTagSet = adj._getMergedTagSet(tag1and4Set);
    expect(mergedTagSet?.has(tag1)).toBeTruthy();
    expect(mergedTagSet?.has(tag2)).toBeTruthy();
    expect(mergedTagSet?.has(tag3)).toBeTruthy();
    expect(mergedTagSet?.has(tag4)).toBeTruthy();
    expect(mergedTagSet?.has(tag5)).toBeFalsy();

    adj.removeMergedTag(tag1, tag2);
    mergedTagSet = adj._getMergedTagSet(tag1and4Set);
    expect(mergedTagSet?.has(tag1)).toBeTruthy();
    expect(mergedTagSet?.has(tag2)).toBeFalsy();
    expect(mergedTagSet?.has(tag3)).toBeFalsy();
    expect(mergedTagSet?.has(tag4)).toBeTruthy();
    expect(mergedTagSet?.has(tag5)).toBeFalsy();

    adj.addMergedTag(tag4, tag5);
    mergedTagSet = adj._getMergedTagSet(tag1and4Set);
    expect(mergedTagSet?.has(tag1)).toBeTruthy();
    expect(mergedTagSet?.has(tag2)).toBeFalsy();
    expect(mergedTagSet?.has(tag3)).toBeFalsy();
    expect(mergedTagSet?.has(tag4)).toBeTruthy();
    expect(mergedTagSet?.has(tag5)).toBeTruthy();
});

it("", () => {
    const adj = new Adjacency()
        .addNodeTags("00", ["tag-00"])
        .addNodeTags("10", ["tag-10"])
        .addLink("tag-00", "tag-10");
    const adjNodeSet: Set<string> = adj._getAdjacentNodeSet("00");
    const adjNodeList: string[] = Array.from(adjNodeSet).sort();
    expect(adjNodeList).toEqual("");
});

/*
it("get", () => {
    // 00 10 20 30 40 50
    // 01 -- -- -- -- 51
    const adj = new Adjacency()
        .addNodeTags("00", ["tag-00"])
        .addNodeTags("10", ["tag-10"])
        .addNodeTags("20", ["tag-20"])
        .addNodeTags("30", ["tag-30"])
        .addNodeTags("40", ["tag-40"])
        .addNodeTags("50", ["tag-50"])
        .addNodeTags("01", ["tag-01"])
        .addNodeTags("11", ["tag-11"])
        .addNodeTags("21", ["tag-21"])
        .addNodeTags("31", ["tag-31"])
        .addNodeTags("41", ["tag-41"])
        .addNodeTags("51", ["tag-51"])
        .addTransitNode("11")
        .addTransitNode("21")
        .addTransitNode("31")
        .addTransitNode("41")
        .addLink("tag-00", "tag-10")
        .addLink("tag-10", "tag-20")
        .addLink("tag-20", "tag-30")
        .addLink("tag-40", "tag-50")
        .addLink("tag-00", "tag-01")
        .addLink("tag-01", "tag-11")
        .addLink("tag-11", "tag-21")
        .addLink("tag-21", "tag-31")
        .addLink("tag-31", "tag-41")
        .addLink("tag-41", "tag-51")
        .addLink("tag-51", "tag-50");

    let adjList: AdjacencyResult[] = [];
    const getAndSortAdjList = (maxDistance: number) => {
        adjList = adj.get("00", maxDistance);
        adjList.sort((a, b) => {
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
    };

    getAndSortAdjList(2);

    expect(adjList).toEqual("");
});
*/
