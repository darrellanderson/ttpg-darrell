import { ErrorBatcher } from "../../error-handler/error-batcher";

/**
 * Lookalike for TTPG's MulticastDelegate, but with a trigger method.
 */
export class TriggerableMulticastDelegate<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends (...args: Array<any>) => any,
> {
    private readonly _listeners: Array<T> = [];
    private _triggerDepth: number = 0;

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
     * Call every function even if one throws, send gathered errors at end directly to error handler;
     * does not throw/stop processing.
     *
     * @param args
     */
    trigger(...args: Parameters<T>): void {
        if (this._triggerDepth > 3) {
            throw new Error("Maximum trigger depth exceeded");
        }
        this._triggerDepth++;
        try {
            const runnables: Array<(x: void) => unknown> = [];
            for (const fn of this._listeners) {
                runnables.push(() => {
                    fn(...args);
                });
            }
            ErrorBatcher.runMaybeThrowAtEnd(runnables);
        } catch (errorUnknownType: unknown) {
            if (
                errorUnknownType instanceof Error &&
                errorUnknownType.stack &&
                globalThis.$uncaughtException
            ) {
                // Stack already includes name/message.
                globalThis.$uncaughtException(errorUnknownType.stack);
            }
        } finally {
            this._triggerDepth--;
        }
    }
}
