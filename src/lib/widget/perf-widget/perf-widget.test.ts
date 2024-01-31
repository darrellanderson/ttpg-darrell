import { PerfWidget } from "./perf-widget";

it("constructor", () => {
    new PerfWidget();
});

it("destroy", () => {
    new PerfWidget().destroy();
});

it("refresh", () => {
    new PerfWidget().refresh();
});

it("getWidget", () => {
    new PerfWidget().getWidget();
});

it("toggleVisibility", () => {
    new PerfWidget().toggleVisibility(1).toggleVisibility(1);
});
