import sharp from "sharp";
import { CreateBoard } from "./create-board";
import { CreateBoardParams } from "./create-board-params";
import { CubeModel } from "../../model/cube-model/cube-model";
import { SolidCell } from "../../image/cell/solid-cell/solid-cell";

it("toFileData", async () => {
    const srcImage: Buffer = await new SolidCell(2, 1, "#ff0000").toBuffer();

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
        "assets/Textures/my-asset-filename-0x0.jpg",
    ]);

    const model: string | undefined =
        filenameToBuffer[
            "assets/Models/" + CubeModel.ASSET_FILENAME
        ]?.toString();
    expect(model).toBeDefined();
    expect(model?.includes("$")).toBeFalsy();

    const image: Buffer | undefined =
        filenameToBuffer["assets/Textures/my-asset-filename-0x0.jpg"];
    expect(image).toBeDefined();
    const metadata = await sharp(image).metadata();
    expect(metadata.width).toEqual(2);
    expect(metadata.height).toEqual(1);

    const template: string | undefined =
        filenameToBuffer["assets/Templates/my-asset-filename.json"]?.toString();
    expect(template).toBeDefined();
    expect(template?.includes("$")).toBeFalsy();
    const templateParsed = JSON.parse(template ?? "");
    expect(templateParsed.Name).toEqual("my-template-name");
    expect(templateParsed.Models.length).toEqual(1);

    const templateModel = templateParsed.Models[0];
    expect(templateModel.Model).toEqual(CubeModel.ASSET_FILENAME);
    expect(templateModel.Texture).toEqual("my-asset-filename-0x0.jpg");
    expect(templateModel.Offset).toEqual({ X: 50, Y: 100, Z: 0 });
    expect(templateModel.Scale).toEqual({ X: 100, Y: 200, Z: 0.25 });
});
