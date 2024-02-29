import { Shuffle } from "./shuffle";

it("shuffle", () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const same = Shuffle.shuffle(items);
    expect(same).toEqual(items); // shuffles array in place
});

it("choice", () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const choice = Shuffle.choice(items);
    expect(items.includes(choice)).toBeTruthy();
});

it("overshoot (hack)", () => {
    jest.spyOn(Math, "random").mockImplementation((): number => {
        return 1.1;
    });

    expect(() => {
        Shuffle.choice([1]);
    }).toThrow();

    jest.restoreAllMocks();
});
