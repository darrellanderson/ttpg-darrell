import { CellParser } from "./cell-parser";

it("constructor", () => {
    new CellParser();
});

it("BleedCell", () => {
    new CellParser().parse({
        type: "BleedCell",
        child: {
            type: "BufferCell",
            width: 1,
            height: 1,
            bufferData: "my-data",
        },
        leftRight: 1,
        topBottom: 1,
    });
});

it("BufferCell", () => {
    new CellParser().parse({
        type: "BufferCell",
        width: 1,
        height: 1,
        bufferData: "my-data",
    });
});

it("CanvasCell", () => {
    new CellParser().parse({
        type: "CanvasCell",
        width: 1,
        height: 1,
        children: [
            {
                left: 0,
                top: 0,
                child: {
                    type: "BufferCell",
                    width: 1,
                    height: 1,
                    bufferData: "my-data",
                },
            },
        ],
    });
});

it("ColCell", () => {
    new CellParser().parse({
        type: "ColCell",
        children: [
            {
                type: "BufferCell",
                width: 1,
                height: 1,
                bufferData: "my-data",
            },
        ],
        spacing: 1,
    });
});

it("GridCell", () => {
    new CellParser().parse({
        type: "GridCell",
        children: [
            {
                type: "BufferCell",
                width: 1,
                height: 1,
                bufferData: "my-data",
            },
        ],
        numCols: 1,
        spacing: 1,
    });
});

it("ImageCell", () => {
    new CellParser().parse({
        type: "ImageCell",
        width: 1,
        height: 1,
        imageFile: "my-image-file",
    });
});

it("RowCell", () => {
    new CellParser().parse({
        type: "RowCell",
        children: [
            {
                type: "BufferCell",
                width: 1,
                height: 1,
                bufferData: "my-data",
            },
        ],
        spacing: 1,
    });
});

it("SolidCell", () => {
    new CellParser().parse({
        type: "SolidCell",
        width: 1,
        height: 1,
        color: "#ff0000",
    });
});

it("TextCell", () => {
    new CellParser().parse({
        type: "TextCell",
        width: 1,
        height: 1,
        text: "my-text",
    });
});
