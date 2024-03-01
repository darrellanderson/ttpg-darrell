/**
 * Shuffle an array of objects.
 */
export class Shuffle<T> {
    shuffle(items: T[]): T[] {
        if (items.length <= 1) {
            return items;
        }
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

    choice(items: T[]): T {
        console.log("sadf1");
        const index: number = Math.floor(Math.random() * items.length);
        console.log("xxx " + index);
        const item: T | undefined = items[index];
        console.log("sadf2 " + item);
        if (item === undefined) {
            console.log("sadf2.5");
            throw new Error("item undefined");
        }
        console.log("sadf3");
        return item;
    }
}
