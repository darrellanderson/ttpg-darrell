import {
    Button,
    UIElement,
    Vector,
    Widget,
    refObject,
} from "@tabletop-playground/api";
import { ConfirmButton } from "./confirm-button";

const button: Button = new Button().setText("Click me");
button.onClicked.add(() => {
    console.log("Click me: clicked");
});

const widget: Widget = new ConfirmButton(button).getWidget();

const ui: UIElement = new UIElement();
ui.widget = widget;
ui.position = new Vector(0, 0, 3);

refObject.addUI(ui);
