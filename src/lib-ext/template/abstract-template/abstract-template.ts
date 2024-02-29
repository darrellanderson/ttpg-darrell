import crypto from "crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TemplateType = { [key: string]: any };

export abstract class AbstractTemplate {
    private _guidFrom: string = "";
    private _templateMetadata: string = "";
    private _templateName: string = "";
    private _scriptName: string = "";

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

    setTemplateMetadata(templateMetadata: string): this {
        this._templateMetadata = templateMetadata;
        return this;
    }

    /**
     * Template name appears in the object library.
     *
     * @param name
     * @returns
     */
    setTemplateName(templateName: string): this {
        this._templateName = templateName;
        return this;
    }

    setScriptName(scriptName: string): this {
        this._scriptName = scriptName;
        return this;
    }

    copyAndFillBasicFields(template: TemplateType): TemplateType {
        if (this._guidFrom === "") {
            throw new Error("must setGuidFrom");
        }
        if (this._templateName === "") {
            throw new Error("must setTemplateName");
        }

        template = JSON.parse(JSON.stringify(template));

        const guid: string = crypto
            .createHash("sha256")
            .update(this._guidFrom)
            .digest("hex")
            .substring(0, 32)
            .toUpperCase();

        template.GUID = guid;
        template.Name = this._templateName;
        template.Metadata = this._templateMetadata;
        template.ScriptName = this._scriptName;

        return template;
    }
}
