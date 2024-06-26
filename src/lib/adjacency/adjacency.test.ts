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
    expect(adj._hasTagNode(tag1, node)).toBeFalsy();
    expect(adj._hasTagNode(tag2, node)).toBeFalsy();
    expect(adj._hasTagNode(tag3, node)).toBeFalsy();

    adj.addNodeTags(node, [tag1, tag2, tag3]);
    expect(adj.hasNodeTag(node, tag1)).toBeTruthy();
    expect(adj.hasNodeTag(node, tag2)).toBeTruthy();
    expect(adj.hasNodeTag(node, tag3)).toBeTruthy();
    expect(adj._hasTagNode(tag1, node)).toBeTruthy();
    expect(adj._hasTagNode(tag2, node)).toBeTruthy();
    expect(adj._hasTagNode(tag3, node)).toBeTruthy();

    adj.removeNodeTags(node, [tag1, tag3]);
    expect(adj.hasNodeTag(node, tag1)).toBeFalsy();
    expect(adj.hasNodeTag(node, tag2)).toBeTruthy();
    expect(adj.hasNodeTag(node, tag3)).toBeFalsy();
    expect(adj._hasTagNode(tag1, node)).toBeFalsy();
    expect(adj._hasTagNode(tag2, node)).toBeTruthy();
    expect(adj._hasTagNode(tag3, node)).toBeFalsy();
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

it("_getAdjacentNodeSet", () => {
    const adj = new Adjacency()
        .addNodeTags("00", ["tag-00"])
        .addNodeTags("10", ["tag-10"])
        .addNodeTags("20", ["tag-20"])
        .addLink("tag-00", "tag-10")
        .addLink("tag-10", "tag-20");
    let adjNodeSet: Set<string>;
    let adjNodeList: Array<string>;

    adjNodeSet = adj._getAdjacentNodeSet("00");
    adjNodeList = Array.from(adjNodeSet).sort();
    expect(adjNodeList).toEqual(["10"]);

    adjNodeSet = adj._getAdjacentNodeSet("10");
    adjNodeList = Array.from(adjNodeSet).sort();
    expect(adjNodeList).toEqual(["00", "20"]);

    adjNodeSet = adj._getAdjacentNodeSet("20");
    adjNodeList = Array.from(adjNodeSet).sort();
    expect(adjNodeList).toEqual(["10"]);
});

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

    let adjList: Array<AdjacencyResult> = [];
    const getAdjList = (minDistance: number, maxDistance: number) => {
        adjList = adj
            .get("00", maxDistance)
            .filter((x) => x.distance >= minDistance);
    };

    getAdjList(0, 0);
    expect(adjList).toEqual([{ distance: 0, node: "00", path: ["00"] }]);

    getAdjList(0, 1);
    expect(adjList).toEqual([
        { distance: 0, node: "00", path: ["00"] },
        { distance: 1, node: "01", path: ["00", "01"] },
        { distance: 1, node: "10", path: ["00", "10"] },
    ]);

    getAdjList(1, 2);
    expect(adjList).toEqual([
        { distance: 1, node: "01", path: ["00", "01"] },
        { distance: 1, node: "10", path: ["00", "10"] },
        { distance: 2, node: "20", path: ["00", "10", "20"] },
        {
            distance: 2,
            node: "51",
            path: ["00", "01", "11", "21", "31", "41", "51"],
        },
    ]);

    getAdjList(2, 3);
    expect(adjList).toEqual([
        { distance: 2, node: "20", path: ["00", "10", "20"] },
        {
            distance: 2,
            node: "51",
            path: ["00", "01", "11", "21", "31", "41", "51"],
        },
        { distance: 3, node: "30", path: ["00", "10", "20", "30"] },
        {
            distance: 3,
            node: "50",
            path: ["00", "01", "11", "21", "31", "41", "51", "50"],
        },
    ]);
});

it("get (hub link)", () => {
    const adj = new Adjacency()
        .addNodeTags("node-a", ["tag-alpha"])
        .addNodeTags("node-b", ["tag-alpha"]);

    let adjList: Array<AdjacencyResult>;
    adjList = adj.get("node-a", 1);
    expect(adjList).toEqual([
        { distance: 0, node: "node-a", path: ["node-a"] },
    ]);

    adj.addLink("tag-alpha", "tag-alpha");

    adjList = adj.get("node-a", 1);
    expect(adjList).toEqual([
        { distance: 0, node: "node-a", path: ["node-a"] },
        { distance: 1, node: "node-b", path: ["node-a", "node-b"] },
    ]);
});
