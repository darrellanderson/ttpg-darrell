import { AbstractCell } from "../abstract-cell/abstract-cell";

export class BufferCell extends AbstractCell {
    private readonly _buffer: Buffer;

    constructor(width: number, height: number, buffer: Buffer) {
        super(width, height);
        this._buffer = buffer;
    }

    public toBuffer(): Promise<Buffer> {
        return new Promise<Buffer>((resolve) => {
            resolve(this._buffer);
        });
    }
}
