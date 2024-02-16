import path from "path";
import {
    ImageSplit,
    ImageSplitChunk,
} from "../../image/image-split/image-split";
import { AbstractCell } from "../../../index-ext";
import { BleedCell } from "../../image/cell/bleed-cell/bleed-cell";
import { BufferCell } from "../../image/cell/buffer-cell/buffer-cell";
import { CubeModel, OffsetAndSize } from "../../model/cube-model/cube-model";

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
    private static readonly INSET_SIZE: OffsetAndSize =
        CubeModel.getInsetForUVs(4096, 4096);

    private readonly _name: string;
    private _srcImageBuffer: Buffer | undefined;
    private _worldSize: { width: number; height: number } | undefined;

    constructor(name: string) {
        this._name = name;
    }

    setImage(srcImageBuffer: Buffer): this {
        this._srcImageBuffer = srcImageBuffer;
        return this;
    }

    setWorldSize(width: number, height: number): this {
        this._worldSize = { width, height };
        return this;
    }

    _splitImage(): Promise<Array<ImageSplitChunk>> {
        if (CreateBoard.INSET_SIZE.width !== CreateBoard.INSET_SIZE.height) {
            throw new Error("inset size mismatch");
        }
        return new Promise<Array<ImageSplitChunk>>((resolve): void => {
            if (!this._srcImageBuffer) {
                throw new Error("must setImage first");
            }
            new ImageSplit(this._srcImageBuffer, CreateBoard.INSET_SIZE.width)
                .split()
                .then((chunks: Array<ImageSplitChunk>): void => {
                    Promise.all(
                        chunks.map((chunk: ImageSplitChunk) => {
                            const inner: AbstractCell = new BufferCell(
                                chunk.px.width,
                                chunk.px.height,
                                chunk.buffer
                            );
                            const outset: OffsetAndSize =
                                CubeModel.getOutsetForUVs(
                                    chunk.px.width,
                                    chunk.px.height
                                );
                            return new BleedCell(
                                inner,
                                outset.left,
                                outset.top
                            ).toBuffer();
                        })
                    ).then((outsetBuffers: Array<Buffer>): void => {
                        for (let i = 0; i < chunks.length; i++) {
                            const chunk: ImageSplitChunk | undefined =
                                chunks[i];
                            const outsetBuffer: Buffer | undefined =
                                outsetBuffers[i];
                            if (!chunk || !outsetBuffer) {
                                throw new Error("missing");
                            }
                            chunk.buffer = outsetBuffer;
                        }
                        resolve(chunks);
                    });
                });
        });
    }

    toFileData(assetFilename: string): Promise<{ [key: string]: Buffer }> {
        const filenameToBuffer: { [key: string]: Buffer } = {};

        const cubeModel = new CubeModel();
        filenameToBuffer[path.join("assets", "Models", "uv-cube.obj")] =
            Buffer.from(cubeModel.toModel());

        return new Promise<{ [key: string]: Buffer }>((resolve): void => {
            this._splitImage().then((chunks: Array<ImageSplitChunk>): void => {
                for (const chunk of chunks) {
                    const filename: string = path.join(
                        "assets",
                        "Textures",
                        `${assetFilename}-${chunk.col}x${chunk.row}.jpg`
                    );
                    filenameToBuffer[filename] = chunk.buffer;
                }
                resolve(filenameToBuffer);
            });
        });
    }
}
