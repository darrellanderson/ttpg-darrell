import crypto from "crypto";
import { D6_TEMPLATE } from "./d6-template.data";

export class D6Template {
    private _guidFrom: string = "";
    private _name: string = "";
    private _metadata: string = "";
    private _texturePathRelativeToAssetsTextures: string = "";
    private _faceMetadata: { [key: number]: string } = {};
    private _faceNames: { [key: number]: string } = {};

    constructor() {}

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

    setMetadata(metadata: string): this {
        this._metadata = metadata;
        return this;
    }

    setFaceMetadata(faceIndex: number, faceMetadata: string): this {
        this._faceMetadata[faceIndex] = faceMetadata;
        return this;
    }

    setFaceName(faceIndex: number, faceName: string): this {
        this._faceNames[faceIndex] = faceName;
        return this;
    }

    setTexturePathRelativeToAssetsTextures(texture: string): this {
        this._texturePathRelativeToAssetsTextures = texture;
        return this;
    }

    toTemplate(): string {
        const guid: string = crypto
            .createHash("sha256")
            .update(this._guidFrom)
            .digest("hex")
            .substring(0, 32)
            .toUpperCase();

        const template = JSON.parse(JSON.stringify(D6_TEMPLATE));
        template.GUID = guid;
        template.Name = this._name;
        template.Metadata = this._metadata;
        template.Models[0].Texture = this._texturePathRelativeToAssetsTextures;

        for (let i = 0; i < 6; i++) {
            template.Faces[i].Metadata = this._faceMetadata[i] ?? "";
            template.Faces[i].Name = this._faceNames[i] ?? (i + 1).toString();
        }

        return JSON.stringify(template, null, 4);
    }
}
