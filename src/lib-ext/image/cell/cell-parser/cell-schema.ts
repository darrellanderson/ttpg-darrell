import { z } from "zod";

export const ZBaseCellSchema = z
    .object({
        type: z.string().min(1),

        // Later consumers can use "$scalefoo" value to scale and place in "foo".
        scale: z
            .object({ pixel: z.number(), world: z.number() })
            .strict()
            .optional(),

        // Later consumers can use "$import" value to use an export.
        exports: z
            .record(z.string().min(1), z.union([z.number(), z.string()]))
            .optional(),

        // Reuse previous cell, re-applying exports (can change exports)
        id: z.string().min(1).optional(),
        cloneId: z.string().min(1).optional(),

        snapPoints: z
            .array(
                z
                    .object({
                        tags: z.array(z.string().min(1)).optional(),
                        left: z.number().optional(),
                        top: z.number().optional(),
                        rotation: z.number().optional(),
                        range: z.number().optional(),
                        createCountToPrev: z.number().optional(), // interpolate N new points between
                    })
                    .strict()
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

export const ZCanvasCellSchema = ZBaseCellSchema.extend({
    type: z.literal("CanvasCell"),
    width: z.number().positive(),
    height: z.number().positive(),
    children: z.array(
        z
            .object({
                left: z.number(),
                top: z.number(),
                child: ZBaseCellSchema,
            })
            .strict()
    ),
}).strict();
export type ZCanvasCell = z.infer<typeof ZCanvasCellSchema>;

export const ZColCellSchema = ZBaseCellSchema.extend({
    type: z.literal("ColCell"),
    children: z.array(ZBaseCellSchema),
    spacing: z.number(),
}).strict();
export type ZColCell = z.infer<typeof ZColCellSchema>;

export const ZGridCellSchema = ZBaseCellSchema.extend({
    type: z.literal("GridCell"),
    children: z.array(ZBaseCellSchema),
    numCols: z.number().positive(),
    spacing: z.number(),
}).strict();
export type ZGridCell = z.infer<typeof ZGridCellSchema>;

export const ZImageCellSchema = ZBaseCellSchema.extend({
    type: z.literal("ImageCell"),
    width: z.number().positive(),
    height: z.number().positive(),
    imageFile: z.string(),
    alpha: z.number().optional(),
    grayscale: z.boolean().optional(),
    tint: z.string().length(7).regex(/^#/).optional(),
    invert: z.boolean().optional(),
}).strict();
export type ZImageCell = z.infer<typeof ZImageCellSchema>;

export const ZPaddedCellSchema = ZBaseCellSchema.extend({
    type: z.literal("PaddedCell"),
    child: ZBaseCellSchema,
    padding: z.number(),
    background: z.string().length(7).regex(/^#/),
}).strict();
export type ZPaddedCell = z.infer<typeof ZPaddedCellSchema>;

export const ZRowCellSchema = ZBaseCellSchema.extend({
    type: z.literal("RowCell"),
    children: z.array(ZBaseCellSchema),
    spacing: z.number(),
}).strict();
export type ZRowCell = z.infer<typeof ZRowCellSchema>;

export const ZSolidCellSchema = ZBaseCellSchema.extend({
    type: z.literal("SolidCell"),
    width: z.number().positive(),
    height: z.number().positive(),
    color: z.string().length(7).regex(/^#/),
}).strict();
export type ZSolidCell = z.infer<typeof ZSolidCellSchema>;

export const ZTextCellSchema = ZBaseCellSchema.extend({
    type: z.literal("TextCell"),
    width: z.number().positive(),
    height: z.number().positive(),
    text: z.string(),
    textColor: z.string().length(7).regex(/^#/).optional(),
    font: z.string().optional(),
    fontSize: z.number().positive().optional(),
    fontStyle: z.string().optional(),
}).strict();
export type ZTextCell = z.infer<typeof ZTextCellSchema>;
