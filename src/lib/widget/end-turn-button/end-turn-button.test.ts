import { Player, Widget } from "@tabletop-playground/api";
import { TurnOrder } from "../../turn-order/turn-order";
import { EndTurnButton } from "./end-turn-button";
import { MockPlayer } from "ttpg-mock";
import { clickAll } from "../../jest-util/click-all/click-all";

it("constructor", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    new EndTurnButton(turnOrder, {});
});

it("destroy", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    new EndTurnButton(turnOrder, {}).destroy();
});

it("update (no current player)", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    const endTurnButton = new EndTurnButton(turnOrder, {});

    turnOrder.setCurrentTurn(1);
    endTurnButton.update();

    turnOrder.setCurrentTurn(-1);
    endTurnButton.update();
});

it("update (with sound)", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    new EndTurnButton(turnOrder, {
        sound: "my-sound",
    }).attachToScreen();
    turnOrder.setCurrentTurn(2);
});

it("update (with sound, adjust volume)", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    new EndTurnButton(turnOrder, {
        sound: "my-sound",
        volume: 0.5,
    }).attachToScreen();
    turnOrder.setCurrentTurn(2);
});

it("attach/detach", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test");
    new EndTurnButton(turnOrder, { scale: 2 })
        .attachToScreen()
        .attachToScreen()
        .detach()
        .detach();
});

it("click", () => {
    const turnOrder: TurnOrder = new TurnOrder("@test/test").setTurnOrder(
        [1, 2, 3],
        "forward",
        1
    );
    const widget: Widget = new EndTurnButton(turnOrder, {}).getWidget();

    expect(turnOrder.getCurrentTurn()).toEqual(1);

    // First click advances turn.
    const player: Player = new MockPlayer({ slot: 1 });
    clickAll(widget, player);
    expect(turnOrder.getCurrentTurn()).toEqual(2);

    // Second click ignored because clicking player slot is not current turn.
    clickAll(widget, player);
    expect(turnOrder.getCurrentTurn()).toEqual(2);
});
