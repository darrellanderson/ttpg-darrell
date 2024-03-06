import { Stats } from "fs";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export abstract class AbstractCreateAssets {
    abstract toFileData(): Promise<{ [key: string]: Buffer }>;

    static cleanByFilePrefix(
        dir: string,
        filenamePrefix: string
    ): Promise<void> {
        // If file has a path, move it to the dir portion.
        const dirPortionOfFilename: string = path.dirname(filenamePrefix);
        dir = path.join(dir, dirPortionOfFilename);
        filenamePrefix = path.basename(filenamePrefix);

        return new Promise<void>((resolve, reject) => {
            fs.stat(dir).then(
                (stats: Stats) => {
                    if (stats.isDirectory()) {
                        fs.readdir(dir).then((filenames: Array<string>) => {
                            const promises: Array<Promise<void>> = [];
                            for (const filename of filenames) {
                                if (filename.startsWith(filenamePrefix)) {
                                    const pathFile: string = path.join(
                                        dir,
                                        filename
                                    );
                                    console.log(
                                        `CreateAssets.clean: removing "${pathFile}"`
                                    );
                                    promises.push(fs.rm(pathFile));
                                }
                            }
                            Promise.all(promises).then(() => {
                                resolve();
                            }, reject);
                        }, reject);
                    }
                },
                resolve // yuck.  "resolve" since stat throws if missing.
            );
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
        console.log(`CreateAssets: writing "${filename}"`);
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
                },
                reject
            );
        });
    }
}
