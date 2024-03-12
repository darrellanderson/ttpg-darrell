import { CardsheetTemplate } from "./cardsheet-template";

it("constructor", () => {
    new CardsheetTemplate();
});

it("toTemplate", () => {
    const template: string = new CardsheetTemplate()
        .setGuidFrom("my-file-path")
        .setTemplateName("my-name")
        .setTemplateMetadata("my-metadata")
        .setCardSizeWorld(3, 4)
        .setNumColsAndRows(1, 2)
        .setTextures("my-front-texture", "my-back-textures", -3)
        .addCard({
            name: "my-card-name",
            metadata: "my-card-metadata",
            tags: ["my-tag"],
        })
        .toTemplate();
    expect(JSON.parse(template)).toEqual({
        Type: "Card",
        GUID: "D81304864824F968BAB0760E7ECACF48",
        Name: "my-name",
        Metadata: "my-metadata",
        CollisionType: "Regular",
        Friction: 0.7,
        Restitution: 0,
        Density: 0.5,
        SurfaceType: "Cardboard",
        Roughness: 1,
        Metallic: 0,
        PrimaryColor: {
            R: 255,
            G: 255,
            B: 255,
        },
        SecondaryColor: {
            R: 0,
            G: 0,
            B: 0,
        },
        Flippable: true,
        AutoStraighten: false,
        ShouldSnap: true,
        ScriptName: "",
        Blueprint: "",
        Models: [],
        Collision: [],
        SnapPointsGlobal: false,
        SnapPoints: [],
        ZoomViewDirection: {
            X: 0,
            Y: 0,
            Z: 0,
        },
        FrontTexture: "my-front-texture",
        BackTexture: "my-back-textures",
        HiddenTexture: "",
        BackIndex: -3,
        HiddenIndex: -1,
        NumHorizontal: 1,
        NumVertical: 2,
        Width: 3,
        Height: 4,
        Thickness: 0.05,
        HiddenInHand: true,
        UsedWithCardHolders: true,
        CanStack: true,
        UsePrimaryColorForSide: false,
        FrontTextureOverrideExposed: false,
        AllowFlippedInStack: false,
        MirrorBack: true,
        Model: "Rounded",
        Indices: [0],
        CardNames: {
            "0": "my-card-name",
        },
        CardMetadata: {
            "0": "my-card-metadata",
        },
        CardTags: {
            "0": ["my-tag"],
        },
        GroundAccessibility: "ZoomAndContext",
        Tags: [],
    });
});

it("toTemplate (no texture)", () => {
    expect(() => {
        new CardsheetTemplate().toTemplate();
    }).toThrow();
});

it("toTemplate (no card size)", () => {
    expect(() => {
        new CardsheetTemplate().setTextures("a", "b", 0).toTemplate();
    }).toThrow();
});

it("toTemplate (no cols)", () => {
    expect(() => {
        new CardsheetTemplate()
            .setTextures("a", "b", 0)
            .setCardSizeWorld(1, 1)
            .toTemplate();
    }).toThrow();
});

it("toTemplate (no cards)", () => {
    expect(() => {
        new CardsheetTemplate()
            .setTextures("a", "b", 0)
            .setCardSizeWorld(1, 1)
            .setNumColsAndRows(1, 1)
            .toTemplate();
    }).toThrow();
});
