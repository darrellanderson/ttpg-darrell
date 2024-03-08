export type WeightedChoiceOption<T> = {
    weight: number;
    value: T;
};

/**
 * Class representing a weighted choice utility.
 * @class
 */
export class WeightedChoice<T> {
    private readonly _options: Array<WeightedChoiceOption<T>>;
    private readonly _totalWeight: number;

    /**
     * Constructs a new WeightedChoice instance.
     *
     * @param {Array<WeightedChoiceOption<T>>} options - The options to choose from.
     * @throws {Error} If any option weight is negative.
     */
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

    /**
     * Returns a randomly chosen option, with the likelihood of each option
     * being chosen proportional to its weight.
     *
     * @returns {T} The chosen option.
     * @throws {Error} If the method somehow fails to choose an option.
     */
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
