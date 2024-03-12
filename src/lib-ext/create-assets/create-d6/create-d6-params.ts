import { z } from "zod";
import { ZBaseCellSchema } from "../../../index-ext";

export const CreateD6ParamsSchema = z
    .object({
        // Directory containing 'assets', src file.
        rootDir: z.string().min(1).optional(),

        // Relative to "assets/X/", without extension.
        assetFilename: z.string().min(1),

        faceSizePixel: z
            .object({
                width: z.number().positive(),
                height: z.number().positive(),
            })
            .strict(),

        tags: z.array(z.string().min(1)).optional(),

        // Name in object library.
        templateName: z.string().min(1),
        templateMetadata: z.string().optional(),

        faces: z.array(
            z
                .object({
                    image: z.union([z.string(), ZBaseCellSchema]),
                    name: z.string().optional(),
                    metadata: z.union([
                        z.string().optional(),
                        z.object({}).passthrough(),
                    ]),
                })
                .strict()
        ),
    })
    .strict();

export type CreateD6Params = z.infer<typeof CreateD6ParamsSchema>;
