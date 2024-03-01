/**
 * Shuffle an array of objects.
 */
export class Shuffle<T> {
    shuffle(items: Array<T>): Array<T> {
        // Fisher-Yates
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const a: T | undefined = items[i];
            const b: T | undefined = items[j];
            if (a !== undefined && b !== undefined) {
                items[i] = b;
                items[j] = a;
            }
        }
        return items;
    }

    choice(items: Array<T>): T | undefined {
        const index: number = Math.floor(Math.random() * items.length);
        const item: T | undefined = items[index];
        return item;
    }

    choiceOrThrow(items: Array<T>): T {
        const item: T | undefined = this.choice(items);
        if (item === undefined) {
            console.log("sadf2.5");
            throw new Error("item undefined");
        }
        console.log("sadf3");
        return item;
    }
}
