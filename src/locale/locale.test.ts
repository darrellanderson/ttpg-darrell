import { locale } from "./locale";

locale.inject({
  "example.helloworld": "Hello World!",
  "example.replaced":
    "{player} has run this script {x} {#x|time|times|times... newb}",
});

it("does a basic replace", () => {
  // "example.helloworld": "Hello World!"
  expect(locale("example.helloworld")).toEqual("Hello World!");
});

it("handles pluralization", () => {
  //"example.replaced": "{player} has run this script {x} {#x|time|times|times... newb}"
  expect(locale("example.replaced", { player: "ThatRobHuman", x: 0 })).toEqual(
    "ThatRobHuman has run this script 0 times... newb"
  );
  expect(locale("example.replaced", { player: "ThatRobHuman", x: 1 })).toEqual(
    "ThatRobHuman has run this script 1 time"
  );
  expect(locale("example.replaced", { player: "ThatRobHuman", x: 2 })).toEqual(
    "ThatRobHuman has run this script 2 times"
  );
});

it("empty replace string", () => {
  expect(locale("example.replaced", { player: "", x: 2 })).toEqual(
    " has run this script 2 times"
  );
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
