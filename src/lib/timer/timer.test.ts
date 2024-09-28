import { Timer, TimerBreakdown } from "./timer";

it("toTimeString", () => {
    expect(new TimerBreakdown(0.1).toTimeString()).toBe("00 : 00 : 00");
    expect(new TimerBreakdown(1).toTimeString()).toBe("00 : 00 : 01");
    expect(new TimerBreakdown(60).toTimeString()).toBe("00 : 01 : 00");
    expect(new TimerBreakdown(3600).toTimeString()).toBe("01 : 00 : 00");
    expect(new TimerBreakdown(3661.1).toTimeString()).toBe("01 : 01 : 01");
});

it("constructor", () => {
    new Timer("@timer/test");
});

it("start/stop", () => {
    const timer = new Timer("@timer/test");
    expect(timer.getSeconds()).toBe(0);
    timer.start(100, -1);
    timer.stop();
    expect(Math.ceil(timer.getSeconds())).toBe(100);
});
