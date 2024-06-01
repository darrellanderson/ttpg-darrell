export type SpeakingRecord = {
    userId: string;
    startSeconds: number;
    endSeconds: number;
};

export class SpeakingParser {
    /**
     * Extract speaking records from summary.
     * Lines are "timestamp userId duration", userId does not have spaces.
     *
     * @param summary
     * @returns
     */
    parse(summary: string): Array<SpeakingRecord> {
        const records: Array<SpeakingRecord> = [];
        const lines: Array<string> = summary.split("\n");
        for (const line of lines) {
            const parts: Array<string> = line.split(" ");
            if (parts.length !== 3) {
                continue;
            }
            try {
                const endSeconds: number = parseFloat(parts[0] ?? "0");
                const userId: string = parts[1] ?? "";
                const durationSecs: number = parseFloat(parts[2] ?? "0");
                const startSeconds: number = endSeconds - durationSecs;
                records.push({
                    userId: userId,
                    startSeconds: startSeconds,
                    endSeconds: endSeconds,
                });
            } catch (e) {
                // Ignore invalid records.
            }
        }
        return records;
    }
}
