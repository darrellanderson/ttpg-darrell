export interface ICell {
    getCellSize(): { w: number; h: number };
    toBuffer(): Promise<Buffer>;
}
