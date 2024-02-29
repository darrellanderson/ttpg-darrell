import { Shuffle } from "./shuffle";

it("shuffle", () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const same: Array<number> = new Shuffle<number>().shuffle(items);
    expect(same).toEqual(items); // shuffles array in place
});

it("choice", () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const choice: number | undefined = new Shuffle<number>().choice(items);
    expect(items.includes(choice ?? -1)).toBeTruthy();
});

it("choiceOrThrow", () => {
    const shuffle = new Shuffle<number>();
    expect(() => {
        shuffle.choiceOrThrow([]);
    }).toThrow();
});
