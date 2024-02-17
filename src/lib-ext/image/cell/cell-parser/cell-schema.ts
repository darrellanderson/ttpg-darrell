import { z } from "zod";

export const ZBaseCellSchema = z.object({ type: z.string().min(1) });
export type ZBaseCellType = z.infer<typeof ZBaseCellSchema>;

export const ZBleedCellSchema = ZBaseCellSchema.extend({
    type: z.literal("BleedCell"),
    child: ZBaseCellSchema,
    leftRight: z.number().nonnegative(),
    topBottom: z.number().nonnegative(),
}).strict();
export type ZBleedCellType = z.infer<typeof ZBleedCellSchema>;

export const ZBufferCellSchema = ZBaseCellSchema.extend({
    type: z.literal("BufferCell"),
    width: z.number().positive(),
    height: z.number().positive(),
    bufferData: z.string(),
}).strict();
export type ZBufferCellType = z.infer<typeof ZBufferCellSchema>;

export const CellSchema = z.union([ZBleedCellSchema, ZBufferCellSchema]);
