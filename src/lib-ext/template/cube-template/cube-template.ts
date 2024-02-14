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
    private _name: string = "";
    private _guidFrom: string = "";

    static getBoundingBox(
        entries: Array<CubeTemplateEntry>
    ): CubeTemplateBoundingBox {
        let left: number = 0;
        let right: number = 0;
        let top: number = 0;
        let bottom: number = 0;
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

    setName(name: string): this {
        this._name = name;
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

        return JSON.stringify(template);
    }
}
