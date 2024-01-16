import { AbstractGlobal } from "../global/abstract-global";
import { ErrorHandler } from "./error-handler";

/**
 * Report errors or other messages to a remote service.
 */
export class ErrorRemoteReporter extends AbstractGlobal {
    init() {
        ErrorHandler.onError.add((error: string) => {
            this.onError(error);
        });

        // TODO XXX
    }

    onError(error: string): void {
        // TODO XXX
    }
}
