/**
 * Create game objects using given source colors, screenshot then use the
 * lib-ext extract tool to read color values.
 */ import {
    Border,
    Color,
    GameObject,
    LayoutBox,
    Player,
    refObject,
    Text,
    TextJustification,
    UIElement,
    Vector,
    world,
} from "@tabletop-playground/api";
import { ColorLib } from "./color-lib";
import { ColorsType } from "./colors.data";

// Clear the world before (re)creating objects.
for (const obj of world.getAllObjects()) {
    if (obj !== refObject) {
        obj.destroy();
    }
}

const COLOR_NAMES: Array<string> = [
    "white",
    "blue",
    "purple",
    "green",
    "red",
    "yellow",
    "orange",
    "pink",
];

const SCALE: number = 5 / COLOR_NAMES.length;

const templateId: string = "83FDE12C4E6D912B16B85E9A00422F43"; // cube
const z: number = world.getTableHeight() + 4;

// Create the game object and widget using the given color, OR version with
// corrected colors for comparison.
function create(pos: Vector, colorName: string, correct: boolean): void {
    const colorLib: ColorLib = new ColorLib();

    const colorsType: ColorsType = colorLib.getColorsByNameOrThrow(
        colorName,
        0
    );
    const color: Color = colorLib.parseColorOrThrow(colorsType.target);
    const objColor: Color = colorLib.parseColorOrThrow(colorsType.plastic);
    const widgetColor: Color = colorLib.parseColorOrThrow(colorsType.widget);

    const obj: GameObject | undefined = world.createObjectFromTemplate(
        templateId,
        pos
    );
    if (obj) {
        obj.setScale([SCALE, SCALE, SCALE]);
        obj.setPrimaryColor(color);
        obj.setRoughness(1);
        obj.setMetallic(0);

        obj.setName(color.toHex());

        const ui: UIElement = new UIElement();
        ui.position = new Vector(-4, 0, 2);
        ui.widget = new Border()
            .setColor(color)
            .setChild(
                new LayoutBox()
                    .setOverrideWidth(25)
                    .setOverrideHeight(25)
                    .setChild(
                        new Text()
                            .setText("")
                            .setJustification(TextJustification.Center)
                    )
            );
        obj.addUI(ui);

        if (correct) {
            obj.setPrimaryColor(objColor);

            (ui.widget as Border).setColor(widgetColor);
            console.log(color.toHex(), widgetColor.toHex());
        }
    }
}

let pos = new Vector(0, ((COLOR_NAMES.length - 1) / 2) * -8 * SCALE, z);
for (const colorName of COLOR_NAMES) {
    // Create the game object and widget using the given color.
    create(pos, colorName, false);

    // Create the game object and widget using the corrected color.
    create(pos.add([12 * SCALE, 0, 0]), colorName, true);

    // Move to the next position.
    pos = pos.add([0, 8 * SCALE, 0]);
}

// Look straight down at result.
const player: Player | undefined = world.getAllPlayers()[0];
if (player) {
    console.log(player.getPosition());
    console.log(player.getRotation());

    player.setPositionAndRotation([0, 0, 155], [-90, 0, 0]);
}
