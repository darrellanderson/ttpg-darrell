import { globalEvents } from "@tabletop-playground/api";
import { MockMulticastDelegate } from "ttpg-mock";
import { Perf, PerfReport } from "./perf";

it("constructor", () => {
    new Perf();
});

it("destroy", () => {
    new Perf().destroy();
});

it("report", () => {
    const perf = new Perf();
    const onTick = globalEvents.onTick as MockMulticastDelegate<
        (seconds: number) => void
    >;
    for (let i = 0; i < 20; i++) {
        onTick._trigger(0.016);
        onTick._trigger(0.016);
        onTick._trigger(0.017);
        onTick._trigger(0.018);
    }
    onTick._trigger(0.201);

    const report: PerfReport = perf.getReport();
    expect(report.fps).toBeCloseTo(59.701);
    expect(report.mean).toBeCloseTo(19.024);
    expect(report.median).toBeCloseTo(17);
    expect(report.scrubbed).toBeCloseTo(16.75);
    expect(report.stdDev).toBeCloseTo(20.362);
});

it("reportStr", () => {
    const perf = new Perf();
    const onTick = globalEvents.onTick as MockMulticastDelegate<
        (seconds: number) => void
    >;
    for (let i = 0; i < 20; i++) {
        onTick._trigger(0.016);
        onTick._trigger(0.016);
        onTick._trigger(0.017);
        onTick._trigger(0.018);
    }
    onTick._trigger(0.201);

    const reportStr: string = perf.getReportStr();
    expect(reportStr).toEqual(
        "frame msecs: median=17.0 mean=19.0 scrubbed=16.8 stdDev=20.36 [59.7]"
    );
});
