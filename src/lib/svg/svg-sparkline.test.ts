import { SvgSparkline } from "./svg-sparkline";

it("sparkline", () => {
    const svg: string = SvgSparkline.svg([1, 2, 3]);
    expect(svg).toEqual(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 100'><path d='M 0 67 L 1 33 L 2 0' stroke-width='2' stroke='red' fill='transparent' /></svg>"
    );
});

it("sparkline (empty)", () => {
    const svg: string = SvgSparkline.svg([]);
    expect(svg).toEqual(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 100'>/svg>"
    );
});

it("url", () => {
    const url: string = SvgSparkline.url([1, 2, 3]);
    expect(url).toEqual(
        "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 100'><path d='M 0 67 L 1 33 L 2 0' stroke-width='2' stroke='red' fill='transparent' /></svg>"
    );
});
