import { GlobalInit } from "./global-init";
import { IGlobal } from "./i-global";

it("batch errors", () => {
    class MyGlobal implements IGlobal {
        init(): void {
            throw new Error("Method not implemented.");
        }
    }

    const two = [new MyGlobal(), new MyGlobal()];
    let error: Error | undefined;
    try {
        GlobalInit.runGlobalInit(two);
    } catch (e: unknown) {
        if (e instanceof Error) {
            error = e;
        }
    }

    expect(error).toBeDefined();
    expect(error?.toString()).toEqual("Error: ErrorBatcher (2):");
});
