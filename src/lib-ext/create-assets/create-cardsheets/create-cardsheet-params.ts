import { z } from "zod";
import { ZBaseCellSchema } from "../../../index-ext";

export const CreateCardsheetParamsSchema = z
    .object({
        // Directory containing 'assets', src file.
        rootDir: z.string().min(1).optional(),

        // Relative to "assets/X/", without extension.
        assetFilename: z.string().min(1),

        // Name in object library.
        templateName: z.string().min(1),
        deckMetadata: z.string().optional(),

        cardSizePixel: z
            .object({
                width: z.number().positive(),
                height: z.number().positive(),
            })
            .strict(),
        cardSizeWorld: z
            .object({
                width: z.number().positive(),
                height: z.number().positive(),
            })
            .strict(),

        // If using per-card filenames, prefix this directory to each.
        applyAllInputDir: z.string().optional(),

        // In addition to per-card tags, add common deck tags to each card AND final deck.
        applyAllTags: z.array(z.string()).optional(),

        cards: z.array(
            z
                .object({
                    face: z.union([z.string(), ZBaseCellSchema]),
                    back: z.union([z.string(), ZBaseCellSchema]).optional(),
                    name: z.string().optional(),
                    metadata: z.string().optional(),
                    tags: z.array(z.string()).optional(),
                })
                .strict()
        ),

        back: z.union([z.string(), ZBaseCellSchema]).optional(),
    })
    .strict();

export type CreateCardsheetParams = z.infer<typeof CreateCardsheetParamsSchema>;
