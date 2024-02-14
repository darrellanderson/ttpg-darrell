import sharp, { Metadata } from "sharp";

export type ImageSplitChunk = {
    col: number;
    row: number;
    buffer: Buffer;
    px: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    uv: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
};

export class ImageSplit {
    private readonly _srcBuffer: Buffer;
    private readonly _chunkSize: number;

    constructor(srcBuffer: Buffer, chunkSize: number) {
        if (chunkSize <= 0) {
            throw new Error(`invalid chunk size "${chunkSize}"`);
        }
        this._srcBuffer = srcBuffer;
        this._chunkSize = chunkSize;
    }

    private _getChunk(col: number, row: number): Promise<ImageSplitChunk> {
        return new Promise<ImageSplitChunk>((resolve): void => {
            const image = sharp(this._srcBuffer);
            image.metadata().then((metadata: Metadata) => {
                const imgWidth: number = metadata.width ?? 0;
                const imgHeight: number = metadata.height ?? 0;

                const left: number = col * this._chunkSize;
                const top: number = row * this._chunkSize;
                const width: number = Math.min(
                    imgWidth - left,
                    this._chunkSize
                );
                const height: number = Math.min(
                    imgHeight - top,
                    this._chunkSize
                );
                image
                    .extract({ left, top, width, height })
                    .png()
                    .toBuffer()
                    .then((buffer) => {
                        resolve({
                            col,
                            row,
                            buffer,
                            px: {
                                left: left,
                                top: top,
                                right: left + width,
                                bottom: top + height,
                            },
                            uv: {
                                left: left / imgWidth,
                                top: top / imgHeight,
                                right: (left + width) / imgWidth,
                                bottom: (top + height) / imgHeight,
                            },
                        });
                    });
            });
        });
    }

    public split(): Promise<Array<ImageSplitChunk>> {
        return new Promise<Array<ImageSplitChunk>>((resolve): void => {
            sharp(this._srcBuffer)
                .metadata()
                .then((metadata): void => {
                    const { width, height } = metadata;
                    if (width === undefined || height === undefined) {
                        throw new Error("metadata missing width and/or height");
                    }
                    const numCols = Math.ceil(width / this._chunkSize);
                    const numRows = Math.ceil(height / this._chunkSize);
                    const promises: Array<Promise<ImageSplitChunk>> = [];
                    for (let col = 0; col < numCols; col++) {
                        for (let row = 0; row < numRows; row++) {
                            promises.push(this._getChunk(col, row));
                        }
                    }
                    Promise.all(promises).then(
                        (ImageSplitChunks: Array<ImageSplitChunk>): void => {
                            resolve(ImageSplitChunks);
                        }
                    );
                });
        });
    }
}
