import { ErrorBatcher } from "../error-handler/error-batcher";

export abstract class AbstractGlobal {
    abstract init(): void;

    /**
     * Run all the init functions (even if one throws).
     * Batch together all errors for one throw at the end.
     *
     * @param abstractGlobals
     */
    public static runAbstractGlobalInit(abstractGlobals: AbstractGlobal[]) {
        const runnables: ((x: void) => any)[] = [];
        for (const abstractGlobal of abstractGlobals) {
            runnables.push(() => {
                abstractGlobal.init();
            });
        }
        ErrorBatcher.runMaybeThrowAtEnd(runnables);
    }
}
