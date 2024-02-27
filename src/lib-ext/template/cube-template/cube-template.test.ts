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
        .addSubCubeEntry({
            texture: "my-texture",
            model: "my-model",
            width: 1,
            height: 1,
            depth: 1,
        })
        .setGuidFrom("path/to/template.json")
        .setTemplateName("my-name");
});

it("toTemplate (no entries)", () => {
    expect(() => {
        new CubeTemplate().setGuidFrom("foo").toTemplate();
    }).toThrow();
});

it("toTemplate (no guid)", () => {
    expect(() => {
        new CubeTemplate()
            .addSubCubeEntry({
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
        .addSubCubeEntry({
            texture: "my-texture",
            model: "my-model",
            width: 20,
            height: 10,
            depth: 1,
            left: 5,
            top: 7,
        })
        .setGuidFrom("foo")
        .setScriptName("my-script")
        .setTemplateMetadata("my-metadata")
        .setTemplateName("my-name")
        .toTemplate();
    if (template.includes("$")) {
        throw new Error(template);
    }
    expect(JSON.parse(template)).toEqual({
        Type: "Generic",
        GUID: "2C26B46B68FFC68FF99B453C1D304134",
        Name: "my-name",
        Metadata: "my-metadata",
        CollisionType: "Regular",
        Friction: 0.7,
        Restitution: 0.1,
        Density: 1,
        SurfaceType: "Cardboard",
        Roughness: 1,
        Metallic: 0,
        PrimaryColor: { R: 255, G: 255, B: 255 },
        SecondaryColor: { R: 0, G: 0, B: 0 },
        Flippable: false,
        AutoStraighten: false,
        ShouldSnap: false,
        ScriptName: "my-script",
        Blueprint: "",
        Models: [
            {
                Model: "my-model",
                Offset: { X: -12, Y: 15, Z: 0 },
                Scale: { X: 10, Y: 20, Z: 1 },
                Rotation: { X: 0, Y: 0, Z: 0 },
                Texture: "my-texture",
                NormalMap: "",
                ExtraMap: "",
                ExtraMap2: "",
                IsTransparent: false,
                CastShadow: true,
                IsTwoSided: false,
                UseOverrides: true,
                SurfaceType: "Cardboard",
            },
        ],
        Lights: [],
        SnapPointsGlobal: false,
        SnapPoints: [],
        ZoomViewDirection: { X: 0, Y: 0, Z: 1 },
        GroundAccessibility: "Zoom",
        Tags: [],
    });
});

it("toTemplate (collider, snap point)", () => {
    const template: string = new CubeTemplate()
        .addSubCubeEntry({
            texture: "my-texture",
            model: "my-model",
            width: 20,
            height: 10,
            depth: 1,
            left: 5,
            top: 7,
        })
        .setSnapPoints([
            { left: 1, top: 2, rotation: 3, tags: ["my-snap-point"] },
        ])
        .setCollider("my-collider")
        .setGuidFrom("foo")
        .toTemplate();
    if (template.includes("$")) {
        throw new Error(template);
    }
    expect(JSON.parse(template)).toEqual({
        Type: "Generic",
        GUID: "2C26B46B68FFC68FF99B453C1D304134",
        Name: "",
        Metadata: "",
        Collision: [
            {
                Model: "my-collider",
                Offset: {
                    X: -12,
                    Y: 15,
                    Z: 0,
                },
                Rotation: {
                    X: 0,
                    Y: 0,
                    Z: 0,
                },
                Scale: {
                    X: 10,
                    Y: 20,
                    Z: 1,
                },
                Type: "Convex",
            },
        ],
        CollisionType: "Regular",
        Friction: 0.7,
        Restitution: 0.1,
        Density: 1,
        SurfaceType: "Cardboard",
        Roughness: 1,
        Metallic: 0,
        PrimaryColor: { R: 255, G: 255, B: 255 },
        SecondaryColor: { R: 0, G: 0, B: 0 },
        Flippable: false,
        AutoStraighten: false,
        ShouldSnap: false,
        ScriptName: "",
        Blueprint: "",
        Models: [
            {
                Model: "my-model",
                Offset: { X: -12, Y: 15, Z: 0 },
                Scale: { X: 10, Y: 20, Z: 1 },
                Rotation: { X: 0, Y: 0, Z: 0 },
                Texture: "my-texture",
                NormalMap: "",
                ExtraMap: "",
                ExtraMap2: "",
                IsTransparent: false,
                CastShadow: true,
                IsTwoSided: false,
                UseOverrides: true,
                SurfaceType: "Cardboard",
            },
        ],
        Lights: [],
        SnapPointsGlobal: false,
        SnapPoints: [
            {
                FlipValidity: 0,
                Range: 3,
                RotationOffset: 3,
                Shape: 0,
                SnapRotation: 2,
                Tags: ["my-snap-point"],
                X: 2,
                Y: 1,
                Z: 0.5,
            },
        ],
        ZoomViewDirection: { X: 0, Y: 0, Z: 1 },
        GroundAccessibility: "Zoom",
        Tags: [],
    });
});
