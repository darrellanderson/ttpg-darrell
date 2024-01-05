import { ErrorHandler, ErrorLocation } from "./error-handler";

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

it("parse stack trace", () => {
    const stack: string = [
        "Error: err!",
        "  at a (file://.../Scripts/global/error-handler/error-handler.js:31:19)",
        "  at b (file://.../Scripts/global/error-handler/error-handler.js:34:13)",
    ].join("\n");

    const errorLocations: ErrorLocation[] =
        new ErrorHandler().parseErrorLocations(stack);
    expect(errorLocations).toBeDefined();
    expect(errorLocations[0].method).toEqual("a");
    expect(errorLocations[1].method).toEqual("b");
});

it("parseSourceMappings", () => {
    const encoded =
        ";;;AAAA,kDAAiD;AACjD,+CAA8C;AAgB9C,MAAa,YAAa,SAAQ,6BAAc;IAM5C;;;;";
    const lineMapping = new ErrorHandler().parseSourceMappings(encoded);
    expect(lineMapping).toEqual([-1, -1, -1, 0, 1, 17, 23, -1, -1, -1, -1]);
});

it("parseSourceMappingSegment", () => {
    const errorHandler = new ErrorHandler();
    let decoded: number[];

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
});
