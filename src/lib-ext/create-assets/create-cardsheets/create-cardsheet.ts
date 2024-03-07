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
    private readonly _sharedBackFilenameRelativeToAssets: string;
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

        const basename: string = path.basename(params.assetFilename);
        this._sharedBackFilenameRelativeToAssets = path.join(
            params.assetFilename,
            `${basename}.back.jpg`
        );
    }

    clean(): Promise<void> {
        const promises: Array<Promise<void>> = [];

        const basename: string = path.basename(this._params.assetFilename);
        promises.push(
            AbstractCreateAssets.cleanByFilePrefix(
                path.join(
                    this._params.rootDir ?? ".",
                    "assets",
                    "Textures",
                    this._params.assetFilename
                ),
                basename
            ),
            AbstractCreateAssets.cleanByFilePrefix(
                path.join(
                    this._params.rootDir ?? ".",
                    "assets",
                    "Templates",
                    this._params.assetFilename
                ),
                basename
            )
        );

        return new Promise<void>((resolve, reject) => {
            Promise.all(promises).then(() => {
                resolve();
            }, reject);
        });
    }

    /**
     * Create a single cell from image data (either a filename, or a ZCell schema).
     *
     * @param imageData
     * @returns
     */
    private _getCardCell(imageData: string | ZBaseCell | undefined) {
        if (typeof imageData === "string") {
            const srcFilename = path.join(
                this._params.rootDir ?? ".",
                this._params.applyAllInputDir ?? ".",
                imageData
            );
            return new ImageCell(
                this._params.cardSizePixel.width,
                this._params.cardSizePixel.height,
                srcFilename
            );
        } else if (imageData) {
            const cardCell = new CellParser().parse(imageData);
            return new ResizeCell(
                this._params.cardSizePixel.width,
                this._params.cardSizePixel.height,
                cardCell
            );
        } else {
            throw new Error(`missing image`);
        }
    }

    /**
     * Create (with potential resize) card cells.
     * It is better to use cells than PNG Buffer because we can leverage
     * GridCell to merge them into cardsheets later.
     *
     * @param cardSide
     * @returns
     */
    private _getCardCells(cardSide: CardSide): Array<AbstractCell> {
        if (cardSide === "back" && this._params.back) {
            return []; // using a shared back, not separate back for each card
        }

        return this._params.cards.map((cardEntry): AbstractCell => {
            const imageData: string | ZBaseCell | undefined =
                cardSide === "face" ? cardEntry.face : cardEntry.back;
            return this._getCardCell(imageData);
        });
    }

    /**
     * Organize cards into one or more sheets (possible overflow due to size limits).
     *
     * @returns
     */
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

            // Place output sheets in an "assetFilename" directory.
            const basename: string = path.basename(this._params.assetFilename);
            const sheetPlan: SheetPlan = {
                faceFilenameRelativeToAssetsTextures: path.join(
                    this._params.assetFilename,
                    `${basename}.face.${sheetIndex}.jpg`
                ),
                backFilenameRelativeToAssetsTextures: path.join(
                    this._params.assetFilename,
                    `${basename}.back.${sheetIndex}.jpg`
                ),
                templateFilenameRelativeToAssetsTemplates: path.join(
                    this._params.assetFilename,
                    `${basename}.${sheetIndex}.json`
                ),
                cols: layout.cols,
                rows: layout.rows,
                faceCells: faceCells.slice(start, end),
                backCells: backCells.slice(start, end),
                cardEntries: this._params.cards.slice(start, end),
            };
            if (this._params.applyAllTags) {
                for (const cardEntry of sheetPlan.cardEntries) {
                    for (const tag of this._params.applyAllTags) {
                        if (!cardEntry.tags) {
                            cardEntry.tags = [];
                        }
                        if (!cardEntry.tags.includes(tag)) {
                            cardEntry.tags.push(tag);
                        }
                    }
                }
            }
            result.push(sheetPlan);
        }

        return result;
    }

    toFileData(): Promise<{ [key: string]: Buffer }> {
        const promises: Array<Promise<void>> = [];

        // Create cardsheets, front and if per-card, back.
        // Store results in internal _fileData.
        for (const sheetPlan of this._sheetPlan) {
            promises.push(this._createCardSheet(sheetPlan, "face"));
            if (this._params.back === undefined) {
                promises.push(this._createCardSheet(sheetPlan, "back"));
            }
        }

        // If using a shared back image create set it up.
        if (this._params.back) {
            promises.push(this._createSharedBack());
        }

        // Create templates.
        // Store results in internal _fileData.
        for (const sheetPlan of this._sheetPlan) {
            this._createDeckTemplate(sheetPlan);
        }

        return new Promise<{ [key: string]: Buffer }>((resolve, reject) => {
            Promise.all(promises).then(() => {
                resolve(this._fileData);
            }, reject);
        });
    }

    /**
     * Generage the cardsheet image(s) for a single cardsheet, always face and
     * optionally back if using a different image for each card back (shared
     * back is created via a different path).
     *
     * If the sheet is split up, this just generates one entry.
     *
     * @param sheetPlan
     * @param cardSide
     * @returns
     */
    private _createCardSheet(
        sheetPlan: SheetPlan,
        cardSide: CardSide
    ): Promise<void> {
        const relativeFilename: string =
            cardSide === "face"
                ? sheetPlan.faceFilenameRelativeToAssetsTextures
                : sheetPlan.backFilenameRelativeToAssetsTextures;
        const dstFilename: string = path.join(
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
                this._fileData[dstFilename] = buffer;
                resolve();
            }, reject);
        });
    }

    /**
     * If using a shared back (single card), create it.
     *
     * @returns
     */
    private _createSharedBack(): Promise<void> {
        if (!this._params.back) {
            throw new Error("missing shared back");
        }
        const cell: AbstractCell = this._getCardCell(this._params.back);
        const dstFilename: string = path.join(
            this._params.rootDir ?? ".",
            "assets",
            "Textures",
            this._sharedBackFilenameRelativeToAssets
        );
        return new Promise<void>((resolve, reject) => {
            cell.toBuffer().then((buffer: Buffer): void => {
                this._fileData[dstFilename] = buffer;
                resolve();
            }, reject);
        });
    }

    /**
     * Generate the template for a single cardsheet.
     *
     * If the sheet is split up, this just generates one entry.
     *
     * @param sheetPlan
     */
    private _createDeckTemplate(sheetPlan: SheetPlan): void {
        const dstFilename: string = path.join(
            this._params.rootDir ?? ".",
            "assets",
            "Templates",
            sheetPlan.templateFilenameRelativeToAssetsTemplates
        );

        let backIndex: number = 0;
        let backTexture: string = "";
        if (this._params.back) {
            // shared back
            backIndex = -2;
            backTexture = this._sharedBackFilenameRelativeToAssets;
        } else {
            // different back for each card
            backIndex = -3;
            backTexture = sheetPlan.backFilenameRelativeToAssetsTextures;
        }

        const sheetTemplate: CardsheetTemplate = new CardsheetTemplate()
            .setCardSizeWorld(
                this._params.cardSizeWorld.width,
                this._params.cardSizeWorld.height
            )
            .setGuidFrom(sheetPlan.templateFilenameRelativeToAssetsTemplates)
            .setTemplateMetadata(this._params.deckMetadata ?? "")
            .setTemplateName(this._params.templateName ?? "")
            .setNumColsAndRows(sheetPlan.cols, sheetPlan.rows)
            .setTextures(
                sheetPlan.faceFilenameRelativeToAssetsTextures,
                backTexture,
                backIndex
            );
        for (const cardEntry of sheetPlan.cardEntries) {
            sheetTemplate.addCard(cardEntry);
        }

        this._fileData[dstFilename] = Buffer.from(sheetTemplate.toTemplate());
    }
}
