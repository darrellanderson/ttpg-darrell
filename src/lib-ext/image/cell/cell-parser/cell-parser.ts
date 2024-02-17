import { AbstractCell } from "../abstract-cell/abstract-cell";
import { BleedCell } from "../bleed-cell/bleed-cell";
import { BufferCell } from "../buffer-cell/buffer-cell";
import {
    ZBaseCellSchema,
    ZBaseCellType,
    ZBleedCellSchema,
    ZBleedCellType,
    ZBufferCellSchema,
    ZBufferCellType,
} from "./cell-schema";

export class CellParser {
    parse(jsonObject: object): AbstractCell {
        const zBaseCellType: ZBaseCellType = ZBaseCellSchema.parse(jsonObject);
        const type: string = zBaseCellType.type;

        if (type === "BleedCell") {
            const zBleedCellType: ZBleedCellType =
                ZBleedCellSchema.parse(jsonObject);
            const child: AbstractCell = this.parse(zBleedCellType.child);
            const leftRight: number = zBleedCellType.leftRight;
            const topBottom: number = zBleedCellType.topBottom;
            return new BleedCell(child, leftRight, topBottom);
        }

        if (type === "BufferCell") {
            const zBufferCellType: ZBufferCellType =
                ZBufferCellSchema.parse(jsonObject);

            const width: number = zBufferCellType.width;
            const height: number = zBufferCellType.height;
            const buffer: Buffer = Buffer.from(zBufferCellType.bufferData);
            return new BufferCell(width, height, buffer);
        }

        if (type === "CanvasCell") {
            //
        }

        throw new Error(`bad type "${type}"`);
    }
}
