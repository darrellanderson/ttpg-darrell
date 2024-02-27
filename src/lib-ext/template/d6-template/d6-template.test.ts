import { D6Template } from "./d6-template";

it("constructor", () => {
    new D6Template();
});

it("setters", () => {
    const template: string = new D6Template()
        .setGuidFrom("path")
        .setMetadata("my-metadata")
        .setName("my-name")
        .setTexturePathRelativeToAssetsTextures("my-texture")
        .setFaceName(0, "face-name-0")
        .setFaceMetadata(0, "face-metadata-0")
        .toTemplate();

    expect(JSON.parse(template)).toEqual({
        AutoStraighten: false,
        Blueprint: "",
        Collision: [],
        CollisionType: "Regular",
        Density: 1,
        Faces: [
            {
                Metadata: "face-metadata-0",
                Name: "face-name-0",
                X: 0,
                Y: 0,
                Z: 1,
            },
            { Metadata: "", Name: "2", X: -1, Y: 0, Z: 0 },
            { Metadata: "", Name: "3", X: 0, Y: 1, Z: 0 },
            { Metadata: "", Name: "4", X: 0, Y: -1, Z: 0 },
            { Metadata: "", Name: "5", X: 1, Y: 0, Z: 0 },
            { Metadata: "", Name: "6", X: 0, Y: 0, Z: -1 },
        ],
        Flippable: false,
        Friction: 0.7,
        GUID: "A0AF9F865BF637E6736817F4CE552E4C",
        GroundAccessibility: "Nothing",
        Lights: [],
        Metadata: "my-metadata",
        Metallic: 0,
        Models: [
            {
                CastShadow: true,
                ExtraMap: "",
                ExtraMap2: "",
                IsTransparent: false,
                IsTwoSided: false,
                Model: "StaticMesh'/Game/Meshes/Dice/Dice_D6.Dice_D6'",
                NormalMap: "",
                Offset: { X: 0, Y: 0, Z: 0 },
                Rotation: { X: 0, Y: 0, Z: 0 },
                Scale: { X: 1, Y: 1, Z: 1 },
                SurfaceType: "Plastic",
                Texture: "my-texture",
                UseOverrides: true,
            },
        ],
        Name: "my-name",
        PrimaryColor: { B: 255, G: 255, R: 255 },
        Restitution: 0.5,
        Roughness: 0.2,
        ScriptName: "",
        SecondaryColor: { B: 0, G: 0, R: 0 },
        ShouldSnap: true,
        SnapPoints: [],
        SnapPointsGlobal: false,
        SurfaceType: "Plastic",
        Tags: [],
        Type: "Dice",
        ZoomViewDirection: { X: 0, Y: 0, Z: 0 },
    });
});
