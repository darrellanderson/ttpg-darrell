// Resolution options are all 16/9 aspect ratio, but what about full screen?
// Tests see window height is 720 when using the smallest option for screen resolution.

import {
    Border,
    LayoutBox,
    ScreenUIElement,
    world,
} from "@tabletop-playground/api";

console.log("--- SCREEN TEST ---");

const box = new LayoutBox();

const screenUI = new ScreenUIElement();
screenUI.anchorX = 1;
screenUI.anchorY = 0;
screenUI.positionX = 1;
screenUI.relativePositionX = true;
screenUI.height = 710;
screenUI.width = 100;
screenUI.widget = new Border().setColor([1, 0, 0, 1]).setChild(box);

world.addScreenUI(screenUI);
