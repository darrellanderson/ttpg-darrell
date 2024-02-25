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

        cardPixelSize: z
            .object({
                width: z.number().positive(),
                height: z.number().positive(),
            })
            .strict(),
        cardWorldSize: z
            .object({
                width: z.number().positive(),
                height: z.number().positive(),
            })
            .strict(),
        deckMetadata: z.string().optional(),

        cards: z.array(
            z
                .object({
                    imageFile: z.union([z.string(), ZBaseCellSchema]),
                    name: z.string().optional(),
                    metadata: z.string().optional(),
                    tags: z.array(z.string()).optional(),
                })
                .strict()
        ),
    })
    .strict();

export type CreateCardsheetParams = z.infer<typeof CreateCardsheetParamsSchema>;
