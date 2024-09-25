import { Button, UIElement, Vector, world } from "@tabletop-playground/api";
import { Timer } from "./timer";

console.log("Timer test");

const timer: Timer = new Timer("@timer/test");

const button: Button = new Button().setFontSize(40).setText("x");
button.onClicked.add(() => {
    timer.toggle();
});

const ui: UIElement = new UIElement();
ui.position = new Vector(0, 0, world.getTableHeight() + 1);
ui.widget = button;

world.addUI(ui);

setInterval(() => {
    console.log(timer.getSeconds());
    button.setText(timer.getTimeString());
}, 1000);
