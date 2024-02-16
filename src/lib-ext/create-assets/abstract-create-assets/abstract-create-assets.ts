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

    abstract toFileData(
        assetFilename: string
    ): Promise<{ [key: string]: Buffer }>;
}
