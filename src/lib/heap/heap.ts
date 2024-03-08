/**
 * Type definition for a heap entry.
 * @typedef {Object} HeapEntry
 * @template T
 * @property {T} item - The item in the heap.
 * @property {number} value - The value associated with the item.
 */
type HeapEntry<T> = {
    item: T;
    value: number;
};

/**
 * Collection of template type objects with associated number values.
 * Efficient add, peek/remove min.
 * @template T
 */
export class Heap<T> {
    private readonly _heap: HeapEntry<T>[] = [];

    /**
     * Get the size of the heap.
     * @returns {number} The size of the heap.
     */
    public size(): number {
        return this._heap.length;
    }

    /**
     * Peek at the minimum item in the heap without removing it.
     * @returns {T | undefined} The minimum item or undefined if the heap is empty.
     */
    public peekMin(): T | undefined {
        return this._heap[0]?.item;
    }

    /**
     * Swap two items in the heap.
     * @private
     * @param {number} a - The index of the first item.
     * @param {number} b - The index of the second item.
     * @throws {Error} If either index is out of bounds.
     */
    private _swap(a: number, b: number): void {
        const aHeapEntry: HeapEntry<T> | undefined = this._heap[a];
        const bHeapEntry: HeapEntry<T> | undefined = this._heap[b];
        if (aHeapEntry === undefined || bHeapEntry === undefined) {
            throw new Error("missing entry");
        }
        this._heap[a] = bHeapEntry;
        this._heap[b] = aHeapEntry;
    }

    /**
     * Add an item to the heap.
     * @param {T} item - The item to add.
     * @param {number} value - The value associated with the item.
     * @returns {Heap} The heap instance.
     * @throws {Error} If the item cannot be added.
     */
    public add(item: T, value: number): this {
        this._heap.push({ item, value });
        let currentIndex = this._heap.length - 1;

        while (currentIndex > 0) {
            const upIndex: number = Math.floor(currentIndex / 2);

            const currentHeapEntry: HeapEntry<T> | undefined =
                this._heap[currentIndex];
            const upHeapEntry: HeapEntry<T> | undefined = this._heap[upIndex];

            if (!currentHeapEntry || !upHeapEntry) {
                throw new Error("missing entry");
            }

            if (currentHeapEntry.value > upHeapEntry.value) {
                break;
            }
            this._swap(currentIndex, upIndex);
            currentIndex = upIndex;
        }
        return this;
    }

    /**
     * Remove the minimum item from the heap.
     * @returns {T | undefined} The removed item or undefined if the heap is empty.
     * @throws {Error} If the item cannot be removed.
     */
    public removeMin(): T | undefined {
        const firstHeapEntry: HeapEntry<T> | undefined = this._heap[0];
        if (!firstHeapEntry) {
            return undefined;
        }
        const lastHeapEntry: HeapEntry<T> | undefined = this._heap.pop();
        if (!lastHeapEntry) {
            throw new Error("no last heap entry");
        }
        if (this._heap.length === 0) {
            return firstHeapEntry.item;
        }
        this._heap[0] = lastHeapEntry;

        let currentHeapEntry: HeapEntry<T> | undefined;
        let leftHeapEntry: HeapEntry<T> | undefined;
        let rightHeapEntry: HeapEntry<T> | undefined;

        let currentIndex: number = 0;
        do {
            const leftIndex: number = currentIndex * 2 + 1;
            const rightIndex: number = currentIndex * 2 + 2;

            currentHeapEntry = this._heap[currentIndex];
            leftHeapEntry = this._heap[leftIndex];
            rightHeapEntry = this._heap[rightIndex];

            if (!currentHeapEntry) {
                throw new Error("no current heap entry");
            }

            if (!leftHeapEntry && !rightHeapEntry) {
                break;
            }

            if (leftHeapEntry && !rightHeapEntry) {
                if (currentHeapEntry?.value >= leftHeapEntry.value) {
                    this._swap(currentIndex, leftIndex);
                    currentIndex = leftIndex;
                }
                break;
            }

            if (leftHeapEntry && rightHeapEntry) {
                const left = leftHeapEntry.value;
                const right = rightHeapEntry.value;
                const current = currentHeapEntry.value;
                if (left <= right) {
                    if (current > left) {
                        this._swap(currentIndex, leftIndex);
                        currentIndex = leftIndex;
                    } else {
                        break;
                    }
                } else {
                    if (current > right) {
                        this._swap(currentIndex, rightIndex);
                        currentIndex = rightIndex;
                    } else {
                        break;
                    }
                }
            }
        } while (leftHeapEntry && rightHeapEntry);

        return firstHeapEntry.item;
    }
}
