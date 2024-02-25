import crypto from "crypto";
import { CARDSHEET_TEMPLATE } from "./cardsheet-template.data";

export type CardEntry = {
    name?: string;
    metadata?: string;
    tags?: Array<string>;
};

export class CardsheetTemplate {
    private _guidFrom: string = "";
    private _name: string = "";
    private _metadata: string = "";
    private _textureFront: string = "";
    private _textureBack: string = "";
    private _numCols: number = 0;
    private _numRows: number = 0;
    private _cardWidth: number = 0;
    private _cardHeight: number = 0;
    private readonly _cards: Array<CardEntry> = [];

    constructor() {}

    /**
     * Create a deterministic GUID from this string.
     * Suggest using the template file path for uniqueness.
     *
     * @param guidFrom
     * @returns
     */
    setGuidFrom(guidFrom: string): this {
        this._guidFrom = guidFrom;
        return this;
    }

    /**
     * Template name appears in the object library.
     *
     * @param name
     * @returns
     */
    setName(name: string): this {
        this._name = name;
        return this;
    }

    setMetadata(metadata: string): this {
        this._metadata = metadata;
        return this;
    }

    setTextures(front: string, back: string): this {
        this._textureFront = front;
        this._textureBack = back;
        return this;
    }

    setCardSizeWorld(width: number, height: number): this {
        this._cardWidth = width;
        this._cardHeight = height;
        return this;
    }

    setNumColsAndRows(cols: number, rows: number): this {
        this._numCols = cols;
        this._numRows = rows;
        return this;
    }

    addCard(cardEntry: CardEntry): this {
        this._cards.push(cardEntry);
        return this;
    }

    toTemplate(): string {
        if (this._guidFrom.length === 0) {
            throw new Error("must setGuidFrom");
        }
        if (this._textureFront.length === 0 || this._textureBack.length === 0) {
            throw new Error("must setTextures");
        }
        if (this._cardWidth <= 0 || this._cardHeight <= 0) {
            throw new Error("must setCardSizeWorld");
        }
        if (this._numCols <= 0 || this._numRows <= 0) {
            throw new Error("must setNumColsAndRows");
        }
        if (this._cards.length === 0) {
            throw new Error("must addEntry");
        }

        const template = JSON.parse(JSON.stringify(CARDSHEET_TEMPLATE));

        const guid: string = crypto
            .createHash("sha256")
            .update(this._guidFrom)
            .digest("hex")
            .substring(0, 32)
            .toUpperCase();

        template.Name = this._name;
        template.Metadata = this._metadata;
        template.GUID = guid;
        template.FrontTexture = this._textureFront;
        template.BackTexture = this._textureBack;
        template.NumHorizontal = this._numCols;
        template.NumVertical = this._numRows;
        template.Width = this._cardWidth;
        template.height = this._cardHeight;

        this._cards.forEach((card: CardEntry, index: number) => {
            template.Indices.push(index);
            if (card.name) {
                template.CardNames[index] = card.name;
            }
            if (card.metadata) {
                template.CardMetadata[index] = card.metadata;
            }
            if (card.tags) {
                template.CardTags[index] = card.tags;
            }
        });

        return JSON.stringify(template, null, 4);
    }
}
