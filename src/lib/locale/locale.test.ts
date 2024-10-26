import { locale } from "./locale";

locale.inject({
    "example.helloworld": "Hello World!",
    "example.replaced": "{player} has run this script {x} {#x|time|times}",
});

it("does a basic replace", () => {
    // "example.helloworld": "Hello World!"
    expect(locale("example.helloworld")).toEqual("Hello World!");
});

it("handles pluralization", () => {
    //"example.replaced": "{player} has run this script {x} {#x|time|times}"
    expect(
        locale("example.replaced", { player: "ThatRobHuman", x: 0 })
    ).toEqual("ThatRobHuman has run this script 0 times");
    expect(
        locale("example.replaced", { player: "ThatRobHuman", x: 1 })
    ).toEqual("ThatRobHuman has run this script 1 time");
    expect(
        locale("example.replaced", { player: "ThatRobHuman", x: 2 })
    ).toEqual("ThatRobHuman has run this script 2 times");
});

it("empty replace string", () => {
    expect(locale("example.replaced", { player: "", x: 2 })).toEqual(
        " has run this script 2 times"
    );
});

it("unknown replace entry", () => {
    expect(
        locale("example.replaced", { player: "", x: 2, noSuchItem: "x" })
    ).toEqual(" has run this script 2 times");
});

it("missing", () => {
    const s = "test.does_not_exist.foo.bar.baz";
    expect(locale(s)).toEqual(s);
});

it("inject", () => {
    const s = "test.my_test_inject";
    expect(locale(s)).toEqual(s);
    const v = "my_new_value";
    locale.inject({ [s]: v });
    expect(locale(s)).toEqual(v);
});

describe("copilot test locale", () => {
    beforeEach(() => {
        locale.inject({
            test: "This is a test",
            hello: "Hello, {name}!",
            apples: "{#count|one apple|{count} apples}",
        });
    });

    test("returns the localized string when the key is found", () => {
        expect(locale("test")).toBe("This is a test");
    });

    test("returns the key when the key is not found", () => {
        expect(locale("notfound")).toBe("notfound");
    });

    test("replaces placeholders with the corresponding values", () => {
        expect(locale("hello", { name: "John" })).toBe("Hello, John!");
    });

    test("handles pluralization", () => {
        expect(locale("apples", { count: 1 })).toBe("one apple");
        expect(locale("apples", { count: 2 })).toBe("2 apples");
        expect(locale("apples", { count: 0 })).toBe("0 apples");
    });

    test("throws an error when the pluralization match fails", () => {
        locale.inject({ bad: "{#count|one}" });
        expect(() => locale("bad", { count: 1 })).toThrowError();
    });
});
