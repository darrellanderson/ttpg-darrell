export class SvgSparkline {
    /**
     * Create a sparkline from non-negative numbers.
     *
     * @param values
     * @returns
     */
    static svg(values: number[]): string {
        const max = Math.max(...values);
        if (max === 0) {
            return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 100'></svg>`;
        }
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
