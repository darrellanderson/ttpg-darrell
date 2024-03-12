import { AbstractTemplate, TemplateType } from "./abstract-template";

class MyTemplate extends AbstractTemplate {}

it("constructor", () => {
    new MyTemplate();
});

it("set, copyAndFillBasicFields", () => {
    const template: TemplateType = new MyTemplate()
        .setGuidFrom("my-guid")
        .setScriptName("my-script-name")
        .setTags(["my-tag"])
        .setTemplateMetadata("my-template-metadata")
        .setTemplateName("my-template-name")
        .copyAndFillBasicFields({});
    expect(template).toEqual({
        GUID: "80C649C5D064F04848D38993D7365D6B",
        Metadata: "my-template-metadata",
        Name: "my-template-name",
        ScriptName: "my-script-name",
        Tags: ["my-tag"],
    });
});

it("no guid", () => {
    expect(() => {
        new MyTemplate()
            .setTemplateName("my-template-name")
            .copyAndFillBasicFields({});
    }).toThrow();
});

it("no name", () => {
    expect(() => {
        new MyTemplate().setGuidFrom("my-guid").copyAndFillBasicFields({});
    }).toThrow();
});
