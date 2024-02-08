import { ErrorBatcher } from "./error-batcher";

it("errorToString", () => {
    const error = new Error("my message");
    const str = ErrorBatcher.errorToString(error);
    const strLines = str.split("\n");

    expect(strLines.length).toBeGreaterThanOrEqual(2);
    expect(strLines[0]).toEqual("Error: my message");
    expect(strLines[1]?.startsWith("    at Object.<anonymous>")).toBeTruthy();
});

it("runGatherErrors", () => {
    const runnable = () => {
        throw new Error("my err!");
    };

    const errors: Error[] = ErrorBatcher.runGatherErrors([runnable, runnable]);

    expect(errors.length).toEqual(2);
});

it("runMaybeThrowAtEnd", () => {
    const runnable = () => {
        throw new Error("my err!");
    };

    let str: string = "";
    try {
        ErrorBatcher.runMaybeThrowAtEnd([runnable, runnable]);
    } catch (e: unknown) {
        str = ErrorBatcher.errorToString(e as Error);
    }

    const count = str
        .split("\n")
        .filter((line) => line === "Error: my err!").length;
    expect(count).toEqual(2);
});
