import { ErrorHandler, ErrorLocation } from "./error-handler";
import { MockPackage, mockWorld } from "ttpg-mock";

it("parseErrorLocation (no method)", () => {
    const line: string =
        "  at file://.../Scripts/obj/unit/r-to-tip-over.js:24:15";
    const errorLocation: ErrorLocation | undefined =
        new ErrorHandler().parseErrorLocation(line);
    expect(errorLocation).toBeDefined();
    expect(errorLocation?.method).toBeUndefined();
    expect(errorLocation?.file).toEqual("obj/unit/r-to-tip-over.js");
    expect(errorLocation?.jsLine).toBe(24);
    expect(errorLocation?.jsColumn).toBe(15);
});

it("parseErrorLocation (with method)", () => {
    const line: string =
        "  at Demo.foo (file://.../Scripts/obj/unit/r-to-tip-over.js:24:15)";
    const errorLocation: ErrorLocation | undefined =
        new ErrorHandler().parseErrorLocation(line);
    expect(errorLocation).toBeDefined();
    expect(errorLocation?.method).toEqual("Demo.foo");
    expect(errorLocation?.file).toEqual("obj/unit/r-to-tip-over.js");
    expect(errorLocation?.jsLine).toBe(24);
    expect(errorLocation?.jsColumn).toBe(15);
});

it("report error", () => {
    let output: string = "";
    jest.spyOn(console, "log").mockImplementation((message?: unknown) => {
        output = message as string;
    });
    new ErrorHandler().reportError("test");
    jest.restoreAllMocks();
    expect(output).toEqual("----------\ntest\n----------");
});

it("rewrite stack trace", () => {
    const stack: string = [
        "Error: err!",
        "  at a (file://.../Scripts/global/error-handler/error-handler.js:31:19)",
        "  at b (file://.../Scripts/global/error-handler/error-handler.js:34:13)",
    ].join("\n");

    const rewrite: string = new ErrorHandler().rewriteError(stack);
    expect(rewrite).toEqual(
        [
            "Error: err!",
            "  at a global/error-handler/error-handler.js:31",
            "  at b global/error-handler/error-handler.js:34",
        ].join("\n")
    );
});

it("parseSourceMappings", () => {
    const encoded =
        ";;;AAAA,kDAAiD;AACjD,+CAA8C;AAgB9C,MAAa,YAAa,SAAQ,6BAAc;IAM5C;;;;";
    const lineMapping = new ErrorHandler().parseSourceMappings(encoded);
    expect(lineMapping).toEqual([0, 0, 0, 0, 1, 17, 23, 0, 0, 0, 0]);
});

it("parseSourceMappings (segments)", () => {
    const encoded = "AAZgB,kBAAQ,GAAY,KAAK,CAAC";
    const lineMapping = new ErrorHandler().parseSourceMappings(encoded);
    expect(lineMapping).toEqual([-12]);
});

it("_parseSextets", () => {
    const sextets: Array<number> = new ErrorHandler()._parseSextets("A/XCF");
    expect(sextets).toEqual([0, 63, 23, 2, 5]);
});

it("_splitVlqs", () => {
    const vlqs: Array<Array<number>> = new ErrorHandler()._splitVlqs([
        0b100000, 0b101000, 0b100000, 0b100010, 0b110000, 0b100000, 0b000100,
        0b010000, 0b100011, 0b000101,
    ]);
    expect(vlqs).toEqual([
        [0b100000, 0b101000, 0b100000, 0b100010, 0b110000, 0b100000, 0b000100],
        [0b010000],
        [0b100011, 0b000101],
    ]);
});

it("parseSourceMappingSegment", () => {
    const errorHandler = new ErrorHandler();
    const decoded: Array<number> =
        errorHandler.parseSourceMappingSegment("wkpykpCQjF");
    expect(decoded).toEqual([1227133512, 8, -81]);
});

it("parseSourceMappingSegment (more)", () => {
    const errorHandler = new ErrorHandler();
    let decoded: Array<number>;

    decoded = errorHandler.parseSourceMappingSegment("uDt7D0TkuK");
    expect(decoded).toEqual([55, -1974, 314, 5346]);

    decoded = errorHandler.parseSourceMappingSegment("AAAA");
    expect(decoded).toEqual([0, 0, 0, 0]);
    decoded = errorHandler.parseSourceMappingSegment("kDAAiD");
    expect(decoded).toEqual([50, 0, 0, 49]);

    decoded = errorHandler.parseSourceMappingSegment("AACjD");
    expect(decoded).toEqual([0, 0, 1, -49]);
    decoded = errorHandler.parseSourceMappingSegment("+CAA8C");
    expect(decoded).toEqual([47, 0, 0, 46]);

    decoded = errorHandler.parseSourceMappingSegment("AAgB9C");
    expect(decoded).toEqual([0, 0, 16, -46]);

    decoded = errorHandler.parseSourceMappingSegment("IAM5C");
    expect(decoded).toEqual([4, 0, 6, -44]);

    expect(() => {
        // Not a base64 string.
        errorHandler.parseSourceMappingSegment("$");
    }).toThrow();

    expect(() => {
        // continue bit set, but no following sextet.
        errorHandler.parseSourceMappingSegment("uDt7D0Tku");
    }).toThrow();
});

it("getMap", () => {
    const jsFile: string = "my-file.js";
    const mapFile: string = jsFile + ".map";
    const mapData: string = "my-data";
    mockWorld._reset({
        packages: [new MockPackage({ scriptFiles: [jsFile, mapFile] })],
        _scriptFileToData: { [mapFile]: mapData },
    });
    const text: string | undefined = new ErrorHandler().getMap(jsFile);
    expect(text).toEqual(mapData);
});

it("getLineMapping (empty file)", () => {
    const lineMapping: Array<number> | undefined =
        new ErrorHandler().getLineMapping("");
    expect(lineMapping).toBeUndefined();
});

it("getLineMapping (js file, but no map file)", () => {
    const jsFile: string = "my-file.js";
    mockWorld._reset({
        packages: [new MockPackage({ scriptFiles: [jsFile] })],
    });

    const errorHandler = new ErrorHandler(); // same instance for cache
    let lineMapping: Array<number> | undefined =
        errorHandler.getLineMapping(jsFile);
    expect(lineMapping).toBeUndefined();

    // Read it a second time (nack cache).
    lineMapping = new ErrorHandler().getLineMapping(jsFile);
    expect(lineMapping).toBeUndefined();
});

it("getLineMapping (map file)", () => {
    const jsFile: string = "my-file.js";
    const mapFile: string = jsFile + ".map";
    const mapData: string = JSON.stringify({
        mappings:
            ";;;AAAA,kDAAiD;AACjD,+CAA8C;AAgB9C,MAAa,YAAa,SAAQ,6BAAc;IAM5C;;;;",
    });
    mockWorld._reset({
        packages: [new MockPackage({ scriptFiles: [jsFile, mapFile] })],
        _scriptFileToData: { [mapFile]: mapData },
    });

    const errorHandler = new ErrorHandler(); // same instance for cache
    let lineMapping: Array<number> | undefined =
        errorHandler.getLineMapping(jsFile);
    expect(lineMapping).toEqual([0, 0, 0, 0, 1, 17, 23, 0, 0, 0, 0]);

    // Read it a second time (fetched from cache).
    lineMapping = errorHandler.getLineMapping(jsFile);
    expect(lineMapping).toEqual([0, 0, 0, 0, 1, 17, 23, 0, 0, 0, 0]);
});

it("getLineMapping (corrupt map file)", () => {
    const jsFile: string = "my-file.js";
    const mapFile: string = jsFile + ".map";
    const mapData: string = "not json";
    mockWorld._reset({
        packages: [new MockPackage({ scriptFiles: [jsFile, mapFile] })],
        _scriptFileToData: { [mapFile]: mapData },
    });

    jest.spyOn(console, "log").mockImplementation(() => {});
    const lineMapping: Array<number> | undefined =
        new ErrorHandler().getLineMapping(jsFile);
    jest.restoreAllMocks();
    expect(lineMapping).toBeUndefined();
});

it("getLineMapping (json field wrong type)", () => {
    const jsFile: string = "my-file.js";
    const mapFile: string = jsFile + ".map";
    const mapData: string = JSON.stringify({
        mappings: 7,
    });
    mockWorld._reset({
        packages: [new MockPackage({ scriptFiles: [jsFile, mapFile] })],
        _scriptFileToData: { [mapFile]: mapData },
    });

    jest.spyOn(console, "log").mockImplementation(() => {});
    const lineMapping: Array<number> | undefined =
        new ErrorHandler().getLineMapping(jsFile);
    jest.restoreAllMocks();
    expect(lineMapping).toBeUndefined();
});

it("rewriteError (with mapping)", () => {
    const jsFile: string = "my-file.js";
    const mapFile: string = jsFile + ".map";
    const mapData: string = JSON.stringify({
        mappings:
            ";;;AAAA,kDAAiD;AACjD,+CAA8C;AAgB9C,MAAa,YAAa,SAAQ,6BAAc;IAM5C;;;;",
    });
    mockWorld._reset({
        packages: [new MockPackage({ scriptFiles: [jsFile, mapFile] })],
        _scriptFileToData: { [mapFile]: mapData },
    });

    const error: string = "at file://Scripts/my-file.js:6:0";
    const rewritten: string = new ErrorHandler().rewriteError(error);
    expect(rewritten).toEqual("  at undefined my-file.js:6 <= .ts:23");
});

it("init", () => {
    new ErrorHandler().init();
});

// eslint-disable-next-line @typescript-eslint/no-namespace
declare module globalThis {
    // eslint-disable-next-line no-var
    var $uncaughtException: (e: string) => void;
}
it("uncaughtException handler", () => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    new ErrorHandler().init();
    globalThis.$uncaughtException("test");
    jest.restoreAllMocks();
});
