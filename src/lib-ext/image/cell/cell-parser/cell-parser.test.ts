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
