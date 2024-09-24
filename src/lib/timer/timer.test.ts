import { Timer } from "./timer";

it("static getTimeString", () => {
    expect(Timer.getTimeString(0.1)).toBe("00:00:00");
    expect(Timer.getTimeString(1)).toBe("00:00:01");
    expect(Timer.getTimeString(60)).toBe("00:01:00");
    expect(Timer.getTimeString(3600)).toBe("01:00:00");
    expect(Timer.getTimeString(3661.1)).toBe("01:01:01");
});

it("constructor", () => {
    new Timer("@timer/test");
});

it("start/stop", () => {
    const timer = new Timer("@timer/test");
    timer.setCountdownFromSeconds(100);
    expect(timer.getCountdownFromSeconds()).toBe(100);
    timer.start();
    expect(timer.getSeconds()).toBe(100);
    timer.stop();
});
