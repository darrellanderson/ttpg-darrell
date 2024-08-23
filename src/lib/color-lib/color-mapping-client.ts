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
    fetch,
    world,
} from "@tabletop-playground/api";

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

let rawColor: Color | undefined;
function fetchAndSetColor(): void {
    let url: string = "http://localhost:8013/color";
    if (rawColor) {
        const r: number = Math.round(rawColor.r * 255);
        const g: number = Math.round(rawColor.g * 255);
        const b: number = Math.round(rawColor.b * 255);
        url += `?r=${r}&g=${g}&b=${b}`;
    }
    fetch(url).then((response) => {
        if (response.text() === "") {
            return; // done!
        }
        const json: { [k: string]: number } = response.json() as {
            [k: string]: number;
        };
        const r: number | undefined = json.r;
        const g: number | undefined = json.g;
        const b: number | undefined = json.b;
        if (r !== undefined && g !== undefined && b !== undefined) {
            rawColor = new Color(r / 255, g / 255, b / 255);
            world.setSlotColor(0, rawColor);
            cube?.setPrimaryColor(rawColor);
            border.setColor(rawColor);
            let ticksRemaining: number = 8;
            const maybeFetchAndSetColor = (): void => {
                if (ticksRemaining > 0) {
                    ticksRemaining--;
                    process.nextTick(maybeFetchAndSetColor);
                } else {
                    fetchAndSetColor();
                }
            };
            maybeFetchAndSetColor();
        }
    });
}

fetchAndSetColor();
