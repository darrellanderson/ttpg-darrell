import { z } from "zod";

export const CreateCardsheetParamsSchema = z.object({
    // Directory containing 'assets', src file.
    rootDir: z.string().min(1).optional(),

    // Relative to "assets/X/", without extension.
    assetFilename: z.string().min(1),

    // Name in object library.
    templateName: z.string().min(1),

    cardWorldSize: z.object({
        width: z.number().positive(),
        height: z.number().positive(),
    }),
    deckMetadata: z.string().optional(),

    cards: z.array(
        z.object({
            imageFile: z.string(),
            name: z.string().optional(),
            metadata: z.string().optional(),
            tags: z.array(z.string()).optional(),
        })
    ),
});

export type CreateCardsheetParams = z.infer<typeof CreateCardsheetParamsSchema>;
