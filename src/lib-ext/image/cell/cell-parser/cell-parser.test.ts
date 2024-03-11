import { CellSize } from "../abstract-cell/abstract-cell";
import { CellParser } from "./cell-parser";

it("constructor", () => {
    new CellParser();
});

it("invalid", () => {
    expect(() => {
        new CellParser().parse({ type: "nope!" });
    }).toThrow();
});

it("export", () => {
    const size: CellSize = new CellParser()
        .parse({
            type: "PaddedCell",
            padding: 0,
            background: "#ff0000",
            exports: { width: 10, bufferData: "my-data", tags: ["my-tag"] },
            child: {
                type: "BufferCell",
                width: "$import",
                height: 1,
                bufferData: "$import",
                snapPoints: [{ tags: "$import" }],
            },
        })
        .getSize();
    expect(size).toEqual({ width: 10, height: 1 });
});

it("snap points", () => {
    new CellParser("my-root-dir").parse({
        type: "BufferCell",
        width: 1,
        height: 1,
        bufferData: "my-data",
        snapPoints: [
            {
                left: 1,
                top: 1,
                tags: ["my-tag"],
                rotation: 1,
            },
        ],
    });
});

it("snap points (createCountToPrev)", () => {
    new CellParser("my-root-dir").parse({
        type: "BufferCell",
        width: 1,
        height: 1,
        bufferData: "my-data",
        snapPoints: [
            {
                left: 1,
                top: 1,
                tags: ["my-tag"],
                rotation: 1,
            },
            {
                createCountToPrev: 3,
                left: 3,
                top: 1,
                tags: ["my-tag"],
                rotation: 1,
            },
        ],
    });
});

it("snap points (createCountToPrev, no prev)", () => {
    const data = {
        type: "BufferCell",
        width: 1,
        height: 1,
        bufferData: "my-data",
        snapPoints: [
            {
                createCountToPrev: 3,
                left: 1,
                top: 1,
                tags: ["my-tag"],
                rotation: 1,
            },
        ],
    };

    expect(() => {
        new CellParser("my-root-dir").parse(data);
    }).toThrow();
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

it("PaddedCell", () => {
    new CellParser().parse({
        type: "PaddedCell",
        padding: 1,
        background: "#ff0000",
        child: {
            type: "BufferCell",
            width: 1,
            height: 1,
            bufferData: "my-data",
        },
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
        font: "my-font",
        fontStyle: "my-font-style",
        fontSize: 1,
        textColor: "#ff0000",
    });
});
