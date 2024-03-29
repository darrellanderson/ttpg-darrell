import { ErrorBatcher } from "../error-handler/error-batcher";
import { IGlobal } from "./i-global";

export abstract class GlobalInit {
    /**
     * Run all the init functions (even if one throws).
     * Batch together all errors for one throw at the end.
     *
     * @param abstractGlobals
     */
    public static runGlobalInit(abstractGlobals: Array<IGlobal>) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const runnables: Array<(x: void) => any> = [];
        for (const abstractGlobal of abstractGlobals) {
            runnables.push(() => {
                abstractGlobal.init();
            });
        }
        ErrorBatcher.runMaybeThrowAtEnd(runnables);
    }
}
