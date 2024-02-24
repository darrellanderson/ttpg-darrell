export const CUBE_SUB_TEMPLATE = {
    Model: "$MODEL_HERE",
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
    Texture: "$TEXTURE HERE",
    NormalMap: "",
    ExtraMap: "",
    ExtraMap2: "",
    IsTransparent: false,
    CastShadow: true,
    IsTwoSided: false,
    UseOverrides: true,
    SurfaceType: "Cardboard",
};

export const CUBE_SNAP_POINT = {
    X: 0,
    Y: 0,
    Z: 0,
    Range: 3,
    SnapRotation: 2,
    RotationOffset: 0,
    Shape: 0,
    FlipValidity: 0,
    Tags: [],
};

// Bounciness is "Restitution"
export const CUBE_TEMPLATE = {
    Type: "Generic",
    GUID: "$GUID HERE",
    Name: "$NAME HERE",
    Metadata: "",
    CollisionType: "Regular",
    Friction: 0.7,
    Restitution: 0.1,
    Density: 1,
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
    Flippable: false,
    AutoStraighten: false,
    ShouldSnap: false,
    ScriptName: "",
    Blueprint: "",
    Models: ["$REPLACE THIS"],
    Collision: [
        {
            Model: "$COLLISION MODEL HERE",
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
            Type: "Convex",
        },
    ],
    Lights: [],
    SnapPointsGlobal: false,
    SnapPoints: [],
    ZoomViewDirection: {
        X: 0,
        Y: 0,
        Z: 1,
    },
    GroundAccessibility: "Zoom",
    Tags: [],
};
