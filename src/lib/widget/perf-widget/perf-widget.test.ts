import { PerfWidget } from "./perf-widget";

it("constructor", () => {
    const perfWidget = new PerfWidget();
    perfWidget.destroy();
});

it("destroy", () => {
    const perfWidget = new PerfWidget();
    perfWidget.destroy();
});

it("refresh", () => {
    const perfWidget = new PerfWidget();
    perfWidget.refresh();
    perfWidget.destroy();
});

it("getWidget", () => {
    const perfWidget = new PerfWidget();
    perfWidget.getWidget();
    perfWidget.destroy();
});

it("toggleVisibility", () => {
    const perfWidget = new PerfWidget();
    perfWidget.toggleVisibility(1).toggleVisibility(1);
    perfWidget.destroy();
});

it("attach/detach", () => {
    const perfWidget = new PerfWidget();
    perfWidget.attachToScreen().attachToScreen().detach().detach();
    perfWidget.destroy();
});
