// Resolution options are all 16/9 aspect ratio, but what about full screen?
// Tests see window height is 720 when using the smallest option for screen resolution.

import {
    Border,
    Canvas,
    HorizontalAlignment,
    LayoutBox,
    ScreenUIElement,
    Text,
    world,
} from "@tabletop-playground/api";

console.log("--- SCREEN TEST ---");

const box = new LayoutBox();

const screenUI = new ScreenUIElement();
screenUI.anchorX = 1.1;
screenUI.anchorY = -0.1;
screenUI.positionX = 1;
screenUI.relativePositionX = true;
screenUI.relativeHeight = true;
screenUI.relativeWidth = true;
screenUI.height = 0.5;
screenUI.width = 0.5;
screenUI.widget = new Border()
    .setColor([1, 0, 0, 1])
    .setChild(
        new LayoutBox()
            .setHorizontalAlignment(HorizontalAlignment.Fill)
            .setChild(
                new Canvas().addChild(new Text().setText("X"), 0, 0, 20, 20)
            )
    );

world.addScreenUI(screenUI);
