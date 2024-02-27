export const D6_TEMPLATE = {
    Type: "Dice",
    GUID: "$GUID",
    Name: "$NAME",
    Metadata: "$METADATA",
    CollisionType: "Regular",
    Friction: 0.7,
    Restitution: 0.5,
    Density: 1,
    SurfaceType: "Plastic",
    Roughness: 0.2,
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
    Flippable: false,
    AutoStraighten: false,
    ShouldSnap: true,
    ScriptName: "",
    Blueprint: "",
    Models: [
        {
            Model: "StaticMesh'/Game/Meshes/Dice/Dice_D6.Dice_D6'",
            Offset: {
                X: 0,
                Y: 0,
                Z: 0,
            },
            Scale: {
                X: 1,
                Y: 1,
                Z: 1,
            },
            Rotation: {
                X: 0,
                Y: 0,
                Z: 0,
            },
            Texture: "$TEXTURE",
            NormalMap: "",
            ExtraMap: "",
            ExtraMap2: "",
            IsTransparent: false,
            CastShadow: true,
            IsTwoSided: false,
            UseOverrides: true,
            SurfaceType: "Plastic",
        },
    ],
    Collision: [],
    Lights: [],
    SnapPointsGlobal: false,
    SnapPoints: [],
    ZoomViewDirection: {
        X: 0,
        Y: 0,
        Z: 0,
    },
    GroundAccessibility: "Nothing",
    Tags: [],
    Faces: [
        {
            X: 0,
            Y: 0,
            Z: 1,
            Name: "1",
            Metadata: "",
        },
        {
            X: -1,
            Y: 0,
            Z: 0,
            Name: "2",
            Metadata: "",
        },
        {
            X: 0,
            Y: 1,
            Z: 0,
            Name: "3",
            Metadata: "",
        },
        {
            X: 0,
            Y: -1,
            Z: 0,
            Name: "4",
            Metadata: "",
        },
        {
            X: 1,
            Y: 0,
            Z: 0,
            Name: "5",
            Metadata: "",
        },
        {
            X: 0,
            Y: 0,
            Z: -1,
            Name: "6",
            Metadata: "",
        },
    ],
} as const;
