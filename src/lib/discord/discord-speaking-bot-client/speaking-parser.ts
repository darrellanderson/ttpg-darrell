export type SpeakingRecord = {
  userId: string;
  startTimestamp: number;
  endTimestamp: number;
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
        const endTimestamp: number = parseFloat(parts[0] ?? "0") * 1000;
        const userId: string = parts[1] ?? "";
        const durationSecs: number = parseFloat(parts[2] ?? "0");
        const startTimestamp: number = endTimestamp - durationSecs * 1000;
        records.push({
          userId: userId,
          startTimestamp: startTimestamp,
          endTimestamp: endTimestamp,
        });
      } catch (e) {
        // Ignore invalid records.
      }
    }
    return records;
  }
}
