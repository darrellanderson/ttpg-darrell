export abstract class ErrorBatcher {
    /**
     * Get error as string including stack trace (not just name/message).
     *
     * @param error
     * @returns {string}
     */
    static errorToString(error: Error): string {
        const entry: Array<string> = [];
        // STACK ALREADY INCLUDES NAME AND MESSAGE!
        // if (error.name.length > 0) {
        //     entry.push("NAME: " + error.name);
        // }
        // if (error.message.length > 0) {
        //     entry.push("MESSAGE: " + error.message);
        // }
        if (error.stack && error.stack.length > 0) {
            // Preserve stack trace format for other error parsing.
            entry.push(error.stack);
        }
        return entry.join("\n");
    }

    static runMaybeThrowAtEnd(runnables: Array<(x: void) => unknown>): void {
        const errors: Array<Error> = ErrorBatcher.runGatherErrors(runnables);
        if (errors.length > 0) {
            const message = `ErrorBatcher (${errors.length}):`;
            const stack: string = errors
                .map((error) => ErrorBatcher.errorToString(error))
                .join("\n");

            const error = new Error(message);
            error.stack = stack;
            throw error;
        }
    }

    static runGatherErrors(
        runnables: Array<(x: void) => unknown>
    ): Array<Error> {
        const errors: Array<Error> = [];
        for (const runnable of runnables) {
            try {
                runnable.apply(null, []);
            } catch (errorUnknownType: unknown) {
                if (errorUnknownType instanceof Error) {
                    errors.push(errorUnknownType);
                }
            }
        }
        return errors;
    }
}
