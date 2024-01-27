import { Direction, TurnOrder } from "./turn-order";

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

it('nextTurn (forward)', () => {
    const turnOrder = new TurnOrder('@test/test')
    turnOrder.setTurnOrder([1, 2, 3], 'forward', 1)
    expect(turnOrder.getCurrentTurn()).toEqual(1)
    expect(turnOrder.nextTurn()).toEqual(2)
    expect(turnOrder.nextTurn()).toEqual(3)
    expect(turnOrder.nextTurn()).toEqual(1)
})

it('nextTurn (reverse)', () => {
    const turnOrder = new TurnOrder('@test/test')
    turnOrder.setTurnOrder([1, 2, 3], 'reverse', 3)
    expect(turnOrder.getCurrentTurn()).toEqual(3)
    expect(turnOrder.nextTurn()).toEqual(2)
    expect(turnOrder.nextTurn()).toEqual(1)
    expect(turnOrder.nextTurn()).toEqual(3)
})

it('nextTurn (snake)', () => {
    const turnOrder = new TurnOrder('@test/test')
    turnOrder.setTurnOrder([1, 2, 3], 'snake', 1)
    expect(turnOrder.getCurrentTurn()).toEqual(1)
    expect(turnOrder.nextTurn()).toEqual(2)
    expect(turnOrder.nextTurn()).toEqual(3)
    expect(turnOrder.nextTurn()).toEqual(3) // last repeats
    expect(turnOrder.nextTurn()).toEqual(2)
    expect(turnOrder.nextTurn()).toEqual(1)
    expect(turnOrder.nextTurn()).toEqual(1) // last repeats
    expect(turnOrder.nextTurn()).toEqual(2)
})

it('nextTurn (invalid)', () => {
    const turnOrder = new TurnOrder('@test/test')
    turnOrder.setTurnOrder([1, 2, 3], 'forward', 4)
    expect(turnOrder.nextTurn()).toEqual(-1)
})

it('get/set current turn', () => {
    const turnOrder = new TurnOrder('@test/test')
    const value = 7
    expect(turnOrder.setCurrentTurn(value)).toEqual(turnOrder)
    expect(turnOrder.getCurrentTurn()).toEqual(value)
})

it('get/set turn order', () => {
    const turnOrder = new TurnOrder('@test/test')
    const value = [1, 2, 3]
    const direction = 'forward'
    const current = 4
    expect(turnOrder.setTurnOrder(value, direction, current)).toEqual(turnOrder)
    expect(turnOrder.getTurnOrder()).toEqual(value)
    expect(turnOrder.getDirection()).toEqual(direction)
    expect(turnOrder.getCurrentTurn()).toEqual(current)
})

it('get/set direction', () => {
    const turnOrder = new TurnOrder('@test/test')
    let value: Direction
    value = 'forward'
    expect(turnOrder.setDirection(value)).toEqual(turnOrder)
    expect(turnOrder.getDirection()).toEqual(value)
    value = 'reverse'
    expect(turnOrder.setDirection(value)).toEqual(turnOrder)
    expect(turnOrder.getDirection()).toEqual(value)
    value = 'snake'
    expect(turnOrder.setDirection(value)).toEqual(turnOrder)
    expect(turnOrder.getDirection()).toEqual(value)
})

it('get/set eliminated', () => {
    const turnOrder = new TurnOrder('@test/test')
    const playerSlot = 7
    expect(turnOrder.getEliminated(playerSlot)).toBeFalsy()
    expect(turnOrder.setEliminated(playerSlot, true)).toEqual(turnOrder)
    expect(turnOrder.getEliminated(playerSlot)).toBeTruthy()
    expect(turnOrder.setEliminated(playerSlot, false)).toEqual(turnOrder)
    expect(turnOrder.getEliminated(playerSlot)).toBeFalsy()
})

it('get/set passed', () => {
    const turnOrder = new TurnOrder('@test/test')
    const playerSlot = 7
    expect(turnOrder.getPassed(playerSlot)).toBeFalsy()
    expect(turnOrder.setPassed(playerSlot, true)).toEqual(turnOrder)
    expect(turnOrder.getPassed(playerSlot)).toBeTruthy()
    expect(turnOrder.setPassed(playerSlot, false)).toEqual(turnOrder)
    expect(turnOrder.getPassed(playerSlot)).toBeFalsy()
})

