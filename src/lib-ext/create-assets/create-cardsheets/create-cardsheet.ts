import path from "path";
import {
    AbstractCell,
    CellParser,
    CellSize,
    GridCell,
    ImageCell,
    ZBaseCell,
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
import { ResizeCell } from "../../image/cell/resize-cell/resize-cell";

type CardSide = "face" | "back";

type SheetPlan = {
    faceFilenameRelativeToAssetsTextures: string;
    backFilenameRelativeToAssetsTextures: string;
    templateFilenameRelativeToAssetsTemplates: string;
    cols: number;
    rows: number;
    faceCells: Array<AbstractCell>;
    backCells: Array<AbstractCell>;
    cardEntries: Array<CardEntry>;
};

export class CreateCardsheet extends AbstractCreateAssets {
    private readonly _params: CreateCardsheetParams;
    private readonly _sheetPlan: Array<SheetPlan>;
    private readonly _fileData: { [key: string]: Buffer } = {};

    static fromParamsJson(paramsJson: Buffer): CreateCardsheet {
        const params: CreateCardsheetParams = CreateCardsheetParamsSchema.parse(
            JSON.parse(paramsJson.toString())
        );
        return new CreateCardsheet(params);
    }
    constructor(params: CreateCardsheetParams) {
        super();
        this._params = params;
        this._sheetPlan = this._getSheetPlan();
    }

    private _getCardCells(cardSide: CardSide): Array<AbstractCell> {
        if (cardSide === "back" && this._params.back) {
            return []; // using a shared back, not separate back for each card
        }

        return this._params.cards.map((card): AbstractCell => {
            const imageFile: string | ZBaseCell | undefined =
                cardSide === "face" ? card.face : card.back;
            if (typeof imageFile === "string") {
                return new ImageCell(
                    this._params.cardSizePixel.width,
                    this._params.cardSizePixel.height,
                    imageFile
                );
            } else if (imageFile) {
                const cardCell = new CellParser().parse(imageFile);
                return new ResizeCell(
                    this._params.cardSizePixel.width,
                    this._params.cardSizePixel.height,
                    cardCell
                );
            } else {
                throw new Error(`missing image ("${cardSide}")`);
            }
        });
    }

    private _getSheetPlan(): Array<SheetPlan> {
        const result: Array<SheetPlan> = [];

        const faceCells: Array<AbstractCell> = this._getCardCells("face");
        const backCells: Array<AbstractCell> = this._getCardCells("back"); // might be empty

        const totalCellCount = this._params.cards.length;
        const cellSize: CellSize = this._params.cardSizePixel;
        const maxCellsPerSheet: number = GridCell.getMaxCellCount(cellSize);
        const numSheets: number = Math.ceil(totalCellCount / maxCellsPerSheet);
        for (let sheetIndex = 0; sheetIndex < numSheets; sheetIndex++) {
            const start: number = sheetIndex * maxCellsPerSheet;
            const end: number = Math.min(
                start + maxCellsPerSheet,
                totalCellCount
            );
            const cellCount: number = end - start;
            const layout: { cols: number; rows: number } =
                GridCell.getOptimalLayout(cellCount, cellSize);

            const sheetPlan: SheetPlan = {
                faceFilenameRelativeToAssetsTextures: `${this._params.assetFilename}.face.${sheetIndex}.jpg`,
                backFilenameRelativeToAssetsTextures: `${this._params.assetFilename}.back.${sheetIndex}.jpg`,
                templateFilenameRelativeToAssetsTemplates: `${this._params.assetFilename}.${sheetIndex}.json`,
                cols: layout.cols,
                rows: layout.rows,
                faceCells: faceCells.slice(start, end),
                backCells: backCells.slice(start, end),
                cardEntries: this._params.cards.slice(start, end),
            };
            result.push(sheetPlan);
        }

        return result;
    }

    toFileData(): Promise<{ [key: string]: Buffer }> {
        const promises: Array<Promise<void>> = [];

        // Create cardsheets, front and if per-card, back.
        for (const sheetPlan of this._sheetPlan) {
            promises.push(this._createCardSheet(sheetPlan, "face"));
            if (this._params.back === undefined) {
                promises.push(this._createCardSheet(sheetPlan, "back"));
            }
        }

        // Create templates.
        for (const sheetPlan of this._sheetPlan) {
            this._createDeckTemplate(sheetPlan);
        }

        return new Promise<{ [key: string]: Buffer }>((resolve, reject) => {
            Promise.all(promises).then(() => {
                resolve(this._fileData);
            }, reject);
        });
    }

    private _createCardSheet(
        sheetPlan: SheetPlan,
        cardSide: CardSide
    ): Promise<void> {
        const relativeFilename: string =
            cardSide === "face"
                ? sheetPlan.faceFilenameRelativeToAssetsTextures
                : sheetPlan.backFilenameRelativeToAssetsTextures;
        const filename: string = path.join(
            this._params.rootDir ?? ".",
            "assets",
            "Textures",
            relativeFilename
        );
        const cells: Array<AbstractCell> =
            cardSide === "face" ? sheetPlan.faceCells : sheetPlan.backCells;
        const spacing: number = 0;
        const gridCell = new GridCell(cells, sheetPlan.cols, spacing);
        return new Promise<void>((resolve, reject): void => {
            gridCell.toBuffer().then((buffer: Buffer) => {
                this._fileData[filename] = buffer;
                resolve();
            }, reject);
        });
    }

    private _createDeckTemplate(sheetPlan: SheetPlan): void {
        const filename: string = path.join(
            this._params.rootDir ?? ".",
            "assets",
            "Templates",
            sheetPlan.templateFilenameRelativeToAssetsTemplates
        );

        const sheetTemplate: CardsheetTemplate = new CardsheetTemplate()
            .setCardSizeWorld(
                this._params.cardSizeWorld.width,
                this._params.cardSizeWorld.height
            )
            .setGuidFrom(sheetPlan.templateFilenameRelativeToAssetsTemplates)
            .setMetadata(this._params.deckMetadata ?? "")
            .setName(this._params.templateName ?? "")
            .setNumColsAndRows(sheetPlan.cols, sheetPlan.rows)
            .setTextures(
                sheetPlan.faceFilenameRelativeToAssetsTextures,
                sheetPlan.backFilenameRelativeToAssetsTextures
            );
        for (const cardEntry of sheetPlan.cardEntries) {
            sheetTemplate.addCard(cardEntry);
        }

        // TODO SHARED BACK

        this._fileData[filename] = Buffer.from(sheetTemplate.toTemplate());
    }
}
