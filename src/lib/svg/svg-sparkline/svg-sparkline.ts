export class SvgSparkline {
    public static WIDTH: number = 180;
    public static HEIGHT: number = 100;

    /**
     * Create a sparkline from non-negative numbers.
     *
     * @param values
     * @returns
     */
    static svg(values: Array<number>): string {
        // Get the average non-zero value.
        const nonZeroValues = values.filter((value) => value > 0);
        if (nonZeroValues.length === 0) {
            nonZeroValues.push(0);
        }
        const mean: number =
            nonZeroValues.reduce((a, b) => a + b, 0) / nonZeroValues.length;

        // Compute an upper bound, cap at a multiple of the average.
        let max = Math.min(Math.max(...values, 0), mean * 3);
        if (max === 0) {
            return `<svg xmlns='http://www.w3.org/2000/svg'></svg>`;
        }

        // Round up factor of 10, make sure there's some gap at top.
        max = Math.ceil(max / 10) * 10 + 1;

        // Convert to [0:100] for display.
        const v = values.map(
            (value) =>
                SvgSparkline.HEIGHT -
                Math.round((value * SvgSparkline.HEIGHT) / max)
        );
        const path = [`M 0 ${v[0]}`];
        for (let i = 1; i < v.length; i++) {
            path.push(`L ${i * 3} ${v[i]}`);
            if (v[i + i] !== v[i]) {
                path.push(`L ${i * 3 + 3} ${v[i]}`);
            }
        }
        return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${SvgSparkline.WIDTH} ${SvgSparkline.HEIGHT}'><path d='${path.join(" ")}' stroke-width='2' stroke='red' fill='transparent' /></svg>`;
    }

    static url(values: Array<number>): string {
        return "data:image/svg+xml," + SvgSparkline.svg(values);
    }
}
