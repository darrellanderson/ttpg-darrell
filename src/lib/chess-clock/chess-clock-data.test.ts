import { Color } from "ttpg-mock";
import { ChessClockData } from "./chess-clock-data";
import { NamespaceId } from "../namespace-id/namespace-id";

it("constructor", () => {
    new ChessClockData().destroy();
});

it("activePlayerSlot", () => {
    const data: ChessClockData = new ChessClockData();

    let playerSlot: number = -1;
    expect(data.getActivePlayerSlot()).toBe(playerSlot);

    playerSlot = 7;
    data.overrideActivePlayerSlot(playerSlot);
    expect(data.getActivePlayerSlot()).toBe(playerSlot);

    data.destroy();
});

it("playerOrder", () => {
    const data: ChessClockData = new ChessClockData().setPlayerCount(4);

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
    expect(data.getTimeBudgetSeconds()).toBe(timeBudget);

    timeBudget = 100;
    data.setTimeBudgetSeconds(timeBudget);
    expect(data.getTimeBudgetSeconds()).toBe(timeBudget);

    data.destroy();
});

it("interval", () => {
    const data: ChessClockData = new ChessClockData().setTimeBudgetSeconds(10);
    const playerSlot: number = 7;
    expect(data.getTimeRemainingSeconds(playerSlot)).toBe(10);

    data._intervalAssignTimeToActivePlayer();
    expect(data.getTimeRemainingSeconds(playerSlot)).toBe(10);

    data.overrideActivePlayerSlot(playerSlot);
    data._intervalAssignTimeToActivePlayer();
    expect(data.getTimeRemainingSeconds(playerSlot)).toBe(9);

    data.resetTimers();
    expect(data.getTimeRemainingSeconds(playerSlot)).toBe(10);

    data.destroy();
});

it("persist remaining time", () => {
    let chessClockData: ChessClockData | undefined;
    const key: NamespaceId = "@test/chess-clock-data";
    const playerSlot: number = 7;
    const remainingSeconds: number = 3;
    const timeBudgetSeconds: number = 10;
    const activePlayerSlot: number = 8;

    // Create initial, expect empty.
    chessClockData = new ChessClockData(key);
    expect(chessClockData.getTimeBudgetSeconds()).toBe(0);
    expect(chessClockData.getTimeRemainingSeconds(playerSlot)).toBe(0);
    expect(chessClockData.getActivePlayerSlot()).toBe(-1);

    // Set, validate values.
    chessClockData.setTimeBudgetSeconds(timeBudgetSeconds);
    chessClockData.setTimeRemainingSeconds(playerSlot, remainingSeconds);
    chessClockData.overrideActivePlayerSlot(activePlayerSlot);
    expect(chessClockData.getTimeBudgetSeconds()).toBe(timeBudgetSeconds);
    expect(chessClockData.getTimeRemainingSeconds(playerSlot)).toBe(
        remainingSeconds
    );
    expect(chessClockData.getActivePlayerSlot()).toBe(activePlayerSlot);

    chessClockData.destroy();

    // Create new instance, expect values to persist.
    chessClockData = new ChessClockData(key);
    expect(chessClockData.getTimeBudgetSeconds()).toBe(timeBudgetSeconds);
    expect(chessClockData.getTimeRemainingSeconds(playerSlot)).toBe(
        remainingSeconds
    );
    expect(chessClockData.getActivePlayerSlot()).toBe(activePlayerSlot);

    chessClockData.destroy();
});
