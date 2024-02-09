type HeapEntry<T> = {
    item: T;
    value: number;
};

export class Heap<T> {
    private readonly _heap: HeapEntry<T>[] = [];

    public size(): number {
        return this._heap.length;
    }

    public peekMin(): T | undefined {
        return this._heap[0]?.item;
    }

    private _swap(a: number, b: number): void {
        const aHeapEntry: HeapEntry<T> | undefined = this._heap[a];
        const bHeapEntry: HeapEntry<T> | undefined = this._heap[b];
        if (aHeapEntry === undefined || bHeapEntry === undefined) {
            throw new Error("missing entry");
        }
        this._heap[a] = bHeapEntry;
        this._heap[b] = aHeapEntry;
    }

    public add(item: T, value: number): this {
        // Add new last entry, bubble up.
        this._heap.push({ item, value });
        let currentIndex = this._heap.length - 1;

        while (currentIndex > 0) {
            const upIndex: number = Math.floor(currentIndex / 2);

            const currentHeapEntry: HeapEntry<T> | undefined =
                this._heap[currentIndex];
            const upHeapEntry: HeapEntry<T> | undefined = this._heap[upIndex];

            // "noUncheckedIndexedAccess" must verify defined.
            if (!currentHeapEntry || !upHeapEntry) {
                throw new Error("missing entry");
            }

            if (currentHeapEntry.value > upHeapEntry.value) {
                break; // parent smaller, stop
            }
            this._swap(currentIndex, upIndex);
            currentIndex = upIndex;
        }
        return this;
    }

    public removeMin(): T | undefined {
        // Replace first entry with last, bubble down.
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

            // "noUncheckedIndexedAccess" must verify defined.
            if (!currentHeapEntry) {
                throw new Error("no current heap entry");
            }

            // no children
            if (!leftHeapEntry && !rightHeapEntry) {
                break;
            }

            // 1 child
            if (leftHeapEntry && !rightHeapEntry) {
                if (currentHeapEntry?.value >= leftHeapEntry.value) {
                    this._swap(currentIndex, leftIndex);
                    currentIndex = leftIndex;
                }
                break;
            }

            // 2 children
            if (leftHeapEntry && rightHeapEntry) {
                const left = leftHeapEntry.value;
                const right = rightHeapEntry.value;
                const current = currentHeapEntry.value;
                if (left <= right) {
                    if (current >= left) {
                        this._swap(currentIndex, leftIndex);
                        currentIndex = leftIndex;
                    } else {
                        break;
                    }
                } else {
                    if (current >= right) {
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
