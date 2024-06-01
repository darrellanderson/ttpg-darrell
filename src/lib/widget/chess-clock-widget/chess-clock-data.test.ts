import { Color } from "ttpg-mock";
import { ChessClockData } from "./chess-clock-data";

it("constructor", () => {
    new ChessClockData().destroy();
});

it("activePlayerSlot", () => {
    const data: ChessClockData = new ChessClockData();

    let playerSlot: number = -1;
    expect(data.getActivePlayerSlot()).toBe(playerSlot);

    playerSlot = 7;
    data.setActivePlayerSlot(playerSlot);
    expect(data.getActivePlayerSlot()).toBe(playerSlot);

    data.destroy();
});

it("playerOrder", () => {
    const data: ChessClockData = new ChessClockData();

    let playerOrder: Array<number> = [];
    expect(data.getPlayerOrder()).toEqual(playerOrder);

    playerOrder = [0, 1, 2, 3];
    data.setPlayerOrder(playerOrder);
    expect(data.getPlayerOrder()).toEqual(playerOrder);

    data.destroy();
});

it("widgetColor", () => {
    const data: ChessClockData = new ChessClockData();

    const playerSlot: number = 7;
    let color: Color = new Color(1, 1, 1);
    expect(data.getWidgetColor(playerSlot)).toEqual(color);

    color = new Color(0.1, 0.2, 0.3);
    data.setWidgetColor(playerSlot, color);
    expect(data.getWidgetColor(playerSlot)).toEqual(color);

    data.destroy();
});

it("timeBudget", () => {
    const data: ChessClockData = new ChessClockData();

    let timeBudget: number = 0;
    expect(data.getTimeBudget()).toBe(timeBudget);

    timeBudget = 100;
    data.setTimeBudget(timeBudget);
    expect(data.getTimeBudget()).toBe(timeBudget);

    data.destroy();
});

it("interval", () => {
    const data: ChessClockData = new ChessClockData().setTimeBudget(10000);
    const playerSlot: number = 7;
    expect(data.getTimeRemaining(playerSlot)).toBe(10000);

    data._intervalAssignTimeToActivePlayer();
    expect(data.getTimeRemaining(playerSlot)).toBe(10000);

    data.setActivePlayerSlot(playerSlot);
    data._intervalAssignTimeToActivePlayer();
    expect(data.getTimeRemaining(playerSlot)).toBe(9000);

    data.resetTimers();
    expect(data.getTimeRemaining(playerSlot)).toBe(10000);

    data.destroy();
});
