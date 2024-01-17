import { FetchResponse } from "@tabletop-playground/api";
import { BugSplatRemoteReporter } from "./bugsplat-remote-reporter";

it("init", () => {
    new BugSplatRemoteReporter({
        database: "<your db name here>",
        appName: "unittest",
        appVersion: "1",
    }).init();
});

/*// This test sends an actual crash report, remove from general use!!
it("error", async () => {
    const reporter = new BugSplatRemoteReporter({
        database: "<your db name here>",
        appName: "unittest",
        appVersion: "1",
    });
    reporter.init();

    const report = (res: FetchResponse) => {
        console.log(
            JSON.stringify({ url: res.url, ok: res.ok, status: res.status })
        );
        console.log(res.text());
    };

    const error: string = new Error().stack || "n/a";

    await reporter.sendError(error).then(report, report);
});
//*/
