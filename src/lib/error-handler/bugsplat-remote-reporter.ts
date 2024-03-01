import { FetchOptions, FetchResponse, fetch } from "@tabletop-playground/api";
import { ErrorHandler } from "./error-handler";
import { IGlobal } from "../global/i-global";

export type BugSplatRemoteReporterParams = {
    database: string;
    appName: string;
    appVersion: string;
};

/**
 * Report errors or other messages to a remote service.
 */
export class BugSplatRemoteReporter implements IGlobal {
    // Required fields?
    private readonly _database: string;
    private readonly _appName: string;
    private readonly _appVersion: string;

    // Only report on first error (in case it spams hard).
    private readonly _seen: Set<string> = new Set<string>();

    constructor(params: BugSplatRemoteReporterParams) {
        this._database = params.database;
        this._appName = params.appName;
        this._appVersion = params.appVersion;
    }

    init() {
        ErrorHandler.onError.add((error: string) => {
            this.onError(error);
        });
    }

    onError(error: string): void {
        if (this._seen.has(error)) {
            return; // only send once
        }
        this._seen.add(error);

        const onSuccess = () => {};
        const onError = () => {};
        this.sendError(error).then(onSuccess, onError);
    }

    createURL(): string {
        return "https://" + this._database + ".bugsplat.com/post/js/";
    }

    createFetchOptions(error: string): FetchOptions {
        const form: { [key: string]: string } = {
            database: this._database,
            appName: this._appName,
            appVersion: this._appVersion,
            callstack: error,
        };

        const boundary: string = "~~boundary~~";
        const headers: Record<string, string> = {
            "Content-Type": `multipart/form-data;boundary="${boundary}"`,
        };

        const bodyLines: Array<string> = [""];
        Object.entries(form).map(([k, v]) => {
            bodyLines.push(`--${boundary}`);
            bodyLines.push(`Content-Disposition: form-data; name="${k}"`);
            bodyLines.push("");
            bodyLines.push(v);
        });
        bodyLines.push(`--${boundary}--`);
        const body: string = bodyLines.join("\r\n");

        return { body, headers, method: "POST" };
    }

    sendError(error: string): Promise<FetchResponse> {
        //const url: string = "https://postman-echo.com/post";
        const url: string = this.createURL();
        const options: FetchOptions = this.createFetchOptions(error);
        return fetch(url, options);
    }
}
