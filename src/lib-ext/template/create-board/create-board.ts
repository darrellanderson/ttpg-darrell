export class CreateBoard {
    private readonly _name: string;
    private _imageFile: string;
    private _worldSize: { width: number; height: number };

    constructor(name: string) {
        this._name = name;
    }

    setImage(imageFile: string): this {
        this._imageFile = imageFile;
        return this;
    }

    setWorldSize(width: number, height: number): this {
        this._worldSize = { width, height };
        return this;
    }

    toFiles(guidFrom: string): { [key: string]: string } {
        return {};
    }
}
