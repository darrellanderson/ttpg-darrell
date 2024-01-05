export abstract class AbstractGlobal {
    abstract init(): void;

    /**
     * Run all the init functions (even if one throws).
     * Batch together all errors for one throw at the end.
     *
     * @param abstractGlobals
     */
    static runAbstractGlobalInit(abstractGlobals: AbstractGlobal[]) {
        const errors: Error[] = [];
        for (const abstractGlobal of abstractGlobals) {
            try {
                abstractGlobal.init();
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
