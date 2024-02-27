import { CreateD6 } from "./create-d6";
import { CreateD6Params } from "./create-d6-params";

it("constuctor", () => {
    const params: CreateD6Params = {
        assetFilename: "my-asset-filename",
        faceSizePixel: { width: 1, height: 1 },
        templateName: "my-template-name",
        faces: [],
    };
    new CreateD6(params);
});
