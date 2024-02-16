import fs from "fs/promises";

export abstract class AbstractCreateAssets {
    private readonly _templateName: string;
    private readonly _assetFilename: string;

    constructor(templateName: string, assetFilename: string) {
        this._templateName = templateName;
        this._assetFilename = assetFilename;
    }

    getTemplateName(): string {
        return this._templateName;
    }

    getAssetFilename(ext?: string) {
        return this._assetFilename + (ext ?? "");
    }

    abstract toFileData(): Promise<{ [key: string]: Buffer }>;

    writeFiles(): Promise<void> {
        return new Promise<void>((): void => {
            this.toFileData().then(
                (filenameToBuffer: { [key: string]: Buffer }) => {
                    return Promise.all(
                        Object.entries(filenameToBuffer).map(
                            ([filename, buffer]) => {
                                return fs.writeFile(filename, buffer);
                            }
                        )
                    );
                }
            );
        });
    }
}
