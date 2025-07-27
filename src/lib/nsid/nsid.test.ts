import { MockCard, MockCardDetails, MockGameObject } from "ttpg-mock";
import { DECK_NSID, NSID, ParsedNSID } from "./nsid";

it("get (GameObject)", () => {
    const metadata = "my-type:my-source/my-name|my-extra-1|my-extra-2";
    const obj = new MockGameObject({ templateMetadata: metadata });
    const nsid = NSID.get(obj);
    expect(nsid).toEqual("my-type:my-source/my-name");
    const extras = NSID.getExtras(obj);
    expect(extras).toEqual(["my-extra-1", "my-extra-2"]);
});

it("get (singleton Card)", () => {
    const metadata = "my-type:my-source/my-name|my-extra";
    const card = new MockCard({
        cardDetails: [new MockCardDetails({ metadata })],
    });
    const nsid = NSID.get(card);
    expect(nsid).toEqual("my-type:my-source/my-name");
    const extras = NSID.getExtras(card);
    expect(extras).toEqual(["my-extra"]);
});

it("get (deck)", () => {
    const metadata1 = "my-type1:my-source1/my-name1|my-extra1";
    const metadata2 = "my-type2:my-source2/my-name2|my-extra2";
    const deck = new MockCard({
        cardDetails: [
            new MockCardDetails({ metadata: metadata1 }),
            new MockCardDetails({ metadata: metadata2 }),
        ],
    });
    const nsid = NSID.get(deck);
    expect(nsid).toEqual(DECK_NSID);
});

it("getDeck (deck)", () => {
    const metadata1 = "my-type1:my-source1/my-name1|my-extra1";
    const metadata2 = "my-type2:my-source2/my-name2|my-extra2";
    const deck = new MockCard({
        cardDetails: [
            new MockCardDetails({ metadata: metadata1 }),
            new MockCardDetails({ metadata: metadata2 }),
        ],
    });
    const nsids = NSID.getDeck(deck);
    expect(nsids.length).toEqual(2);
    expect(nsids[0]).toEqual("my-type1:my-source1/my-name1");
    expect(nsids[1]).toEqual("my-type2:my-source2/my-name2");
});

it("getDeckWithExtras (deck)", () => {
    const metadata1 = "my-type1:my-source1/my-name1|my-extra1";
    const metadata2 = "my-type2:my-source2/my-name2|my-extra2";
    const deck = new MockCard({
        cardDetails: [
            new MockCardDetails({ metadata: metadata1 }),
            new MockCardDetails({ metadata: metadata2 }),
        ],
    });
    const nsids = NSID.getDeckWithExtras(deck);
    expect(nsids.length).toEqual(2);
    expect(nsids[0]).toEqual(metadata1);
    expect(nsids[1]).toEqual(metadata2);
});

it("parse (with extra)", () => {
    const metadata = "type1.type2:source1.source2/name1.name2|extra1|extra2";
    const parsed: ParsedNSID | undefined = NSID.parse(metadata);
    expect(parsed).toEqual({
        extras: ["extra1", "extra2"],
        nameParts: ["name1", "name2"],
        nsid: "type1.type2:source1.source2/name1.name2|extra1|extra2",
        sourceParts: ["source1", "source2"],
        typeParts: ["type1", "type2"],
    });
});

it("parse (no extra)", () => {
    const metadata = "type1.type2:source1.source2/name1.name2";
    const parsed: ParsedNSID | undefined = NSID.parse(metadata);
    expect(parsed).toEqual({
        extra: undefined,
        nameParts: ["name1", "name2"],
        nsid: "type1.type2:source1.source2/name1.name2",
        sourceParts: ["source1", "source2"],
        typeParts: ["type1", "type2"],
    });
});

it("parse (fail)", () => {
    const metadata = "not-nsid";
    const parsed: ParsedNSID | undefined = NSID.parse(metadata);
    expect(parsed).toBeUndefined();
});
