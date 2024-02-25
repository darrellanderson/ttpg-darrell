import path from "path";
import { CellSize, GridCell, ImageCell } from "../../../index-ext";
import { AbstractCreateAssets } from "../abstract-create-assets/abstract-create-assets";
import { CreateCardsheetParams } from "./create-cardsheet-params";
import { CardsheetTemplate } from "../../template/cardsheet-template/cardsheet-template";

export class CreateCardsheet extends AbstractCreateAssets {
    private readonly _params: CreateCardsheetParams;

    constructor(params: CreateCardsheetParams) {
        super();
        this._params = params;
    }

    private _getCardCells(): Promise<Array<ImageCell>> {
        return new Promise<Array<ImageCell>>((resolve, reject) => {
            Promise.all(
                this._params.cards.map((card) => {
                    return new ImageCell(
                        this._params.cardPixelSize.width,
                        this._params.cardPixelSize.height,
                        card.imageFile
                    );
                })
            ).then((cells: Array<ImageCell>) => {
                resolve(cells);
            }, reject);
        });
    }

    toFileData(): Promise<{ [key: string]: Buffer }> {
        return new Promise<{ [key: string]: Buffer }>((resolve, reject) => {
            this._getCardCells().then((imageCells: Array<ImageCell>) => {
                const maxCardSize: CellSize = GridCell.getMaxSize(imageCells);
                const maxCardsPerSheet: number =
                    GridCell.getMaxCellCount(maxCardSize);
                const numCardsheets: number = Math.ceil(
                    imageCells.length / maxCardsPerSheet
                );
                for (let i = 0; i < numCardsheets; i++) {
                    const start: number = i * maxCardsPerSheet;
                    const end: number = Math.min(
                        start + maxCardsPerSheet,
                        imageCells.length
                    );
                    const sheetImageCells: Array<ImageCell> = imageCells.slice(
                        start,
                        end
                    );
                    const layout: { cols: number; rows: number } =
                        GridCell.getOptimalLayout(
                            sheetImageCells.length,
                            maxCardSize
                        );
                    new GridCell(sheetImageCells, layout.cols, layout.rows);
                }
            }, reject);
        });
    }

    /**
     * Divide cards into per-sheet sets, call _createCardSheet to create each.
     *
     * @param imageCells
     * @param fileData
     * @returns
     */
    private _createCardSheets(
        imageCells: Array<ImageCell>,
        fileData: { [key: string]: Buffer }
    ): Promise<void> {
        const maxCardSize: CellSize = GridCell.getMaxSize(imageCells);
        const maxCardsPerSheet: number = GridCell.getMaxCellCount(maxCardSize);
        const numCardsheets: number = Math.ceil(
            imageCells.length / maxCardsPerSheet
        );
        const promises: Array<Promise<void>> = [];
        for (let i = 0; i < numCardsheets; i++) {
            const start: number = i * maxCardsPerSheet;
            const end: number = Math.min(
                start + maxCardsPerSheet,
                imageCells.length
            );
            const sheetImageCells: Array<ImageCell> = imageCells.slice(
                start,
                end
            );

            const promise: Promise<void> = this._createCardSheet(
                sheetImageCells,
                fileData,
                i
            );
            promises.push(promise);
        }
        return new Promise<void>((resolve, reject) => {
            Promise.all(promises).then(() => {
                resolve();
            }, reject);
        });
    }

    private _createCardSheet(
        imageCells: Array<ImageCell>,
        fileData: { [key: string]: Buffer },
        sheetIndex: number
    ): Promise<void> {
        const maxCardSize: CellSize = GridCell.getMaxSize(imageCells);
        const layout: { cols: number; rows: number } =
            GridCell.getOptimalLayout(imageCells.length, maxCardSize);
        const sheetCell = new GridCell(imageCells, layout.cols, layout.rows);

        // Get sheet image buffer.
        const sheetImageFileName: string = path.join(
            this._params.rootDir ?? ".",
            "Textures",
            `${this._params.assetFilename}.${sheetIndex}.jpg`
        );
        const sheetImageBufferPromise: Promise<void> = new Promise<void>(
            (resolve, reject) => {
                sheetCell.toBuffer().then((buffer: Buffer) => {
                    fileData[sheetImageFileName] = buffer;
                    resolve();
                }, reject);
            }
        );

        // Create sheet template.
        const sheetTemplate: CardsheetTemplate = new CardsheetTemplate();
        // TODO XXX

        // Get sheet template. buffer
        const sheetTemplateFileName: string = path.join(
            this._params.rootDir ?? ".",
            "Templates",
            `${this._params.assetFilename}.${sheetIndex}.json`
        );
        fileData[sheetTemplateFileName] = Buffer.from(
            sheetTemplate.toTemplate()
        );

        const promises: Array<Promise<void>> = [sheetImageBufferPromise];
        return new Promise<void>((resolve, reject) => {
            Promise.all(promises).then(() => {
                resolve();
            }, reject);
        });
    }
}
