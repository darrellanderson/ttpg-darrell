import { CARDSHEET_TEMPLATE } from "./cardsheet-template.data";
import { AbstractTemplate } from "../abstract-template/abstract-template";

export type CardEntry = {
    name?: string;
    metadata?: string;
    tags?: Array<string>;
};

export class CardsheetTemplate extends AbstractTemplate {
    private _textureFront: string = "";
    private _textureBack: string = "";
    private _backIndex: number = 0;
    private _numCols: number = 0;
    private _numRows: number = 0;
    private _cardWidth: number = 0;
    private _cardHeight: number = 0;
    private readonly _cards: Array<CardEntry> = [];

    constructor() {
        super();
    }

    setTextures(front: string, back: string, backIndex: number): this {
        this._textureFront = front;
        this._textureBack = back;
        this._backIndex = backIndex;
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

        const template = this.copyAndFillBasicFields(CARDSHEET_TEMPLATE);

        template.FrontTexture = this._textureFront;
        template.BackTexture = this._textureBack;
        template.BackIndex = this._backIndex;
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
