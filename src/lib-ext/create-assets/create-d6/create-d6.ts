import path from "path";
import {
    AbstractCell,
    CanvasCell,
    CellParser,
    ImageCell,
} from "../../../index-ext";
import { ResizeCell } from "../../image/cell/resize-cell/resize-cell";
import { AbstractCreateAssets } from "../abstract-create-assets/abstract-create-assets";
import { CreateD6Params, CreateD6ParamsSchema } from "./create-d6-params";

export class CreateD6 extends AbstractCreateAssets {
    private readonly _params: CreateD6Params;

    static fromParamsJson(paramsJson: Buffer): CreateD6 {
        const params: CreateD6Params = CreateD6ParamsSchema.parse(
            JSON.parse(paramsJson.toString())
        );
        return new CreateD6(params);
    }

    constructor(params: CreateD6Params) {
        super();
        this._params = params;
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

    _createD6Image(): Promise<Buffer> {
        const width = this._params.faceSizePixel.width;
        const height = this._params.faceSizePixel.height;

        const getFaceCell = (index: number): AbstractCell => {
            const face = this._params.faces[index];
            if (!face) {
                throw new Error("missing face");
            }
            let cell: AbstractCell;
            if (typeof face.image === "string") {
                cell = new ImageCell(
                    this._params.faceSizePixel.width,
                    this._params.faceSizePixel.height,
                    face.image
                );
            } else {
                cell = new CellParser().parse(face.image);
                cell = new ResizeCell(
                    this._params.faceSizePixel.width,
                    this._params.faceSizePixel.height,
                    cell
                );
            }
            return cell;
        };

        return new CanvasCell(width * 3, height * 3, [
            { left: width * 1, top: height * 0, child: getFaceCell(0) },
            { left: width * 0, top: height * 1, child: getFaceCell(1) },
            { left: width * 1, top: height * 1, child: getFaceCell(2) },
            { left: width * 1, top: height * 2, child: getFaceCell(3) },
            { left: width * 0, top: height * 2, child: getFaceCell(4) },
            { left: width * 2, top: height * 1, child: getFaceCell(5) },
        ]).toBuffer();
    }

    toFileData(): Promise<{ [key: string]: Buffer }> {
        throw new Error("Method not implemented.");
    }
}
