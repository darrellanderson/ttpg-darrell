import { Text, UIElement, Vector, world } from "@tabletop-playground/api";
import { EditTimer } from "./edit-timer";
import { Timer } from "./timer";

const timer = new Timer("@timer/test");
const editTimer = new EditTimer(timer);

const ui: UIElement = new UIElement();
const onClose = (): void => {
    console.log("Closing edit timer");
    world.removeUIElement(ui);
};

ui.position = new Vector(0, 0, world.getTableHeight() + 2);
ui.widget = editTimer.createWidget(onClose);
world.addUI(ui);

const timerText = new Text();
timer.addTimerText(timerText);

const timerUi = new UIElement();
timerUi.position = new Vector(0, 0, world.getTableHeight() + 1);
timerUi.widget = timerText;
world.addUI(timerUi);

timer.onTimerExpired.add(() => {
    console.log("Timer expired");
});
