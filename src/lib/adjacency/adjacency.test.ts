import { Adjacency, AdjacencyLinkType, AdjacencyPathType } from "./adjacency";

it("constructor", () => {
    new Adjacency();
});

it("removing a src node removes the outgoing edge", () => {
    const adj = new Adjacency();
    const edge: AdjacencyLinkType = {
        src: "my-src",
        dst: "my-dst",
        distance: 123,
        isTransit: false,
    };
    expect(adj.hasLink(edge)).toBeFalsy();

    adj.addLink(edge);
    expect(adj.hasLink(edge)).toBeTruthy();

    adj.removeNode("my-src");
    expect(adj.hasLink(edge)).toBeFalsy();
});

it("removing a dst node removes the incoming edge", () => {
    const adj = new Adjacency();
    const edge: AdjacencyLinkType = {
        src: "my-src",
        dst: "my-dst",
        distance: 123,
        isTransit: false,
    };
    expect(adj.hasLink(edge)).toBeFalsy();

    adj.addLink(edge);
    expect(adj.hasLink(edge)).toBeTruthy();

    adj.removeNode("my-dst");
    expect(adj.hasLink(edge)).toBeFalsy();
});

it("get", () => {
    // 00 10 20 30 40 50
    // 01 -- -- -- -- 51
    const adj = new Adjacency()
        // Top row
        .addLink({ src: "00", dst: "10", distance: 1, isTransit: false })
        .addLink({ src: "10", dst: "20", distance: 1, isTransit: false })
        .addLink({ src: "20", dst: "30", distance: 1, isTransit: false })
        .addLink({ src: "30", dst: "40", distance: 1, isTransit: false })
        .addLink({ src: "40", dst: "50", distance: 1, isTransit: false })
        // Bottom row, transit interior edges
        .addLink({ src: "01", dst: "11", distance: 0.5, isTransit: true })
        .addLink({ src: "11", dst: "21", distance: 0, isTransit: true })
        .addLink({ src: "21", dst: "31", distance: 0, isTransit: true })
        .addLink({ src: "31", dst: "41", distance: 0, isTransit: true })
        .addLink({ src: "41", dst: "51", distance: 0.5, isTransit: false })
        // Top to bottom at edges.
        .addLink({ src: "00", dst: "01", distance: 1, isTransit: false })
        .addLink({ src: "50", dst: "51", distance: 1, isTransit: false });

    const adjList: ReadonlyArray<AdjacencyPathType> = adj.get("00", 100);

    const getAdjList = (
        minDistance: number,
        maxDistance: number
    ): ReadonlyArray<AdjacencyPathType> => {
        return adjList.filter(
            (path) =>
                path.distance >= minDistance && path.distance <= maxDistance
        );
    };

    expect(getAdjList(0, 0.1)).toEqual([]);

    expect(getAdjList(0, 1.1)).toEqual([
        {
            distance: 1,
            node: "01",
            path: [{ distance: 1, dst: "01", isTransit: false, src: "00" }],
        },
        {
            distance: 1,
            node: "10",
            path: [{ distance: 1, dst: "10", isTransit: false, src: "00" }],
        },
    ]);

    expect(getAdjList(1.1, 2.1)).toEqual([
        {
            distance: 2,
            node: "20",
            path: [
                { distance: 1, dst: "10", isTransit: false, src: "00" },
                { distance: 1, dst: "20", isTransit: false, src: "10" },
            ],
        },
        {
            // Transit path.
            distance: 2,
            node: "51",
            path: [
                { distance: 1, dst: "01", isTransit: false, src: "00" },
                { distance: 0.5, dst: "11", isTransit: true, src: "01" },
                { distance: 0, dst: "21", isTransit: true, src: "11" },
                { distance: 0, dst: "31", isTransit: true, src: "21" },
                { distance: 0, dst: "41", isTransit: true, src: "31" },
                { distance: 0.5, dst: "51", isTransit: false, src: "41" },
            ],
        },
    ]);

    expect(getAdjList(2.1, 3.1)).toEqual([
        {
            distance: 3,
            node: "30",
            path: [
                { distance: 1, dst: "10", isTransit: false, src: "00" },
                { distance: 1, dst: "20", isTransit: false, src: "10" },
                { distance: 1, dst: "30", isTransit: false, src: "20" },
            ],
        },
    ]);

    expect(getAdjList(3.1, 4.1)).toEqual([
        {
            distance: 4,
            node: "40",
            path: [
                { distance: 1, dst: "10", isTransit: false, src: "00" },
                { distance: 1, dst: "20", isTransit: false, src: "10" },
                { distance: 1, dst: "30", isTransit: false, src: "20" },
                { distance: 1, dst: "40", isTransit: false, src: "30" },
            ],
        },
    ]);
});
