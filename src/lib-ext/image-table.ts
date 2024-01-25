import z from "zod";

const ImageCellSchema = z.object({
    bg: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i),
    img: z.string().optional(),
    w: z.number().int().min(0).optional(),
    h: z.number().int().min(0).optional(),
});

const ImageTableSchema = z.object({});
