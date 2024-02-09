import { Heap } from "./heap";

it("constructor", () => {
    new Heap<string>();
});

it("add/peek", () => {
    const heap = new Heap<string>();
    expect(heap.peekMin()).toBeUndefined();

    heap.add("one", 1);
    expect(heap.peekMin()).toEqual("one");

    heap.add("two", 2);
    expect(heap.peekMin()).toEqual("one");
});

it("add/peek (reverse)", () => {
    const heap = new Heap<string>();
    expect(heap.peekMin()).toBeUndefined();

    heap.add("two", 2);
    expect(heap.peekMin()).toEqual("two");

    heap.add("one", 1);
    expect(heap.peekMin()).toEqual("one");
});

it("add/remove", () => {
    const heap = new Heap<string>()
        .add("one", 1)
        .add("two", 2)
        .add("three", 3)
        .add("four", 4)
        .add("five", 5);
    expect(heap.removeMin()).toEqual("one");
    expect(heap.removeMin()).toEqual("two");
    expect(heap.removeMin()).toEqual("three");
    expect(heap.removeMin()).toEqual("four");
    expect(heap.removeMin()).toEqual("five");
});

it("add/remove (reverse)", () => {
    const heap = new Heap<string>()
        .add("five", 5)
        .add("four", 4)
        .add("three", 3)
        .add("two", 2)
        .add("one", 1);
    expect(heap.removeMin()).toEqual("one");
    expect(heap.removeMin()).toEqual("two");
    expect(heap.removeMin()).toEqual("three");
    expect(heap.removeMin()).toEqual("four");
    expect(heap.removeMin()).toEqual("five");
});

it("add/remove (mixed)", () => {
    const heap = new Heap<string>()
        .add("four", 4)
        .add("five", 5)
        .add("two", 2)
        .add("three", 3)
        .add("one", 1);
    expect(heap.removeMin()).toEqual("one");
    expect(heap.removeMin()).toEqual("two");
    expect(heap.removeMin()).toEqual("three");
    expect(heap.removeMin()).toEqual("four");
    expect(heap.removeMin()).toEqual("five");
});
