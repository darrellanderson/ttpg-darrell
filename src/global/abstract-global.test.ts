import { AbstractGlobal } from "./abstract-global";

it("batch errors", () => {
    class MyAbstractGlobal extends AbstractGlobal {
        init(): void {
            throw new Error("Method not implemented.");
        }
    }

    const two = [new MyAbstractGlobal(), new MyAbstractGlobal()];
    let error: Error | undefined;
    try {
        AbstractGlobal.runAbstractGlobalInit(two);
    } catch (e: unknown) {
        if (e instanceof Error) {
            error = e;
        }
    }

    expect(error).toBeDefined();
    expect(error?.message.startsWith("ERRORS (2):")).toBeTruthy();
});
