import { mockGlobalEvents } from "ttpg-mock";
import { Perf, PerfReport } from "./perf";

it("init", () => {
    new Perf().init();
});

it("constructor", () => {
    new Perf();
});

it("destroy", () => {
    new Perf().destroy();
});

it("report", () => {
    const perf = new Perf();
    for (let i = 0; i < 20; i++) {
        mockGlobalEvents._tick(0.016);
        mockGlobalEvents._tick(0.016);
        mockGlobalEvents._tick(0.017);
        mockGlobalEvents._tick(0.018);
    }
    mockGlobalEvents._tick(0.201);

    const report: PerfReport = perf.getReport();
    expect(report.fps).toBeCloseTo(59.61);
    expect(report.mean).toBeCloseTo(20.46);
    expect(report.median).toBeCloseTo(17);
    expect(report.scrubbed).toBeCloseTo(16.775);
    expect(report.stdDev).toBeCloseTo(25.804);
});

it("report (empty)", () => {
    const perf = new Perf();
    const report: PerfReport = perf.getReport();
    expect(report.fps).toBeCloseTo(0);
    expect(report.mean).toBeCloseTo(0);
    expect(report.median).toBeCloseTo(0);
    expect(report.scrubbed).toBeCloseTo(0);
    expect(report.stdDev).toBeCloseTo(0);
});

it("reportStr", () => {
    const perf = new Perf();
    for (let i = 0; i < 20; i++) {
        mockGlobalEvents._tick(0.016);
        mockGlobalEvents._tick(0.016);
        mockGlobalEvents._tick(0.017);
        mockGlobalEvents._tick(0.018);
    }
    mockGlobalEvents._tick(0.201);

    const reportStr: string = perf.getReportStr();
    expect(reportStr).toEqual(
        "frame msecs: median=17.0 mean=20.5 scrubbed=16.8 stdDev=25.80 [59.6]"
    );
});

it("getFpsHistory", () => {
    const perf = new Perf();
    mockGlobalEvents._tick(0.201);
    const history: number[] = perf.getFpsHistory();
    expect(history.length).toEqual(60);
    expect(history[0]).toEqual(0);
    expect(history[58]).toEqual(0);
    expect(history[59]).toEqual(4.975);
});
