import { CreateCardsheet } from "./create-cardsheet";
import { CreateCardsheetParams } from "./create-cardsheet-params";

it("fromParamsJson", () => {
    const paramsJson: Buffer = Buffer.from(
        JSON.stringify({
            assetFilename: "my-asset-filename",
            templateName: "my-template-name",
            cardSizePixel: { width: 1, height: 2 },
            cardSizeWorld: { width: 4, height: 8 },
            cards: [],
        })
    );
    CreateCardsheet.fromParamsJson(paramsJson);
});

it("constructor", () => {
    const params: CreateCardsheetParams = {
        assetFilename: "my-asset-filename",
        templateName: "my-template-name",
        cardSizePixel: { width: 1, height: 2 },
        cardSizeWorld: { width: 4, height: 8 },
        cards: [],
    };
    new CreateCardsheet(params);
});
