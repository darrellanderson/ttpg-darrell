import { z } from "zod";
import { ZBaseCellSchema } from "../../image/cell/cell-parser/cell-schema";

export const CreateBoardParamsSchema = z
    .object({
        // Directory containing 'assets', src file.
        rootDir: z.string().min(1).optional(),

        // Relative to "assets/X/", without extension.
        assetFilename: z.string().min(1),

        // May use zero for one dimension to auto-size.
        preshrink: z
            .object({
                width: z.number().nonnegative(),
                height: z.number().nonnegative(),
            })
            .strict()
            .optional(),

        scriptName: z.string().optional(),

        // Original board image, may have snap points.
        srcImage: ZBaseCellSchema,
        srcMask: ZBaseCellSchema.optional(),

        templateMetadata: z.string().optional(),

        // Name in object library.
        templateName: z.string().min(1),

        // Size from a "looking from the top, down" perspective.
        // Width and height are the XY plane, depth is Z.
        // Prefer this over XYZ because TTPGs coordinate system flips X/Y.
        topDownWorldSize: z
            .object({
                width: z.number().positive(), // TTPG Y
                height: z.number().positive(), // TTPG X
                depth: z.number().positive(), // TTPG Z
            })
            .strict(),
    })
    .strict();

export type CreateBoardParams = z.infer<typeof CreateBoardParamsSchema>;
