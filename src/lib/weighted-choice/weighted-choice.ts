export type WeightedChoiceOption<T> = {
    weight: number;
    value: T;
};

export class WeightedChoice<T> {
    private readonly _options: Array<WeightedChoiceOption<T>>;
    private readonly _totalWeight: number;

    constructor(options: Array<WeightedChoiceOption<T>>) {
        options.forEach((option) => {
            if (option.weight < 0) {
                throw new Error("weight must be non-negative");
            }
        });

        this._options = options;
        this._totalWeight = this._options
            .map((option): number => option.weight)
            .reduce((prevValue: number, currentValue: number): number => {
                return prevValue + currentValue;
            }, 0);
    }

    choice(): T {
        let target = Math.random() * this._totalWeight;
        for (const option of this._options) {
            if (target <= option.weight) {
                return option.value;
            }
            target -= option.weight;
        }
        throw new Error("unreachable");
    }
}
