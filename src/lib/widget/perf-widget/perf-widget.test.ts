import { MockPlayer, mockGlobalEvents } from "ttpg-mock";
import { PerfWidget } from "./perf-widget";
import { locale } from "../../locale/locale";

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

it("toggle event", () => {
    const perfWidget = new PerfWidget();
    const player = new MockPlayer();
    const customAction = locale("perf-widget.context-menu.toggle-perf");
    mockGlobalEvents._customActionAsPlayer(player, customAction);
    perfWidget.destroy();
});
