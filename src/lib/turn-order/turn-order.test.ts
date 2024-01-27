import { TurnOrder } from "./turn-order";

it("constructor", () => {
    new TurnOrder("@test/test");
});

it("save/restore", () => {
    const savedDataKey = "@test/test";
    const order = [1, 2, 3];
    const current = 2;
    const eliminated = 3;
    const passed = 1;

    let turnOrder = new TurnOrder(savedDataKey);
    turnOrder.setTurnOrder(order, "reverse", current);
    turnOrder.setEliminated(eliminated, true);
    turnOrder.setPassed(passed, true);

    turnOrder = new TurnOrder(savedDataKey);
    expect(turnOrder.getTurnOrder()).toEqual(order);
    expect(turnOrder.getDirection()).toEqual("reverse");
    expect(turnOrder.getCurrentTurn()).toEqual(current);
    expect(turnOrder.getEliminated(eliminated)).toBeTruthy();
    expect(turnOrder.getPassed(passed)).toBeTruthy();
});

it('nextTurn', () => {
    const turnOrder = new TurnOrder('@test/test')
    turnOrder.setTurnOrder([1, 2, 3], 'forward', 1)
    expect(turnOrder.getCurrentTurn()).toEqual(1)
    expect(turnOrder.nextTurn()).toEqual(2)
    expect(turnOrder.nextTurn()).toEqual(3)
    expect(turnOrder.nextTurn()).toEqual(1)
})