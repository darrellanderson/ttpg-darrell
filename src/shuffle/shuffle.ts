export class Shuffle {
    static shuffle<T>(items: T[]): T[] {
        // Fisher-Yates
        for (let i = items.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        return items;
    }

    static choice<T>(items: T[]): T {
        return items[Math.floor(Math.random() * items.length)];
    }
}
