import { ErrorBatcher } from "../error-handler/error-batcher";

/**
 * Lookalike for TTPG's MulticastDelegate, but with a trigger method.
 */
export class TriggerableMulticastDelegate<T extends (...args: any) => any> {
    private readonly _listeners: T[] = [];

    /**
     * Add a function to the trigger set.
     *
     * @param fn
     */
    add(fn: T): void {
        this._listeners.push(fn);
    }

    /**
     * Remove a function from the trigger set.
     *
     * @param fn
     */
    remove(fn: T): void {
        for (let i = this._listeners.length - 1; i >= 0; i--) {
            if (this._listeners[i] === fn) {
                this._listeners.splice(i, 1);
            }
        }
    }

    /**
     * Clear the trigger set.
     */
    clear(): void {
        this._listeners.splice(0);
    }

    /**
     * Call every function in the trigger set.
     *
     * Call every function even if one throws, raise gathered errors at end.
     *
     * @param args
     */
    trigger(...args: Parameters<T>): void {
        const runnables: ((x: void) => any)[] = [];
        for (const fn of this._listeners) {
            runnables.push(() => {
                fn.apply(null, args);
            });
        }
        ErrorBatcher.runMaybeThrowAtEnd(runnables);
    }
}
