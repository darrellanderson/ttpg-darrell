import { Adjacency } from "./adjacency";

it("constructor", () => {
    new Adjacency();
});

it("add/remove node link", () => {
    const adj = new Adjacency();
    const linkType = "my-linktype";
    const a = "my-a";
    const b = "my-b";
    expect(adj.hasNodeLink(linkType, a, b)).toBeFalsy();
    expect(adj.hasNodeLink(linkType, b, a)).toBeFalsy();

    adj.addNodeLink(linkType, a, b);
    expect(adj.hasNodeLink(linkType, a, b)).toBeTruthy();
    expect(adj.hasNodeLink(linkType, b, a)).toBeTruthy();

    adj.removeNodeLink(linkType, a, b);
    expect(adj.hasNodeLink(linkType, a, b)).toBeFalsy();
    expect(adj.hasNodeLink(linkType, b, a)).toBeFalsy();
});

it("add/remove node link (reverse)", () => {
    const adj = new Adjacency();
    const linkType = "my-linktype";
    const a = "my-a";
    const b = "my-b";
    expect(adj.hasNodeLink(linkType, a, b)).toBeFalsy();
    expect(adj.hasNodeLink(linkType, b, a)).toBeFalsy();

    adj.addNodeLink(linkType, b, a);
    expect(adj.hasNodeLink(linkType, a, b)).toBeTruthy();
    expect(adj.hasNodeLink(linkType, b, a)).toBeTruthy();

    adj.removeNodeLink(linkType, b, a);
    expect(adj.hasNodeLink(linkType, a, b)).toBeFalsy();
    expect(adj.hasNodeLink(linkType, b, a)).toBeFalsy();
});

it("add/remove node hub", () => {
    const adj = new Adjacency();
    const a = "my-a";
    const b = "my-b";
    const hubType = "my-linktype";
    expect(adj.hasNodeHub(a, hubType)).toBeFalsy();
    expect(adj.hasNodeHub(b, hubType)).toBeFalsy();

    adj.addNodeHub(hubType, a);
    adj.addNodeHub(hubType, b);
    expect(adj.hasNodeHub(a, hubType)).toBeTruthy();
    expect(adj.hasNodeHub(b, hubType)).toBeTruthy();

    adj.removeNodeHub(a, hubType);
    adj.removeNodeHub(b, hubType);
    expect(adj.hasNodeHub(hubType, a)).toBeFalsy();
});

it("add/remove hub link", () => {
    const adj = new Adjacency();
    const a = "my-a";
    const b = "my-b";
    expect(adj.hasHubLink(a, b)).toBeFalsy();
    expect(adj.hasHubLink(b, a)).toBeFalsy();

    adj.addHubLink(a, b);
    expect(adj.hasHubLink(a, b)).toBeTruthy();
    expect(adj.hasHubLink(b, a)).toBeTruthy();

    adj.removeHubLink(a, b);
    expect(adj.hasHubLink(a, b)).toBeFalsy();
    expect(adj.hasHubLink(b, a)).toBeFalsy();
});

it("add/remove hub link (reverse)", () => {
    const adj = new Adjacency();
    const a = "my-a";
    const b = "my-b";
    expect(adj.hasHubLink(a, b)).toBeFalsy();
    expect(adj.hasHubLink(b, a)).toBeFalsy();

    adj.addHubLink(b, a);
    expect(adj.hasHubLink(a, b)).toBeTruthy();
    expect(adj.hasHubLink(b, a)).toBeTruthy();

    adj.removeHubLink(b, a);
    expect(adj.hasHubLink(a, b)).toBeFalsy();
    expect(adj.hasHubLink(b, a)).toBeFalsy();
});

it("transitive hub link", () => {
    const adj = new Adjacency();
    const a = "my-a";
    const b = "my-b";
    const c = "my-c";
    const not = "my-not";
    adj.addHubLink(a, b);
    adj.addHubLink(c, b); // reverse order
    const adjHubs: string[] = adj._getTransitiveHubTypes(a);
    expect(adjHubs.includes(a)).toBeTruthy();
    expect(adjHubs.includes(b)).toBeTruthy();
    expect(adjHubs.includes(c)).toBeTruthy();
    expect(adjHubs.includes(not)).toBeFalsy();
});

it("getAdjacentAtDistanceArray (link)", () => {
    const a = "my-a";
    const b = "my-b";
    const b2 = "my-b";
    const c = "my-c";
    const d = "my-d";
    const linkType = "my-link-type";
    const adj = new Adjacency()
        .addNodeLink(linkType, a, b)
        .addNodeLink(linkType, a, b2)
        .addNodeLink(linkType, b, c)
        .addNodeLink(linkType, c, d);
    const maxDistance = 2;
    const adjAtDistance: Set<string>[] = adj.getAdjacentAtDistanceArray(
        a,
        maxDistance
    );
    expect(adjAtDistance.length).toEqual(maxDistance + 1);
    expect(adjAtDistance[0].size).toEqual(1);
    expect(adjAtDistance[0].has(a)).toBeTruthy();
    expect(adjAtDistance[1].size).toEqual(1);
    expect(adjAtDistance[1].has(b)).toBeTruthy();
    expect(adjAtDistance[2].size).toEqual(1);
    expect(adjAtDistance[2].has(c)).toBeTruthy();
});

it("getAdjacentAtDistanceArray (hub)", () => {
    const a = "my-a";
    const b = "my-b";
    const c = "my-c";
    const d = "my-d";
    const hubType = "my-hub-type";
    const hubType2 = "my-hub-type-2";
    const hubType3 = "my-hub-type-3";
    const adj = new Adjacency()
        .addNodeHub(a, hubType)
        .addNodeHub(b, hubType)
        .addNodeHub(b, hubType2)
        .addNodeHub(c, hubType2)
        .addNodeHub(c, hubType3)
        .addNodeHub(d, hubType3)
        .addHubLink(hubType, hubType2);
    const maxDistance = 2;
    const adjAtDistance: Set<string>[] = adj.getAdjacentAtDistanceArray(
        a,
        maxDistance
    );
    expect(adjAtDistance.length).toEqual(maxDistance + 1);
    expect(adjAtDistance[0].size).toEqual(1);
    expect(adjAtDistance[0].has(a)).toBeTruthy();
    expect(adjAtDistance[1].size).toEqual(2);
    expect(adjAtDistance[1].has(b)).toBeTruthy();
    expect(adjAtDistance[1].has(c)).toBeTruthy();
    expect(adjAtDistance[2].size).toEqual(1);
    expect(adjAtDistance[2].has(d)).toBeTruthy();
});
