import { z } from "zod";

export const ZBaseCellSchema = z
    .object({
        type: z.string().min(1),
        snapPonts: z
            .array(
                z.object({
                    tags: z.array(z.string().min(1)).optional(),
                    left: z.number().optional(),
                    top: z.number().optional(),
                    rotation: z.number().optional(),
                })
            )
            .optional(),
    })
    .passthrough();
export type ZBaseCell = z.infer<typeof ZBaseCellSchema>;

export const ZBleedCellSchema = ZBaseCellSchema.extend({
    type: z.literal("BleedCell"),
    child: ZBaseCellSchema,
    leftRight: z.number().nonnegative(),
    topBottom: z.number().nonnegative(),
}).strict();
export type ZBleedCell = z.infer<typeof ZBleedCellSchema>;

export const ZBufferCellSchema = ZBaseCellSchema.extend({
    type: z.literal("BufferCell"),
    width: z.number().positive(),
    height: z.number().positive(),
    bufferData: z.string(),
}).strict();
export type ZBufferCell = z.infer<typeof ZBufferCellSchema>;

export const ZCanvasCellSchema = z.object({
    type: z.literal("CanvasCell"),
    width: z.number().positive(),
    height: z.number().positive(),
    children: z.array(
        z.object({
            left: z.number(),
            top: z.number(),
            child: ZBaseCellSchema,
        })
    ),
});
export type ZCanvasCell = z.infer<typeof ZCanvasCellSchema>;

export const ZColCellSchema = z.object({
    type: z.literal("ColCell"),
    children: z.array(ZBaseCellSchema),
    spacing: z.number(),
});
export type ZColCell = z.infer<typeof ZColCellSchema>;

export const ZGridCellSchema = z.object({
    type: z.literal("GridCell"),
    children: z.array(ZBaseCellSchema),
    numCols: z.number().positive(),
    spacing: z.number(),
});
export type ZGridCell = z.infer<typeof ZGridCellSchema>;

export const ZImageCellSchema = ZBaseCellSchema.extend({
    type: z.literal("ImageCell"),
    width: z.number().positive(),
    height: z.number().positive(),
    imageFile: z.string(),
}).strict();
export type ZImageCell = z.infer<typeof ZImageCellSchema>;

export const ZRowCellSchema = z.object({
    type: z.literal("RowCell"),
    children: z.array(ZBaseCellSchema),
    spacing: z.number(),
});
export type ZRowCell = z.infer<typeof ZRowCellSchema>;

export const ZSolidCellSchema = ZBaseCellSchema.extend({
    type: z.literal("SolidCell"),
    width: z.number().positive(),
    height: z.number().positive(),
    color: z.string(),
}).strict();
export type ZSolidCell = z.infer<typeof ZSolidCellSchema>;

export const ZTextCellSchema = ZBaseCellSchema.extend({
    type: z.literal("TextCell"),
    width: z.number().positive(),
    height: z.number().positive(),
    text: z.string(),
    textColor: z.string().optional(),
    font: z.string().optional(),
    fontSize: z.number().positive().optional(),
    fontStyle: z.string().optional(),
}).strict();
export type ZTextCell = z.infer<typeof ZTextCellSchema>;
