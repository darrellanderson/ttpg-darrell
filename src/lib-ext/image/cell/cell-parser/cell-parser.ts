import { AbstractCell } from "../abstract-cell/abstract-cell";
import { BleedCell } from "../bleed-cell/bleed-cell";
import { BufferCell } from "../buffer-cell/buffer-cell";
import { CanvasCell } from "../canvas-cell/canvas-cell";
import { ColCell } from "../col-cell/col-cell";
import { GridCell } from "../grid-cell/grid-cell";
import { ImageCell } from "../image-cell/image-cell";
import { RowCell } from "../row-cell/row-cell";
import { SolidCell } from "../solid-cell/solid-cell";
import { TextCell } from "../text-cell/text-cell";
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
} from "./cell-schema";

export class CellParser {
    parse(jsonObject: object): AbstractCell {
        const zBaseCellType: ZBaseCell = ZBaseCellSchema.parse(jsonObject);
        const type: string = zBaseCellType.type;

        if (type === "BleedCell") {
            const zBleedCell: ZBleedCell = ZBleedCellSchema.parse(jsonObject);
            const child: AbstractCell = this.parse(zBleedCell.child);
            const leftRight: number = zBleedCell.leftRight;
            const topBottom: number = zBleedCell.topBottom;
            return new BleedCell(child, leftRight, topBottom);
        }

        if (type === "BufferCell") {
            const zBufferCell: ZBufferCell =
                ZBufferCellSchema.parse(jsonObject);

            const width: number = zBufferCell.width;
            const height: number = zBufferCell.height;
            const buffer: Buffer = Buffer.from(zBufferCell.bufferData);
            return new BufferCell(width, height, buffer);
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
            return new CanvasCell(width, height, children);
        }

        if (type === "ColCell") {
            const zColCell: ZColCell = ZColCellSchema.parse(jsonObject);
            const children: Array<AbstractCell> = zColCell.children.map(
                (child) => this.parse(child)
            );
            const spacing: number = zColCell.spacing;
            return new ColCell(children, spacing);
        }

        if (type === "GridCell") {
            const zGridCell: ZGridCell = ZGridCellSchema.parse(jsonObject);
            const children: Array<AbstractCell> = zGridCell.children.map(
                (child) => this.parse(child)
            );
            const numCols: number = zGridCell.numCols;
            const spacing: number = zGridCell.spacing;
            return new GridCell(children, numCols, spacing);
        }

        if (type === "ImageCell") {
            const zImageCell: ZImageCell = ZImageCellSchema.parse(jsonObject);
            const width: number = zImageCell.width;
            const height: number = zImageCell.height;
            const imageFile: string = zImageCell.imageFile;
            return new ImageCell(width, height, imageFile);
        }

        if (type === "RowCell") {
            const zRowCell: ZRowCell = ZRowCellSchema.parse(jsonObject);
            const children: Array<AbstractCell> = zRowCell.children.map(
                (child) => this.parse(child)
            );
            const spacing: number = zRowCell.spacing;
            return new RowCell(children, spacing);
        }

        if (type === "SolidCell") {
            const zSolidCell: ZSolidCell = ZSolidCellSchema.parse(jsonObject);

            const width: number = zSolidCell.width;
            const height: number = zSolidCell.height;
            const color: string = zSolidCell.color;
            return new SolidCell(width, height, color);
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
            return textCell;
        }

        throw new Error(`bad type "${type}"`);
    }
}
