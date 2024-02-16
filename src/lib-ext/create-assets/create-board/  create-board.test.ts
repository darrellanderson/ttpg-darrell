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
        .setWorldSize(200, 100)
        .toFileData("my-asset-name");
    expect(filenameToBuffer).toBeDefined();
});
