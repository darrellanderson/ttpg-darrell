import crypto from "crypto";

// Treat top-down view as width x height, depth is Z.
import { CUBE_SUB_TEMPLATE, CUBE_TEMPLATE } from "./cube-template.data";

// Entries are always centered, may apply an offset.
export type CubeTemplateEntry = {
    texture: string;
    model: string;
    width: number;
    height: number;
    depth: number;
    left?: number;
    top?: number;
};

export type CubeTemplateBoundingBox = {
    left: number;
    right: number;
    top: number;
    bottom: number;
    maxDepth: number; // Z dimension
};

export class CubeTemplate {
    private readonly _entries: Array<CubeTemplateEntry> = [];
    private _collider: string | undefined;
    private _guidFrom: string = "";
    private _name: string = "";

    static getBoundingBox(
        entries: Array<CubeTemplateEntry>
    ): CubeTemplateBoundingBox {
        const firstEntry: CubeTemplateEntry | undefined = entries[0];
        if (!firstEntry) {
            return { left: 0, top: 0, right: 0, bottom: 0, maxDepth: 0 };
        }
        let left: number = firstEntry.left ?? 0;
        let right: number = firstEntry.left ?? 0; // just has to be in bounds
        let top: number = firstEntry.top ?? 0;
        let bottom: number = firstEntry.top ?? 0; // just has to be in bounds
        let maxDepth: number = 0;
        for (const entry of entries) {
            left = Math.min(left, entry.left ?? 0);
            top = Math.min(top, entry.top ?? 0);
            right = Math.max(right, (entry.left ?? 0) + entry.width);
            bottom = Math.max(bottom, (entry.top ?? 0) + entry.height);
            maxDepth = Math.max(maxDepth, entry.depth);
        }
        return { left, top, right, bottom, maxDepth };
    }

    constructor() {}

    addEntry(entry: CubeTemplateEntry): this {
        this._entries.push(entry);
        return this;
    }

    setCollider(model: string): this {
        this._collider = model;
        return this;
    }

    /**
     * Create a deterministic GUID from this string.
     * Suggest using the template file path for uniqueness.
     *
     * @param guidFrom
     * @returns
     */
    setGuidFrom(guidFrom: string): this {
        this._guidFrom = guidFrom;
        return this;
    }

    /**
     * Template name appears in the object library.
     *
     * @param name
     * @returns
     */
    setName(name: string): this {
        this._name = name;
        return this;
    }

    toTemplate(): string {
        if (this._entries.length === 0) {
            throw new Error("must addEntry");
        }
        if (this._guidFrom === "") {
            throw new Error("must setGuidFrom");
        }

        const modelEntries: Array<object> = this._entries.map((entry) => {
            const modelEntry = JSON.parse(JSON.stringify(CUBE_SUB_TEMPLATE));
            modelEntry.Model = entry.model;
            modelEntry.Texture = entry.texture;
            modelEntry.Offset.Y = (entry.left ?? 0) + entry.width / 2;
            modelEntry.Offset.X = -((entry.top ?? 0) + entry.height / 2);
            modelEntry.Offset.Z = 0;
            modelEntry.Scale.Y = entry.width;
            modelEntry.Scale.X = entry.height;
            modelEntry.Scale.Z = entry.depth;
            return modelEntry;
        });

        const guid: string = crypto
            .createHash("sha256")
            .update(this._guidFrom)
            .digest("hex")
            .substring(0, 32)
            .toUpperCase();

        const template = JSON.parse(JSON.stringify(CUBE_TEMPLATE));
        template.GUID = guid;
        template.Name = this._name;
        template.Models = modelEntries;

        if (this._collider) {
            const bb = CubeTemplate.getBoundingBox(this._entries);
            template.Collision[0].Model = this._collider;
            template.Collision[0].Offset.Y = bb.left + (bb.right - bb.left) / 2;
            template.Collision[0].Offset.X = -(
                bb.top +
                (bb.bottom - bb.top) / 2
            );
            template.Collision[0].Scale.Y = bb.right - bb.left;
            template.Collision[0].Scale.X = bb.bottom - bb.top;
            template.Collision[0].Scale.Z = bb.maxDepth;
        } else {
            delete template.Collision;
        }

        return JSON.stringify(template);
    }
}
