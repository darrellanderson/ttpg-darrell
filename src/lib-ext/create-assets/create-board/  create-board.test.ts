import { CreateBoard } from "./create-board";
import { SolidCell } from "../../image/cell/solid-cell/solid-cell";

it("constructor", () => {
    new CreateBoard("my-name");
});

it("toFileData", async () => {
    const srcImageBuffer: Buffer = await new SolidCell(
        2,
        1,
        "#ff0000"
    ).toBuffer();

    const filenameToBuffer: { [key: string]: Buffer } = await new CreateBoard(
        "my-name"
    )
        .setImage(srcImageBuffer)
        .setWorldSize(200, 100, 0.25)
        .toFileData("my-asset-name");

    expect(filenameToBuffer).toBeDefined();
    expect(Object.keys(filenameToBuffer).sort()).toEqual([
        "assets/Models/uv-cube.obj",
        "assets/Templates/my-asset-name.json",
        "assets/Textures/my-asset-name-0x0.jpg",
    ]);

    const model: string | undefined =
        filenameToBuffer["assets/Models/uv-cube.obj"]?.toString();
    const template: string | undefined =
        filenameToBuffer["assets/Templates/my-asset-name.json"]?.toString();
    const image: Buffer | undefined =
        filenameToBuffer["assets/Textures/my-asset-name-0x0.jpg"];

    expect(model).toBeDefined();
    expect(template).toBeDefined();
    expect(image).toBeDefined();

    if (!model || !template || !image) {
        throw new Error("stop tsc errors");
    }

    expect(model.includes("$")).toBeFalsy();
    expect(template.includes("$")).toBeFalsy();
});
