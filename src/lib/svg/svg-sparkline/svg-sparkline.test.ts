import { SvgSparkline } from "./svg-sparkline";

it("sparkline", () => {
    const svg: string = SvgSparkline.svg([1, 2, 3]);
    expect(svg).toEqual(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 100'><path d='M 0 91 L 3 82 L 6 82 L 6 73 L 9 73' stroke-width='2' stroke='red' fill='transparent' /></svg>"
    );
});

it("sparkline (empty)", () => {
    const svg: string = SvgSparkline.svg([]);
    expect(svg).toEqual("<svg xmlns='http://www.w3.org/2000/svg'></svg>");
});

it("url", () => {
    const url: string = SvgSparkline.url([1, 2, 3]);
    expect(url).toEqual(
        "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 100'><path d='M 0 91 L 3 82 L 6 82 L 6 73 L 9 73' stroke-width='2' stroke='red' fill='transparent' /></svg>"
    );
});
