import path from "path";
import {
    ImageSplit,
    ImageSplitChunk,
} from "../../image/image-split/image-split";
import { AbstractCell, CellSize, CellSnapPoint } from "../../../index-ext";
import { AbstractCreateAssets } from "../abstract-create-assets/abstract-create-assets";
import { BleedCell } from "../../image/cell/bleed-cell/bleed-cell";
import { BufferCell } from "../../image/cell/buffer-cell/buffer-cell";
import { CubeModel, OffsetAndSize } from "../../model/cube-model/cube-model";
import { CubeTemplate } from "../../template/cube-template/cube-template";
import {
    CreateBoardParams,
    CreateBoardParamsSchema,
} from "./create-board-params";
import { CellParser } from "../../image/cell/cell-parser/cell-parser";
import { ResizeCell } from "../../image/cell/resize-cell/resize-cell";

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
    private _srcImageCell: AbstractCell;

    static fromParamsJson(paramsJson: Buffer): CreateBoard {
        const params: CreateBoardParams = CreateBoardParamsSchema.parse(
            JSON.parse(paramsJson.toString())
        );
        return new CreateBoard(params);
    }

    constructor(params: CreateBoardParams) {
        super();
        this._params = params;
        this._srcImageCell = new CellParser(this._params.rootDir).parse(
            this._params.srcImage
        );

        // Resize image, shrink a little more to account for UV bleed edges.
        if (this._params.preshrink) {
            // If either value is zero, size appropriately.
            const srcImageSize: CellSize = this._srcImageCell.getSize();
            if (this._params.preshrink.width === 0) {
                this._params.preshrink.width = Math.round(
                    (this._params.preshrink.height * srcImageSize.width) /
                        srcImageSize.height
                );
            } else if (this._params.preshrink.height === 0) {
                this._params.preshrink.height = Math.round(
                    (this._params.preshrink.width * srcImageSize.height) /
                        srcImageSize.width
                );
            }

            const size: { width: number; height: number } =
                CubeModel.getInsetForUVs(
                    this._params.preshrink.width,
                    this._params.preshrink.height
                );
            this._srcImageCell = new ResizeCell(
                size.width,
                size.height,
                this._srcImageCell
            );
        }
    }

    clean(): Promise<void> {
        const promises: Array<Promise<void>> = [];

        promises.push(
            AbstractCreateAssets.cleanByFilePrefix(
                path.join(this._params.rootDir ?? ".", "assets", "Textures"),
                this._params.assetFilename
            ),
            AbstractCreateAssets.cleanByFilePrefix(
                path.join(this._params.rootDir ?? ".", "assets", "Templates"),
                this._params.assetFilename
            )
        );

        return new Promise<void>((resolve, reject) => {
            Promise.all(promises).then(() => {
                resolve();
            }, reject);
        });
    }

    _splitImage(): Promise<Array<ImageSplitChunk>> {
        if (CreateBoard.INSET_SIZE.width !== CreateBoard.INSET_SIZE.height) {
            throw new Error("inset size mismatch");
        }
        return new Promise<Array<ImageSplitChunk>>((resolve, reject): void => {
            this._srcImageCell.toBuffer().then((buffer: Buffer) => {
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
            .setScriptName(this._params.scriptName ?? "")
            .setTemplateName(this._params.templateName)
            .setTemplateMetadata(this._params.templateMetadata ?? "");

        // Snap points.
        const imgSize: { width: number; height: number } =
            this._srcImageCell.getSize();
        const worldSize: { width: number; height: number; depth: number } =
            this._params.topDownWorldSize;
        const imgSpaceSnapPoints: Array<CellSnapPoint> =
            this._srcImageCell.getSnapPoints();
        const worldSpaceSnapPoints: Array<CellSnapPoint> =
            imgSpaceSnapPoints.map(
                (snapPoint: CellSnapPoint): CellSnapPoint => {
                    // Convert to world dimensions.
                    snapPoint.left =
                        ((snapPoint.left ?? 0) / imgSize.width) *
                        worldSize.width;
                    snapPoint.top =
                        ((snapPoint.top ?? 0) / imgSize.height) *
                        worldSize.height;
                    // Shift to origin being object center.
                    snapPoint.left =
                        (snapPoint.left ?? 0) - worldSize.width / 2;
                    snapPoint.top = worldSize.height / 2 - (snapPoint.top ?? 0);

                    return snapPoint;
                }
            );
        cubeTemplate.setSnapPoints(worldSpaceSnapPoints);

        // Image chunks.
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
                            cubeTemplate.addSubCubeEntry({
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
