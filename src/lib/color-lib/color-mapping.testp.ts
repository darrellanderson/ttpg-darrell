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

// Clear the world before (re)creating objects.
for (const obj of world.getAllObjects()) {
    if (obj !== refObject) {
        obj.destroy();
    }
}

// Andcat's "good" player color choices.
const TRAINING_COLORS: Array<Color> = [
    "#00c20a",
    "#5dc262",
    "#0c9113",
    "#82eb09",
    "#09eb67",
    "#ff0909",
    "#ad5e5e",
    "#c02516",
    "#cf213e",
    "#ff6969",
    "#ffdc13",
    "#fce979",
    "#a69317",
    "#d6bd4b",
    "#f6ff00",
    "#f68cd7",
    "#edadd9",
    "#c21f90",
    "#bd2db0",
    "#de64b1",
    "#ff8d54",
    "#e09f5c",
    "#854300",
    "#ff6200",
    "#ffa600",
    "#9d00f8",
    "#af76cf",
    "#681d91",
    "#945ced",
    "#a600ff",
    "#39c1ff",
    "#6fd9f2",
    "#0e96b5",
    "#00ffea",
    "#0091ff",
    "#e6e6e6",
    "#969696",
    "#4a4a4a",
    "#2c2c2e",
    "#2e2626",
].map((hexColor: string): Color => new ColorLib().parseColorOrThrow(hexColor));

const SCALE: number = 15 / TRAINING_COLORS.length;

const templateId: string = "83FDE12C4E6D912B16B85E9A00422F43"; // cube
const z: number = world.getTableHeight() + 4;

// Create the game object and widget using the given color, OR version with
// corrected colors for comparison.
function create(pos: Vector, color: Color, correct: boolean): void {
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
            const colorLib: ColorLib = new ColorLib();

            const objColor: Color = colorLib.colorToObjectColor(color);
            obj.setPrimaryColor(objColor);

            const widgetColor: Color = colorLib.colorToWidgetColor(color);
            (ui.widget as Border).setColor(widgetColor);
            console.log(color.toHex(), widgetColor.toHex());
        }
    }
}

const srcColors: Array<Array<number>> = [];
let pos = new Vector(0, ((TRAINING_COLORS.length - 1) / 2) * -8 * SCALE, z);
for (const color of TRAINING_COLORS) {
    const s: number = 10000;
    srcColors.push([
        Math.floor(color.r * s) / s,
        Math.floor(color.g * s) / s,
        Math.floor(color.b * s) / s,
    ]);

    // Create the game object and widget using the given color.
    create(pos, color, true);

    // Create the game object and widget using the corrected color.
    create(pos.add([8 * SCALE, 0, 0]), color, false);

    // Move to the next position.
    pos = pos.add([0, 8 * SCALE, 0]);
}

console.log(JSON.stringify(srcColors));
console.log("|colors| = " + srcColors.length);

// Look straight down at result.
const player: Player | undefined = world.getAllPlayers()[0];
if (player) {
    console.log(player.getPosition());
    console.log(player.getRotation());

    player.setPositionAndRotation([0, 0, 155], [-90, 0, 0]);
}
