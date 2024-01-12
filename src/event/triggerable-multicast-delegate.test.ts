import { TriggerableMulticastDelegate } from "./triggerable-multicast-delegate";

it("constructor", () => {
    new TriggerableMulticastDelegate<() => void>();
});

it("trigger", () => {
    let total = 0;
    const handler = (value: number) => {
        total += value;
    };

    const multicastDelegate = new TriggerableMulticastDelegate<
        (value: number) => void
    >();
    multicastDelegate.add(handler);

    multicastDelegate.trigger(7);
    multicastDelegate.trigger(2);
    expect(total).toEqual(9);
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
    const handler = (value: number) => {
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
    expect(error?.toString()).toEqual("Error: err!");
});

it("error (double)", () => {
    const handler = (value: number) => {
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
    expect(error?.message.split("\n")).toEqual(["ERRORS (2):", "err!", "err!"]);
});
