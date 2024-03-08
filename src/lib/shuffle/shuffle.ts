/**
 * Shuffle an array of objects.  Original is not modified,
 * returns shuffled.
 */
export class Shuffle<T> {
    shuffle(items: Array<T>): Array<T> {
        const copy = [...items];
        // Fisher-Yates
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const a: T | undefined = copy[i];
            const b: T | undefined = copy[j];
            if (a !== undefined && b !== undefined) {
                copy[i] = b;
                copy[j] = a;
            }
        }
        return copy;
    }

    choice(items: Array<T>): T | undefined {
        const index: number = Math.floor(Math.random() * items.length);
        const item: T | undefined = items[index];
        return item;
    }

    choiceOrThrow(items: Array<T>): T {
        const item: T | undefined = this.choice(items);
        if (item === undefined) {
            throw new Error("item undefined");
        }
        return item;
    }
}
