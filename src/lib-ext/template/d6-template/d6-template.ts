import { D6_TEMPLATE } from "./d6-template.data";
import { AbstractTemplate } from "../abstract-template/abstract-template";

export class D6Template extends AbstractTemplate {
    private _texturePathRelativeToAssetsTextures: string = "";
    private _faceMetadata: { [key: number]: string } = {};
    private _faceNames: { [key: number]: string } = {};

    constructor() {
        super();
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
        const template = this.copyAndFillBasicFields(D6_TEMPLATE);

        template.Models[0].Texture = this._texturePathRelativeToAssetsTextures;
        for (let i = 0; i < 6; i++) {
            template.Faces[i].Metadata = this._faceMetadata[i] ?? "";
            template.Faces[i].Name = this._faceNames[i] ?? (i + 1).toString();
        }

        return JSON.stringify(template, null, 4);
    }
}
