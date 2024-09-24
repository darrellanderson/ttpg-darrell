import { UIElement, Vector, world } from "@tabletop-playground/api";
import { EditTimerWidget } from "./edit-timer-widget";
import { Timer } from "./timer";

const timer = new Timer("@timer/test");
const widget = new EditTimerWidget(timer);

const ui: UIElement = new UIElement();
ui.position = new Vector(0, 0, world.getTableHeight() + 1);
ui.widget = widget.createWidget();

world.addUI(ui);
