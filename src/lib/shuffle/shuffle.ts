/**
 * Shuffle an array of objects.
 */
export class Shuffle {
    static shuffle<T>(items: T[]): T[] {
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

    static choice<T>(items: T[]): T {
        const item: T | undefined =
            items[Math.floor(Math.random() * items.length)];
        if (item === undefined) {
            throw new Error("item undefined");
        }
        return item;
    }
}
