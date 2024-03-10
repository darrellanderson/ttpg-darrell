import sharp from "sharp";
import { CreateBoard } from "./create-board";
import { CreateBoardParams } from "./create-board-params";
import { CubeModel } from "../../model/cube-model/cube-model";
import { ZSolidCell } from "../../image/cell/cell-parser/cell-schema";

it("fromParamsJson", () => {
    const paramsJson: Buffer = Buffer.from(
        JSON.stringify({
            templateName: "my-template-name",
            assetFilename: "my-asset-filename",
            topDownWorldSize: { width: 200, height: 100, depth: 0.25 },
            srcImage: {
                type: "SolidCell",
                width: 2,
                height: 1,
                color: "#ff0000",
            },
            preshrink: 100,
        })
    );
    CreateBoard.fromParamsJson(paramsJson);
});

it("clean", async () => {
    const createBoard = new CreateBoard({
        templateName: "my-template-name",
        assetFilename: "my-asset-filename-that-does-not-exist",
        topDownWorldSize: { width: 200, height: 100, depth: 0.25 },
        srcImage: {
            type: "SolidCell",
            width: 2,
            height: 1,
            color: "#ff0000",
        },
        preshrink: 100,
    });
    await createBoard.clean();
});

it("toFileData", async () => {
    const srcImage: ZSolidCell = {
        type: "SolidCell",
        width: 5000,
        height: 1,
        color: "#ff0000",
        snapPoints: [{}, { left: 0, top: 0 }],
    };

    const params: CreateBoardParams = {
        templateName: "my-template-name",
        assetFilename: "my-asset-filename",
        topDownWorldSize: { width: 200, height: 100, depth: 0.25 },
        srcImage,
    };

    const filenameToBuffer: { [key: string]: Buffer } = await new CreateBoard(
        params
    ).toFileData();

    expect(filenameToBuffer).toBeDefined();
    expect(Object.keys(filenameToBuffer).sort()).toEqual([
        "assets/Models/" + CubeModel.ASSET_FILENAME,
        "assets/Templates/my-asset-filename.json",
        "assets/Textures/my-asset-filename/my-asset-filename-0x0.jpg",
        "assets/Textures/my-asset-filename/my-asset-filename-1x0.jpg",
    ]);

    const model: string | undefined =
        filenameToBuffer[
            "assets/Models/" + CubeModel.ASSET_FILENAME
        ]?.toString();
    expect(model).toBeDefined();
    expect(model?.includes("$")).toBeFalsy();

    let image: Buffer | undefined =
        filenameToBuffer[
            "assets/Textures/my-asset-filename/my-asset-filename-0x0.jpg"
        ];
    expect(image).toBeDefined();
    let metadata = await sharp(image).metadata();
    expect(metadata.width).toEqual(4096);
    expect(metadata.height).toEqual(1);

    image =
        filenameToBuffer[
            "assets/Textures/my-asset-filename/my-asset-filename-1x0.jpg"
        ];
    expect(image).toBeDefined();
    metadata = await sharp(image).metadata();
    expect(metadata.width).toEqual(942);
    expect(metadata.height).toEqual(1);

    const template: string | undefined =
        filenameToBuffer["assets/Templates/my-asset-filename.json"]?.toString();
    expect(template).toBeDefined();
    expect(template?.includes("$")).toBeFalsy();
    const templateParsed = JSON.parse(template ?? "");
    expect(templateParsed.Name).toEqual("my-template-name");
    expect(templateParsed.Models.length).toEqual(2);

    const templateModel = templateParsed.Models[0];
    expect(templateModel.Model).toEqual(CubeModel.ASSET_FILENAME);
    expect(templateModel.Texture).toEqual(
        "my-asset-filename/my-asset-filename-0x0.jpg"
    );
    expect(templateModel.Offset).toEqual({ X: 0, Y: -18.72, Z: 0 });
    expect(templateModel.Scale).toEqual({ X: 100, Y: 162.56, Z: 0.25 });
});

it("world size scaledByPixels", async () => {
    const params: CreateBoardParams = {
        templateName: "my-template-name",
        assetFilename: "my-asset-filename",
        topDownWorldSize: {
            width: 7,
            widthScaledByPixels: true,
            height: 3,
            heightScaledByPixels: true,
            depth: 0.25,
        },
        srcImage: {
            type: "SolidCell",
            width: 2,
            height: 1,
            color: "#ff0000",
        },
    };
    const filenameToBuffer: { [key: string]: Buffer } = await new CreateBoard(
        params
    ).toFileData();

    const template: string | undefined =
        filenameToBuffer["assets/Templates/my-asset-filename.json"]?.toString();
    expect(template).toBeDefined();
    const templateParsed = JSON.parse(template ?? "");
    expect(templateParsed.Models.length).toEqual(1);

    const templateModel = templateParsed.Models[0];
    expect(templateModel.Model).toEqual(CubeModel.ASSET_FILENAME);
    expect(templateModel.Texture).toEqual(
        "my-asset-filename/my-asset-filename.jpg"
    );
    expect(templateModel.Offset).toEqual({ X: 0, Y: 0, Z: 0 });
    expect(templateModel.Scale).toEqual({ X: 3, Y: 14, Z: 0.25 });
});
