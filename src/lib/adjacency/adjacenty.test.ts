import exp from "constants";
import { Adjacency } from "./adjacency";

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

    adj.addNodeTags(node, [tag1, tag2, tag3]);
    expect(adj.hasNodeTag(node, tag1)).toBeTruthy();
    expect(adj.hasNodeTag(node, tag2)).toBeTruthy();
    expect(adj.hasNodeTag(node, tag3)).toBeTruthy();

    adj.removeNodeTags(node, [tag1, tag3]);
    expect(adj.hasNodeTag(node, tag1)).toBeFalsy();
    expect(adj.hasNodeTag(node, tag2)).toBeTruthy();
    expect(adj.hasNodeTag(node, tag3)).toBeFalsy();
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

it("_getNodeToTagSets", () => {
    const adj = new Adjacency();
    const node = "my-node";
    const tag1 = "my-tag-1";
    const tag2 = "my-tag-2";
    const tag3 = "my-tag-3";

    let nodeToTagSets: { [key: string]: Set<string> } = {};
    let tagSet: Set<string> | undefined;
    let tagList: string[] | undefined;

    nodeToTagSets = adj._getNodeToTagSets();
    tagSet = nodeToTagSets[node];
    tagList = (tagSet ? Array.from(tagSet) : []).sort();
    expect(tagList).toEqual([]);

    adj.addNodeTags(node, [tag1, tag2]);
    nodeToTagSets = adj._getNodeToTagSets();
    tagSet = nodeToTagSets[node];
    tagList = (tagSet ? Array.from(tagSet) : []).sort();
    expect(tagList).toEqual([tag1, tag2]);

    adj.addNodeTags(node, [tag3]);
    nodeToTagSets = adj._getNodeToTagSets();
    tagSet = nodeToTagSets[node];
    tagList = (tagSet ? Array.from(tagSet) : []).sort();
    expect(tagList).toEqual([tag1, tag2, tag3]);

    adj.removeNodeTags(node, [tag2]);
    nodeToTagSets = adj._getNodeToTagSets();
    tagSet = nodeToTagSets[node];
    tagList = (tagSet ? Array.from(tagSet) : []).sort();
    expect(tagList).toEqual([tag1, tag3]);
});

it("_getTransitiveTagSet", () => {
    const adj = new Adjacency();
    const node = "my-node";
    const tag1 = "my-tag-1";
    const tag2 = "my-tag-2";
    const tag3 = "my-tag-3";
    const tag4 = "my-tag-4";
    const tag5 = "my-tag-5";

    const tag1and4Set = new Set<string>().add(tag1).add(tag4);
    let transitiveTagSet: Set<string> | undefined;
    transitiveTagSet = adj._getTransitiveTagSet(tag1and4Set);
    expect(transitiveTagSet?.has(tag1)).toBeFalsy();
    expect(transitiveTagSet?.has(tag2)).toBeFalsy();
    expect(transitiveTagSet?.has(tag3)).toBeFalsy();
    expect(transitiveTagSet?.has(tag4)).toBeFalsy();
    expect(transitiveTagSet?.has(tag5)).toBeFalsy();

    adj.addLink(tag1, tag1);
    transitiveTagSet = adj._getTransitiveTagSet(tag1and4Set);
    expect(transitiveTagSet?.has(tag1)).toBeTruthy();
    expect(transitiveTagSet?.has(tag2)).toBeFalsy();
    expect(transitiveTagSet?.has(tag3)).toBeFalsy();
    expect(transitiveTagSet?.has(tag4)).toBeFalsy();
    expect(transitiveTagSet?.has(tag5)).toBeFalsy();

    adj.addLink(tag1, tag2);
    transitiveTagSet = adj._getTransitiveTagSet(tag1and4Set);
    expect(transitiveTagSet?.has(tag1)).toBeTruthy();
    expect(transitiveTagSet?.has(tag2)).toBeTruthy();
    expect(transitiveTagSet?.has(tag3)).toBeFalsy();
    expect(transitiveTagSet?.has(tag4)).toBeFalsy();
    expect(transitiveTagSet?.has(tag5)).toBeFalsy();

    adj.addLink(tag2, tag3);
    transitiveTagSet = adj._getTransitiveTagSet(tag1and4Set);
    expect(transitiveTagSet?.has(tag1)).toBeTruthy();
    expect(transitiveTagSet?.has(tag2)).toBeTruthy();
    expect(transitiveTagSet?.has(tag3)).toBeTruthy();
    expect(transitiveTagSet?.has(tag4)).toBeFalsy();
    expect(transitiveTagSet?.has(tag5)).toBeFalsy();

    adj.removeLink(tag1, tag2);
    transitiveTagSet = adj._getTransitiveTagSet(tag1and4Set);
    expect(transitiveTagSet?.has(tag1)).toBeTruthy();
    expect(transitiveTagSet?.has(tag2)).toBeFalsy();
    expect(transitiveTagSet?.has(tag3)).toBeFalsy();
    expect(transitiveTagSet?.has(tag4)).toBeFalsy();
    expect(transitiveTagSet?.has(tag5)).toBeFalsy();

    adj.addLink(tag4, tag5);
    transitiveTagSet = adj._getTransitiveTagSet(tag1and4Set);
    expect(transitiveTagSet?.has(tag1)).toBeTruthy();
    expect(transitiveTagSet?.has(tag2)).toBeFalsy();
    expect(transitiveTagSet?.has(tag3)).toBeFalsy();
    expect(transitiveTagSet?.has(tag4)).toBeTruthy();
    expect(transitiveTagSet?.has(tag5)).toBeTruthy();
});
