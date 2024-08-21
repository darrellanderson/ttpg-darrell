/**
 * Create game objects using given source colors, screenshot then use the
 * lib-ext extract tool to read color values.
 */
import {
    Border,
    Color,
    GameObject,
    LayoutBox,
    Player,
    refObject,
    UIElement,
    Vector,
    world,
} from "@tabletop-playground/api";
import { Shuffle } from "../shuffle/shuffle";

// Clear the world before (re)creating objects.
for (const obj of world.getAllObjects()) {
    if (obj !== refObject) {
        obj.destroy();
    }
}

const templateId: string = "83FDE12C4E6D912B16B85E9A00422F43"; // cube
const cube: GameObject | undefined = world.createObjectFromTemplate(
    templateId,
    new Vector(0, 0, world.getTableHeight() + 4)
);
if (!cube) {
    throw new Error("Failed to create object");
}
cube.setRoughness(1);
cube.setMetallic(0);
cube.snapToGround();

const border: Border = new Border();
const ui: UIElement = new UIElement();
ui.position = new Vector(-4, 0, 2);
ui.widget = border.setChild(
    new LayoutBox().setOverrideWidth(25).setOverrideHeight(25)
);
cube.addUI(ui);

// Look straight down at result.
const player: Player | undefined = world.getAllPlayers()[0];
if (player) {
    console.log(player.getPosition());
    console.log(player.getRotation());

    const z = world.getTableHeight() + 40;
    player.setPositionAndRotation([-10, -25, z], [-90, 0, 0]);
}

const n: number = 16;
let colors: Array<Color> = [];
for (let r = 0; r < n; r++) {
    for (let g = 0; g < n; g++) {
        for (let b = 0; b < n; b++) {
            const color: Color = new Color(
                r / (n - 1),
                g / (n - 1),
                b / (n - 1)
            );
            colors.push(color);
        }
    }
}
colors = new Shuffle<Color>().shuffle(colors);
console.log("|colors|:", colors.length);

function setToNextColor(): boolean {
    const color: Color | undefined = colors.shift();
    if (color) {
        console.log(color.toHex(), colors.length);
        world.setSlotColor(0, color);
        cube?.setPrimaryColor(color);
        border.setColor(color);
    }
    return color !== undefined;
}

const handle = setInterval(() => {
    if (!setToNextColor()) {
        clearInterval(handle);
    }
}, 3000);
