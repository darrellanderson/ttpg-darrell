import { TriggerableMulticastDelegate } from "./triggerable-multicast-delegate";

it("constructor", () => {
    new TriggerableMulticastDelegate<() => void>();
});

it("trigger", () => {
    let total = 0;
    const handler = (value1: number, value2: number) => {
        total += value1;
        total += value2;
    };

    const multicastDelegate = new TriggerableMulticastDelegate<
        (value1: number, value2: number) => void
    >();
    multicastDelegate.add(handler);

    multicastDelegate.trigger(7, 1);
    multicastDelegate.trigger(2, 1);
    expect(total).toEqual(11);
});

it("add/remove", () => {
    let total = 0;
    const handler = (value: number) => {
        total += value;
    };

    const multicastDelegate = new TriggerableMulticastDelegate<
        (value: number) => void
    >();
    multicastDelegate.add(handler);

    multicastDelegate.trigger(7);
    multicastDelegate.remove(handler);
    multicastDelegate.trigger(2);
    expect(total).toEqual(7);
});

it("add/clear", () => {
    let total = 0;
    const handler = (value: number) => {
        total += value;
    };

    const multicastDelegate = new TriggerableMulticastDelegate<
        (value: number) => void
    >();
    multicastDelegate.add(handler);

    multicastDelegate.trigger(7);
    multicastDelegate.clear();
    multicastDelegate.trigger(2);
    expect(total).toEqual(7);
});

it("error (single)", () => {
    const handler = () => {
        throw new Error("err!");
    };

    const multicastDelegate = new TriggerableMulticastDelegate<
        (value: number) => void
    >();
    multicastDelegate.add(handler);

    let error: Error | undefined = undefined;
    try {
        multicastDelegate.trigger(1);
    } catch (e) {
        error = e as Error;
    }
    expect(error?.toString()).toEqual("Error: ErrorBatcher (1):");
});

it("error (double)", () => {
    const handler = () => {
        throw new Error("err!");
    };

    const multicastDelegate = new TriggerableMulticastDelegate<
        (value: number) => void
    >();
    multicastDelegate.add(handler);
    multicastDelegate.add(handler); // again!

    let error: Error | undefined = undefined;
    try {
        multicastDelegate.trigger(1);
    } catch (e) {
        error = e as Error;
    }
    expect(error?.toString()).toEqual("Error: ErrorBatcher (2):");
});

it("depth limit", () => {
    const multicastDelegate = new TriggerableMulticastDelegate<() => void>();

    let stopped: boolean = false;
    multicastDelegate.add(() => {
        try {
            multicastDelegate.trigger();
        } catch {
            stopped = true;
        }
    });
    multicastDelegate.trigger(); // stop at depth limit
    expect(stopped).toBe(true);
});
