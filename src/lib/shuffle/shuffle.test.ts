import { Shuffle } from "./shuffle";

it("shuffle", () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const shuffled: Array<number> = new Shuffle<number>().shuffle(items);
    expect(shuffled.sort()).toEqual(items.sort()); // same content
});

it("choice", () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const choice: number = new Shuffle<number>().choiceOrThrow(items);
    expect(items.includes(choice)).toBeTruthy();
});

it("choiceOrThrow", () => {
    const shuffle = new Shuffle<number>();
    expect(() => {
        shuffle.choiceOrThrow([]);
    }).toThrow();
});
