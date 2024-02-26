import path from "path";
import {
    AbstractCell,
    CellParser,
    CellSize,
    GridCell,
    ImageCell,
} from "../../../index-ext";
import { AbstractCreateAssets } from "../abstract-create-assets/abstract-create-assets";
import {
    CreateCardsheetParams,
    CreateCardsheetParamsSchema,
} from "./create-cardsheet-params";
import {
    CardEntry,
    CardsheetTemplate,
} from "../../template/cardsheet-template/cardsheet-template";

export class CreateCardsheet extends AbstractCreateAssets {
    private readonly _params: CreateCardsheetParams;

    static fromParamsJson(paramsJson: Buffer): CreateCardsheet {
        const params: CreateCardsheetParams = CreateCardsheetParamsSchema.parse(
            JSON.parse(paramsJson.toString())
        );
        return new CreateCardsheet(params);
    }
    constructor(params: CreateCardsheetParams) {
        super();
        this._params = params;
    }

    private _getCardCells(): Array<AbstractCell> {
        return this._params.cards.map((card): AbstractCell => {
            if (typeof card.imageFile === "string") {
                return new ImageCell(
                    this._params.cardSizePixel.width,
                    this._params.cardSizePixel.height,
                    card.imageFile
                );
            } else {
                return new CellParser().parse(card.imageFile);
            }
        });
    }

    toFileData(): Promise<{ [key: string]: Buffer }> {
        const cardCells: Array<AbstractCell> = this._getCardCells();
        const fileData: { [key: string]: Buffer } = {};
        return new Promise<{ [key: string]: Buffer }>(
            (resolve, reject): void => {
                this._createCardSheets(cardCells, fileData).then(() => {
                    resolve(fileData);
                }, reject);
            }
        );
    }

    /**
     * Divide cards into per-sheet sets, call _createCardSheet to create each.
     *
     * @param imageCells
     * @param fileData
     * @returns
     */
    private _createCardSheets(
        cardCells: Array<AbstractCell>,
        fileData: { [key: string]: Buffer }
    ): Promise<void> {
        const maxCardSize: CellSize = GridCell.getMaxSize(cardCells);
        const maxCardsPerSheet: number = GridCell.getMaxCellCount(maxCardSize);
        const numCardsheets: number = Math.ceil(
            cardCells.length / maxCardsPerSheet
        );
        const promises: Array<Promise<void>> = [];
        for (let i = 0; i < numCardsheets; i++) {
            const start: number = i * maxCardsPerSheet;
            const end: number = Math.min(
                start + maxCardsPerSheet,
                cardCells.length
            );

            const sheetCardCells: Array<AbstractCell> = cardCells.slice(
                start,
                end
            );
            const sheetCardEntries: Array<CardEntry> = this._params.cards.slice(
                start,
                end
            );

            const promise: Promise<void> = this._createCardSheet(
                sheetCardCells,
                sheetCardEntries,
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
        cardCells: Array<AbstractCell>,
        cardEntries: Array<CardEntry>,
        fileData: { [key: string]: Buffer },
        sheetIndex: number
    ): Promise<void> {
        const maxCardSize: CellSize = GridCell.getMaxSize(cardCells);
        const layout: { cols: number; rows: number } =
            GridCell.getOptimalLayout(cardCells.length, maxCardSize);
        const sheetCell = new GridCell(cardCells, layout.cols, layout.rows);

        // Get sheet image buffer.
        const localSheetImageFileName: string = `${this._params.assetFilename}.${sheetIndex}.jpg`;
        const sheetImageFileName: string = path.join(
            this._params.rootDir ?? ".",
            "assets",
            "Textures",
            localSheetImageFileName
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
        const sheetTemplate: CardsheetTemplate = new CardsheetTemplate()
            .setCardSizeWorld(
                this._params.cardSizeWorld.width,
                this._params.cardSizeWorld.height
            )
            .setGuidFrom(`${this._params.assetFilename}.${sheetIndex}`)
            .setMetadata(this._params.deckMetadata ?? "")
            .setName(this._params.templateName ?? "")
            .setNumColsAndRows(layout.cols, layout.rows)
            .setTextures(localSheetImageFileName, "nope");
        for (const cardEntry of cardEntries) {
            sheetTemplate.addCard(cardEntry);
        }

        // Get sheet template. buffer
        const sheetTemplateFileName: string = path.join(
            this._params.rootDir ?? ".",
            "assets",
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
