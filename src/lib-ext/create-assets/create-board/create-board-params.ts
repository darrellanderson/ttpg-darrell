import { z } from "zod";
import { ZBaseCellSchema } from "../../image/cell/cell-parser/cell-schema";

export const CreateBoardParamsSchema = z
    .object({
        // Directory containing 'assets', src file.
        rootDir: z.string().min(1).optional(),

        // Relative to "assets/X/", without extension.
        assetFilename: z.string().min(1),

        preshrink: z
            .object({
                width: z.number().positive(),
                height: z.number().positive(),
            })
            .strict()
            .optional(),

        // Original board image (filename or buffer).
        srcImage: ZBaseCellSchema,

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
