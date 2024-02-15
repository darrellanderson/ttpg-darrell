import { CubeTemplate, CubeTemplateBoundingBox } from "./cube-template";

it("static getBoundingBox (empty)", () => {
    const bb: CubeTemplateBoundingBox = CubeTemplate.getBoundingBox([
        {
            texture: "my-texture",
            model: "my-model",
            width: 2,
            height: 2,
            depth: 2,
        },
        {
            texture: "my-texture",
            model: "my-model",
            width: 3,
            height: 1,
            depth: 1,
            left: 2,
            top: 0,
        },
    ]);
    expect(bb).toEqual({ bottom: 2, left: 0, maxDepth: 2, right: 5, top: 0 });
});

it("static getBoundingBox (empty)", () => {
    const bb: CubeTemplateBoundingBox = CubeTemplate.getBoundingBox([]);
    expect(bb).toEqual({ bottom: 0, left: 0, maxDepth: 0, right: 0, top: 0 });
});

it("constructor", () => {
    new CubeTemplate();
});

it("add/set", () => {
    new CubeTemplate()
        .addEntry({
            texture: "my-texture",
            model: "my-model",
            width: 1,
            height: 1,
            depth: 1,
        })
        .setGuidFrom("path/to/template.json")
        .setName("my-name");
});

it("toTemplate (no entries)", () => {
    expect(() => {
        new CubeTemplate().setGuidFrom("foo").toTemplate();
    }).toThrow();
});

it("toTemplate (no guid)", () => {
    expect(() => {
        new CubeTemplate()
            .addEntry({
                texture: "my-texture",
                model: "my-model",
                width: 1,
                height: 1,
                depth: 1,
            })
            .toTemplate();
    }).toThrow();
});

it("toTemplate", () => {
    const template: string = new CubeTemplate()
        .addEntry({
            texture: "my-texture",
            model: "my-model",
            width: 1,
            height: 1,
            depth: 1,
        })
        .setGuidFrom("foo")
        .toTemplate();
    if (template.includes("$")) {
        throw new Error(template);
    }
});

it("toTemplate (collider)", () => {
    const template: string = new CubeTemplate()
        .addEntry({
            texture: "my-texture",
            model: "my-model",
            width: 1,
            height: 1,
            depth: 1,
        })
        .setCollider("my-collider")
        .setGuidFrom("foo")
        .toTemplate();
    if (template.includes("$")) {
        throw new Error(template);
    }
});
