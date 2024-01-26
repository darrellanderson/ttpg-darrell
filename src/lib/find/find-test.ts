import { MockCard, MockCardDetails, mockWorld } from "ttpg-mock";
import { Find } from "./find";
import { Card } from "@tabletop-playground/api";

it("findCard", () => {
    const nsid = "my-nsid";
    const card = new MockCard({
        cardDetails: [new MockCardDetails({ metadata: nsid })],
    });
    mockWorld._reset({ gameObjects: [card] });

    const find = new Find();
    const found: Card | undefined = find.findCard(nsid);
    expect(found).toEqual(card);
});
