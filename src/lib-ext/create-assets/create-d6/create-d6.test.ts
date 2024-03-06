import { CreateD6 } from "./create-d6";
import { CreateD6Params } from "./create-d6-params";

it("static", () => {
    const params: CreateD6Params = {
        assetFilename: "my-asset-filename",
        faceSizePixel: { width: 1, height: 1 },
        templateName: "my-template-name",
        faces: [],
    };
    CreateD6.fromParamsJson(Buffer.from(JSON.stringify(params)));
});

it("constuctor", () => {
    const params: CreateD6Params = {
        assetFilename: "my-asset-filename",
        faceSizePixel: { width: 1, height: 1 },
        templateName: "my-template-name",
        faces: [],
    };
    new CreateD6(params);
});

it("_createD6Image", async () => {
    const faceImage = {
        image: {
            type: "SolidCell",
            width: 1,
            height: 1,
            color: "#ff0000",
        },
    };
    const params: CreateD6Params = {
        assetFilename: "my-asset-filename",
        faceSizePixel: { width: 1, height: 1 },
        templateName: "my-template-name",
        faces: [
            faceImage,
            faceImage,
            faceImage,
            faceImage,
            faceImage,
            faceImage,
        ],
    };
    const createD6 = new CreateD6(params);
    //await createD6._createD6Image();
    await createD6.toFileData();
});

it("_createD6Image (no face)", async () => {
    const params: CreateD6Params = {
        assetFilename: "my-asset-filename",
        faceSizePixel: { width: 1, height: 1 },
        templateName: "my-template-name",
        faces: [],
    };
    const createD6 = new CreateD6(params);
    expect(() => {
        createD6._createD6Image();
    }).toThrow();
});
