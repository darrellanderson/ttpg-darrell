import { FetchOptions, FetchResponse } from "@tabletop-playground/api";
import { BugSplatRemoteReporter } from "./bugsplat-remote-reporter";
import { ErrorHandler } from "./error-handler";

it("init", () => {
    new BugSplatRemoteReporter({
        database: "<your db name here>",
        appName: "unittest",
        appVersion: "1",
    }).init();
});

it("createURL", () => {
    const reporter = new BugSplatRemoteReporter({
        database: "<your db name here>",
        appName: "unittest",
        appVersion: "1",
    });
    const url: string = reporter.createURL();
    expect(url).toEqual("https://<your db name here>.bugsplat.com/post/js/");
});

it("createFetchOptions", () => {
    const reporter = new BugSplatRemoteReporter({
        database: "<your db name here>",
        appName: "unittest",
        appVersion: "1",
    });
    const options: FetchOptions = reporter.createFetchOptions("my-error");
    expect(options.method).toEqual("POST");
    expect(options.headers).toEqual({
        "Content-Type": 'multipart/form-data;boundary="~~boundary~~"',
    });
    expect(options.body?.split("\r\n")).toEqual([
        "",
        "--~~boundary~~",
        'Content-Disposition: form-data; name="database"',
        "",
        "<your db name here>",
        "--~~boundary~~",
        'Content-Disposition: form-data; name="appName"',
        "",
        "unittest",
        "--~~boundary~~",
        'Content-Disposition: form-data; name="appVersion"',
        "",
        "1",
        "--~~boundary~~",
        'Content-Disposition: form-data; name="callstack"',
        "",
        "Error: my-error",
        "--~~boundary~~--",
    ]);
});

it("use FetchResponse", () => {
    expect(FetchResponse).toBeDefined();
});

it("mock fetch", () => {
    jest.spyOn(globalThis, "fetch").mockImplementation(() => {
        return new Promise<Response>(() => {});
    });

    const reporter = new BugSplatRemoteReporter({
        database: "<your db name here>",
        appName: "unittest",
        appVersion: "1",
    });
    reporter.init();

    ErrorHandler.onError.trigger("test");
    ErrorHandler.onError.trigger("test"); // suppressed duplicate

    jest.restoreAllMocks();
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
        console.log("report");
        console.log(
            JSON.stringify({ url: res.url, ok: res.ok, status: res.status })
        );
        //console.log(res.text());
    };

    const error: string = new Error("unittest").stack || "n/a";

    await reporter.sendError(error).then(report, report);
});
//*/
