import { Shuffle } from "./shuffle";

it("shuffle", () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const same = new Shuffle<number>().shuffle(items);
    expect(same).toEqual(items); // shuffles array in place
});

it("choice", () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const choice = new Shuffle<number>().choice(items);
    expect(items.includes(choice)).toBeTruthy();
});

it("choice (only one)", () => {
    const choice = new Shuffle<number>().choice([1]);
    expect(choice).toEqual(1);
});

it("overshoot (hack)", () => {
    console.log("BEFORE");
    jest.spyOn(Math, "random").mockImplementation((): number => {
        return 2.1;
    });

    expect(() => {
        new Shuffle<number>().choice([1]);
    }).toThrow();

    jest.restoreAllMocks();
    console.log("AFTER");
});
