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

it("_getTagToTransitiveTagSet", () => {
    const adj = new Adjacency();
    const node = "my-node";
    const tag1 = "my-tag-1";
    const tag2 = "my-tag-2";
    const tag3 = "my-tag-3";

    let tagToTransitiveTagSet: { [key: string]: Set<string> | undefined } = {};
    let tag1TransitiveTagSet: Set<string> | undefined;

    tagToTransitiveTagSet = adj._getTagToTransitiveTagSet();
    tag1TransitiveTagSet = tagToTransitiveTagSet[tag1];
    expect(tag1TransitiveTagSet).toBeUndefined();

    adj.addLink(tag1, tag1);
    tagToTransitiveTagSet = adj._getTagToTransitiveTagSet();
    tag1TransitiveTagSet = tagToTransitiveTagSet[tag1];
    expect(tag1TransitiveTagSet?.has(tag1)).toBeTruthy();
    expect(tag1TransitiveTagSet?.has(tag2)).toBeFalsy();
    expect(tag1TransitiveTagSet?.has(tag3)).toBeFalsy();

    adj.addLink(tag1, tag2);
    tagToTransitiveTagSet = adj._getTagToTransitiveTagSet();
    tag1TransitiveTagSet = tagToTransitiveTagSet[tag1];
    tag1TransitiveTagSet = tagToTransitiveTagSet[tag1];
    expect(tag1TransitiveTagSet?.has(tag1)).toBeTruthy();
    expect(tag1TransitiveTagSet?.has(tag2)).toBeTruthy();
    expect(tag1TransitiveTagSet?.has(tag3)).toBeFalsy();

    adj.addLink(tag2, tag3);
    tagToTransitiveTagSet = adj._getTagToTransitiveTagSet();
    tag1TransitiveTagSet = tagToTransitiveTagSet[tag1];
    expect(tag1TransitiveTagSet?.has(tag1)).toBeTruthy();
    expect(tag1TransitiveTagSet?.has(tag2)).toBeTruthy();
    expect(tag1TransitiveTagSet?.has(tag3)).toBeTruthy();

    adj.removeLink(tag1, tag2);
    tagToTransitiveTagSet = adj._getTagToTransitiveTagSet();
    tag1TransitiveTagSet = tagToTransitiveTagSet[tag1];
    expect(tag1TransitiveTagSet?.has(tag1)).toBeTruthy();
    expect(tag1TransitiveTagSet?.has(tag2)).toBeFalsy();
    expect(tag1TransitiveTagSet?.has(tag3)).toBeFalsy();
});
