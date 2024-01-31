import { MockGameObject } from "ttpg-mock";
import { UiVisibility } from "./ui-visibility";
import { ScreenUIElement, UIElement, Widget } from "@tabletop-playground/api";

it("constructor (screen)", () => {
    const screenUI = new ScreenUIElement();
    screenUI.widget = new Widget();
    new UiVisibility(screenUI);
});

it("constructor (world)", () => {
    const ui = new UIElement();
    ui.widget = new Widget();
    new UiVisibility(ui);
});

it("constructor (world with obj)", () => {
    const ui = new UIElement();
    ui.widget = new Widget();
    const obj = new MockGameObject();
    new UiVisibility(ui, obj);
});

it("constructor (missing widget)", () => {
    const screenUI = new ScreenUIElement();
    expect(() => {
        new UiVisibility(screenUI);
    }).toThrow();
});

it("getPlayerPermission", () => {
    const screenUI = new ScreenUIElement();
    screenUI.widget = new Widget();
    new UiVisibility(screenUI).getPlayerPermission();
});

it("isVisibleToPlayer", () => {
    const screenUI = new ScreenUIElement();
    screenUI.widget = new Widget();
    const uiVisibility = new UiVisibility(screenUI);
    expect(uiVisibility.isVisibleToPlayer(1)).toBeTruthy();
});

it("setAll/None", () => {
    const screenUI = new ScreenUIElement();
    screenUI.widget = new Widget();
    const uiVisibility = new UiVisibility(screenUI);
    expect(uiVisibility.isVisibleToPlayer(1)).toBeTruthy(); // initially all
    uiVisibility.setNone();
    expect(uiVisibility.isVisibleToPlayer(1)).toBeFalsy();
    uiVisibility.setAll();
    expect(uiVisibility.isVisibleToPlayer(1)).toBeTruthy();
});

it("setOnlyThisPlayer", () => {
    const screenUI = new ScreenUIElement();
    screenUI.widget = new Widget();
    const uiVisibility = new UiVisibility(screenUI);
    expect(uiVisibility.isVisibleToPlayer(1)).toBeTruthy();
    expect(uiVisibility.isVisibleToPlayer(2)).toBeTruthy();
    uiVisibility.setOnlyThisPlayer(1);
    expect(uiVisibility.isVisibleToPlayer(1)).toBeTruthy();
    expect(uiVisibility.isVisibleToPlayer(2)).toBeFalsy();
});

it("togglePlayer", () => {
    const screenUI = new ScreenUIElement();
    screenUI.widget = new Widget();
    const uiVisibility = new UiVisibility(screenUI);
    expect(uiVisibility.isVisibleToPlayer(1)).toBeTruthy();
    uiVisibility.togglePlayer(1);
    expect(uiVisibility.isVisibleToPlayer(1)).toBeFalsy();
    uiVisibility.togglePlayer(1);
    expect(uiVisibility.isVisibleToPlayer(1)).toBeTruthy();
});

it("update screen ui", () => {
    const screenUI = new ScreenUIElement();
    screenUI.widget = new Widget();
    new UiVisibility(screenUI);
    const ui = new UIElement();
    ui.widget = new Widget();
    const obj = new MockGameObject();
    new UiVisibility(ui, obj).setOnlyThisPlayer(1);
});

it("update world ui", () => {
    const ui = new UIElement();
    ui.widget = new Widget();
    new UiVisibility(ui).setOnlyThisPlayer(1);
});

it("update obj ui", () => {
    const ui = new UIElement();
    ui.widget = new Widget();
    const obj = new MockGameObject();
    new UiVisibility(ui, obj).setOnlyThisPlayer(1);
});
