import sharp from "sharp";
import { CreateBoard } from "./create-board";
import { CubeModel } from "../../model/cube-model/cube-model";
import { SolidCell } from "../../image/cell/solid-cell/solid-cell";

it("constructor", () => {
    new CreateBoard("my-name", "my-asset-filename");
});

it("toFileData", async () => {
    const srcImageBuffer: Buffer = await new SolidCell(
        2,
        1,
        "#ff0000"
    ).toBuffer();

    const filenameToBuffer: { [key: string]: Buffer } = await new CreateBoard(
        "my-template-name",
        "my-asset-filename"
    )
        .setImage(srcImageBuffer)
        .setWorldSize(200, 100, 0.25)
        .toFileData();

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
    expect(templateParsed.Models[0].Model).toEqual(CubeModel.ASSET_FILENAME);
    expect(templateParsed.Models[0].Texture).toEqual(
        "my-asset-filename-0x0.jpg"
    );
});
