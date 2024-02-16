import path from "path";
import {
    ImageSplit,
    ImageSplitChunk,
} from "../../image/image-split/image-split";
import { AbstractCell } from "../../../index-ext";
import { AbstractCreateAssets } from "../abstract-create-assets/abstract-create-assets";
import { BleedCell } from "../../image/cell/bleed-cell/bleed-cell";
import { BufferCell } from "../../image/cell/buffer-cell/buffer-cell";
import { CubeModel, OffsetAndSize } from "../../model/cube-model/cube-model";
import { CubeTemplate } from "../../template/cube-template/cube-template";
import {
    CreateBoardParams,
    CreateBoardParamsSchema,
} from "./create-board-params";

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
export class CreateBoard extends AbstractCreateAssets {
    private static readonly INSET_SIZE: OffsetAndSize =
        CubeModel.getInsetForUVs(4096, 4096);

    private readonly _params: CreateBoardParams;

    static fromParamsJson(paramsJson: Buffer): CreateBoard {
        const params: CreateBoardParams = CreateBoardParamsSchema.parse(
            JSON.parse(paramsJson.toString())
        );
        return new CreateBoard(params);
    }

    constructor(params: CreateBoardParams) {
        super();
        this._params = params;
    }

    _splitImage(): Promise<Array<ImageSplitChunk>> {
        if (CreateBoard.INSET_SIZE.width !== CreateBoard.INSET_SIZE.height) {
            throw new Error("inset size mismatch");
        }
        return new Promise<Array<ImageSplitChunk>>((resolve, reject): void => {
            AbstractCreateAssets.getAsBuffer(
                this._params.srcImage,
                this._params.rootDir
            ).then((buffer: Buffer) => {
                new ImageSplit(buffer, CreateBoard.INSET_SIZE.width)
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
                        }, reject);
                    }, reject);
            }, reject);
        });
    }

    toFileData(): Promise<{ [key: string]: Buffer }> {
        const filenameToBuffer: { [key: string]: Buffer } = {};

        // Model.
        const cubeModel = new CubeModel();
        const cubeModelFilename: string = path.join(
            this._params.rootDir ?? ".",
            "assets",
            "Models",
            CubeModel.ASSET_FILENAME
        );
        filenameToBuffer[cubeModelFilename] = Buffer.from(
            cubeModel.toModel(),
            "ascii"
        );

        // Board template.
        const templateFilename: string = path.join(
            this._params.rootDir ?? ".",
            "assets",
            "Templates",
            `${this._params.assetFilename}.json`
        );
        const cubeTemplate = new CubeTemplate()
            .setGuidFrom(templateFilename)
            .setName(this._params.templateName);

        return new Promise<{ [key: string]: Buffer }>(
            (resolve, reject): void => {
                this._splitImage().then(
                    (chunks: Array<ImageSplitChunk>): void => {
                        // Image chunks.
                        for (const chunk of chunks) {
                            const innerFilename: string = `${this._params.assetFilename}-${chunk.col}x${chunk.row}.jpg`;
                            const filename: string = path.join(
                                this._params.rootDir ?? ".",
                                "assets",
                                "Textures",
                                innerFilename
                            );
                            filenameToBuffer[filename] = chunk.buffer;

                            const { width, height, depth } =
                                this._params.topDownWorldSize;
                            cubeTemplate.addEntry({
                                texture: innerFilename,
                                model: CubeModel.ASSET_FILENAME,
                                width: chunk.uv.width * width,
                                height: chunk.uv.height * height,
                                depth: depth,
                                left: chunk.uv.left * width - width / 2,
                                top: chunk.uv.top * height - height / 2,
                            });
                        }
                        if (chunks.length > 1) {
                            cubeTemplate.setCollider(CubeModel.ASSET_FILENAME);
                        }

                        // Template.
                        filenameToBuffer[templateFilename] = Buffer.from(
                            cubeTemplate.toTemplate(),
                            "ascii"
                        );

                        resolve(filenameToBuffer);
                    },
                    reject
                );
            }
        );
    }
}
