import {
    ImageSplit,
    ImageSplitChunk,
} from "../../image/image-split/image-split";

/**
 * Create assets for a (potentially large) board.
 *
 * assets/Textures:
 * - Split large board image into GPU friendly chunks.
 * - Bleed edges for UV gutters.
 *
 * assets/Models:
 * - Shared 1x1 cube with UV bleed gutters on top face.
 *
 * assets/Templates:
 * - Template with sub-meshes for each image chunk.
 */
export class CreateBoard {
    private readonly _name: string;
    private _imageFile: string | undefined;
    private _worldSize: { width: number; height: number } | undefined;

    private _imageChunks: Array<ImageSplitChunk> = [];

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
        this._imageChunks = new ImageSplit();
        return {};
    }
}
