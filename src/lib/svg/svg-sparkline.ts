export class SvgSparkline {
    /**
     * Create a sparkline from non-negative numbers.
     *
     * @param values
     * @returns
     */
    static svg(values: number[]): string {
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
            return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 100'></svg>`;
        }

        // Round up factor of 10.
        max = Math.floor(max + 9) * 10;

        // Convert to [0:100] for display.
        const v = values.map((value) => 100 - Math.round((value * 100) / max));
        const path = [`M 0 ${v[0]}`];
        for (let i = 1; i < v.length; i++) {
            path.push(`L ${i} ${v[i]}`);
        }
        return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 100'><path d='${path.join(" ")}' stroke-width='2' stroke='red' fill='transparent' /></svg>`;
    }

    static url(values: number[]): string {
        return "data:image/svg+xml," + SvgSparkline.svg(values);
    }
}
