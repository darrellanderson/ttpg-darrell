import { CellSize, GridCell, ImageCell } from "../../../index-ext";
import { AbstractCreateAssets } from "../abstract-create-assets/abstract-create-assets";
import { CreateCardsheetParams } from "./create-cardsheet-params";

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
                    return ImageCell.from(card.imageFile);
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
                fileData
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
        fileData: { [key: string]: Buffer }
    ): Promise<void> {
        const maxCardSize: CellSize = GridCell.getMaxSize(imageCells);
        const layout: { cols: number; rows: number } =
            GridCell.getOptimalLayout(imageCells.length, maxCardSize);
        const sheetCell = new GridCell(imageCells, layout.cols, layout.rows);
        return new Promise<void>((resolve, reject) => {});
    }
}
