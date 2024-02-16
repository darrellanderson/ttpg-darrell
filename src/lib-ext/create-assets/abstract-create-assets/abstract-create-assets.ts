import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export abstract class AbstractCreateAssets {
    abstract toFileData(): Promise<{ [key: string]: Buffer }>;

    static getAsBuffer(
        data: string | Buffer,
        rootDir?: string
    ): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            if (data instanceof Buffer) {
                resolve(data);
            } else {
                sharp(path.join(rootDir ?? ".", data))
                    .png()
                    .toBuffer()
                    .then((buffer) => {
                        resolve(buffer);
                    }, reject);
            }
        });
    }

    /**
     * Image buffers are PNG internally, re-encode as JPG if requested.
     *
     * @param filename
     * @param buffer
     * @returns
     */
    static encodeOutputBuffer(
        filename: string,
        buffer: Buffer
    ): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject): void => {
            if (filename.endsWith(".jpg")) {
                sharp(buffer)
                    .jpeg()
                    .toBuffer()
                    .then((buffer: Buffer) => {
                        resolve(buffer);
                    }, reject);
            } else {
                resolve(buffer);
            }
        });
    }

    static writeOneFile(filename: string, buffer: Buffer): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            AbstractCreateAssets.encodeOutputBuffer(filename, buffer).then(
                (buffer: Buffer): void => {
                    const dir: string = path.dirname(filename);
                    fs.mkdir(dir, { recursive: true }).then((): void => {
                        fs.writeFile(filename, buffer).then((): void => {
                            resolve();
                        }, reject);
                    }, reject);
                }
            );
        });
    }

    writeFiles(): Promise<void> {
        return new Promise<void>((resolve, reject): void => {
            this.toFileData().then(
                (filenameToBuffer: { [key: string]: Buffer }): void => {
                    Promise.all(
                        Object.entries(filenameToBuffer).map(
                            ([filename, buffer]) => {
                                return AbstractCreateAssets.writeOneFile(
                                    filename,
                                    buffer
                                );
                            }
                        )
                    ).then(() => {
                        resolve();
                    }, reject);
                }
            );
        });
    }
}
