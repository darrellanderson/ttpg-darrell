import path from "path";
import {
    ZBaseCellSchema,
    ZBaseCell,
    ZBleedCellSchema,
    ZBleedCell,
    ZBufferCellSchema,
    ZBufferCell,
    ZCanvasCell,
    ZCanvasCellSchema,
    ZColCell,
    ZColCellSchema,
    ZGridCell,
    ZGridCellSchema,
    ZImageCell,
    ZImageCellSchema,
    ZRowCell,
    ZRowCellSchema,
    ZSolidCell,
    ZSolidCellSchema,
    ZTextCellSchema,
    ZTextCell,
    ZPaddedCell,
    ZPaddedCellSchema,
} from "./cell-schema";
import { AbstractCell, CellSnapPoint } from "../abstract-cell/abstract-cell";
import { BleedCell } from "../bleed-cell/bleed-cell";
import { BufferCell } from "../buffer-cell/buffer-cell";
import { CanvasCell } from "../canvas-cell/canvas-cell";
import { ColCell } from "../col-cell/col-cell";
import { GridCell } from "../grid-cell/grid-cell";
import { ImageCell } from "../image-cell/image-cell";
import { PaddedCell } from "../padded-cell/padded-cell";
import { RowCell } from "../row-cell/row-cell";
import { SolidCell } from "../solid-cell/solid-cell";
import { TextCell } from "../text-cell/text-cell";

export class CellParser {
    private readonly _rootDir: string;
    private readonly _exports: { [key: string]: number | string } = {};
    private _lastJsonObject: object | undefined;

    constructor(rootDir?: string) {
        this._rootDir = rootDir ?? ".";
    }

    parse(jsonObject: object): AbstractCell {
        let zBaseCellType: ZBaseCell = ZBaseCellSchema.parse(jsonObject);
        let type: string = zBaseCellType.type;

        if (type === "!copy" && this._lastJsonObject !== undefined) {
            jsonObject = this._lastJsonObject;
            zBaseCellType = ZBaseCellSchema.parse(jsonObject);
            type = zBaseCellType.type;
        } else {
            this._lastJsonObject = jsonObject;
        }

        // Exports are "last writer wins", not a push/pop stack.
        if (zBaseCellType.exports) {
            for (const [k, v] of Object.entries(zBaseCellType.exports)) {
                this._exports[k] = v;
            }
        }

        // Apply exports.
        for (const [k, v] of Object.entries(jsonObject)) {
            if (v === "$import") {
                const exportedValue: number | string | undefined =
                    this._exports[k];
                if (exportedValue === undefined) {
                    throw new Error(`export "${k}" not found`);
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type StringToAny = { [key: string]: any };
                const force: StringToAny = jsonObject as StringToAny;
                force[k] = exportedValue;
            }
        }

        let abstractCell: AbstractCell | undefined;

        if (type === "BleedCell") {
            const zBleedCell: ZBleedCell = ZBleedCellSchema.parse(jsonObject);
            const child: AbstractCell = this.parse(zBleedCell.child);
            const leftRight: number = zBleedCell.leftRight;
            const topBottom: number = zBleedCell.topBottom;
            abstractCell = new BleedCell(child, leftRight, topBottom);
        }

        if (type === "BufferCell") {
            const zBufferCell: ZBufferCell =
                ZBufferCellSchema.parse(jsonObject);

            const width: number = zBufferCell.width;
            const height: number = zBufferCell.height;
            const buffer: Buffer = Buffer.from(zBufferCell.bufferData);
            abstractCell = new BufferCell(width, height, buffer);
        }

        if (type === "CanvasCell") {
            const zCanvasCell: ZCanvasCell =
                ZCanvasCellSchema.parse(jsonObject);
            const width: number = zCanvasCell.width;
            const height: number = zCanvasCell.height;
            const children: Array<{
                left: number;
                top: number;
                child: AbstractCell;
            }> = zCanvasCell.children.map((childEntry) => {
                return {
                    left: childEntry.left,
                    top: childEntry.top,
                    child: this.parse(childEntry.child),
                };
            });
            abstractCell = new CanvasCell(width, height, children);
        }

        if (type === "ColCell") {
            const zColCell: ZColCell = ZColCellSchema.parse(jsonObject);
            const children: Array<AbstractCell> = zColCell.children.map(
                (child) => this.parse(child)
            );
            const spacing: number = zColCell.spacing;
            abstractCell = new ColCell(children, spacing);
        }

        if (type === "GridCell") {
            const zGridCell: ZGridCell = ZGridCellSchema.parse(jsonObject);
            const children: Array<AbstractCell> = zGridCell.children.map(
                (child) => this.parse(child)
            );
            const numCols: number = zGridCell.numCols;
            const spacing: number = zGridCell.spacing;
            abstractCell = new GridCell(children, numCols, spacing);
        }

        if (type === "ImageCell") {
            const zImageCell: ZImageCell = ZImageCellSchema.parse(jsonObject);
            const width: number = zImageCell.width;
            const height: number = zImageCell.height;
            let imageFile: string = zImageCell.imageFile;
            const alpha: number = zImageCell.alpha ?? 1;
            const grayscale: boolean = zImageCell.grayscale ?? false;
            const invert: boolean = zImageCell.invert ?? false;
            const tint: string = zImageCell.tint ?? "#ffffff";

            imageFile = path.join(this._rootDir, path.normalize(imageFile));
            abstractCell = new ImageCell(width, height, imageFile)
                .setAlpha(alpha)
                .setGrayscale(grayscale)
                .setInvert(invert)
                .setTint(tint);
        }

        if (type === "PaddedCell") {
            const zPaddedCell: ZPaddedCell =
                ZPaddedCellSchema.parse(jsonObject);
            const child: AbstractCell = this.parse(zPaddedCell.child);
            const padding: number = zPaddedCell.padding;
            const background: string = zPaddedCell.background;
            abstractCell = new PaddedCell(child, padding).setColor(background);
        }

        if (type === "RowCell") {
            const zRowCell: ZRowCell = ZRowCellSchema.parse(jsonObject);
            const children: Array<AbstractCell> = zRowCell.children.map(
                (child) => this.parse(child)
            );
            const spacing: number = zRowCell.spacing;
            abstractCell = new RowCell(children, spacing);
        }

        if (type === "SolidCell") {
            const zSolidCell: ZSolidCell = ZSolidCellSchema.parse(jsonObject);

            const width: number = zSolidCell.width;
            const height: number = zSolidCell.height;
            const color: string = zSolidCell.color;
            abstractCell = new SolidCell(width, height, color);
        }

        if (type === "TextCell") {
            const zTextCell: ZTextCell = ZTextCellSchema.parse(jsonObject);
            const width: number = zTextCell.width;
            const height: number = zTextCell.height;
            const text: string = zTextCell.text;
            const textColor: string | undefined = zTextCell.textColor;
            const font: string | undefined = zTextCell.font;
            const fontSize: number | undefined = zTextCell.fontSize;
            const fontStyle: string | undefined = zTextCell.fontStyle;
            const textCell: TextCell = new TextCell(width, height, text);
            if (textColor) {
                textCell.setTextColor(textColor);
            }
            if (font) {
                textCell.setFont(font);
            }
            if (fontSize) {
                textCell.setFontSize(fontSize);
            }
            if (fontStyle) {
                textCell.setFontStyle(fontStyle);
            }
            abstractCell = textCell;
        }

        if (!abstractCell) {
            throw new Error(`bad type "${type}"`);
        }

        if (zBaseCellType.snapPoints) {
            let prev: CellSnapPoint | undefined = undefined;
            for (const snapPoint of zBaseCellType.snapPoints) {
                if (snapPoint.createCountToPrev) {
                    if (!prev) {
                        throw new Error("no prev");
                    }
                    // Interpoate N points from prev to this.
                    // Prev (index 0) was already added, last will be added after.
                    const dWidth: number =
                        (snapPoint.left ?? 0) - (prev.left ?? 0);
                    const dHeight: number =
                        (snapPoint.top ?? 0) - (prev.top ?? 0);
                    for (let i = 1; i < snapPoint.createCountToPrev; i++) {
                        const d: number = i / snapPoint.createCountToPrev;
                        abstractCell.addSnapPoint({
                            tags: snapPoint.tags,
                            left: (prev.left ?? 0) + dWidth * d,
                            top: (prev.top ?? 0) + dHeight * d,
                            rotation: snapPoint.rotation,
                            range: snapPoint.range,
                        });
                    }
                }
                const cellSnapPoint: CellSnapPoint = {
                    tags: snapPoint.tags,
                    left: snapPoint.left,
                    top: snapPoint.top,
                    rotation: snapPoint.rotation,
                    range: snapPoint.range,
                };
                abstractCell.addSnapPoint(cellSnapPoint);
                prev = cellSnapPoint;
            }
        }

        return abstractCell;
    }
}
