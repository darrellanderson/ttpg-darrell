import { Button, Widget } from "@tabletop-playground/api";
import { ConfirmButton } from "./confirm-button";

it("constructor", () => {
    const button: Button = new Button();
    const widget: Widget = new ConfirmButton(button)
        .setConfirmFontSize(20)
        .setConfirmMessage("foo")
        .getWidget();
    expect(widget).toBeDefined();
});
