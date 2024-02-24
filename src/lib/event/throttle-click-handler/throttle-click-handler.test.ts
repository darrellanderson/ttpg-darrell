import { Button } from "@tabletop-playground/api";
import { ThrottleClickHandler } from "./throttle-click-handler";
import { MockButton, MockPlayer } from "ttpg-mock";

it("constructor", () => {
    new ThrottleClickHandler<Button>(() => {});
});

it("throttle", () => {
    const button: MockButton = new MockButton();

    let clickCount = 0;
    button.onClicked.add(
        new ThrottleClickHandler<Button>(() => {
            clickCount++;
        }).get()
    );

    expect(clickCount).toEqual(0);
    button._clickAsPlayer(new MockPlayer());
    expect(clickCount).toEqual(1);
    button._clickAsPlayer(new MockPlayer());
    expect(clickCount).toEqual(1);
});
