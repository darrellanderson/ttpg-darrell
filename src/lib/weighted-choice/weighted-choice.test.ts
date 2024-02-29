import { WeightedChoice } from "./weighted-choice";

it("constructor", () => {
    new WeightedChoice([]);
});

it("constructor (negative weight)", () => {
    expect(() => {
        new WeightedChoice<string>([
            {
                value: "a",
                weight: -1,
            },
        ]);
    }).toThrow();
});

it("choice", () => {
    let randomCalls = 0;
    jest.spyOn(Math, "random").mockImplementation((): number => {
        return (randomCalls++ % 10) / 10;
    });

    const weightedChoice = new WeightedChoice<string>([
        { value: "a", weight: 1 },
        { value: "b", weight: 3 },
    ]);

    const choiceCount: { [key: string]: number } = { a: 0, b: 0 };
    for (let i = 0; i < 100; i++) {
        const choice: string = weightedChoice.choice();
        choiceCount[choice]++;
    }
    expect(Math.abs(choiceCount["a"] ?? 0) - 25).toBeLessThan(10);
    expect(Math.abs(choiceCount["b"] ?? 0) - 75).toBeLessThan(10);

    jest.restoreAllMocks();
});
