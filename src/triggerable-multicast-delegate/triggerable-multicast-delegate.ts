/**
 * Lookalike for TTPG's MulticastDelegate, but with a trigger method.
 */
export class TriggerableMulticastDelegate<T> {
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
  trigger(...args: any): void {
    const errors: Error[] = [];
    for (const fn of this._listeners) {
      try {
        if (typeof fn === "function") {
          fn(...args);
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          errors.push(e);
        }
      }
    }
    if (errors.length === 1) {
      throw errors[0];
    } else if (errors.length > 1) {
      const message =
        `ERRORS (${errors.length}):\n` +
        errors.map((e) => e.message).join("\n");
      const stack = errors
        .filter((e) => e.stack)
        .map((e) => `-----\n${e.stack}`)
        .join("\n");

      const error = new Error(message);
      error.stack = stack;
      throw error;
    }
  }
}
