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

it("add/remove node hub", () => {
    const adj = new Adjacency();
    const hubType = "my-linktype";
    const a = "my-a";
    expect(adj.hasNodeHub(hubType, a)).toBeFalsy();

    adj.addNodeHub(hubType, a);
    expect(adj.hasNodeHub(hubType, a)).toBeTruthy();

    adj.removeNodeHub(hubType, a);
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
