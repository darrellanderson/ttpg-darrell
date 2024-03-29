export const CARDSHEET_TEMPLATE = {
    Type: "Card",
    GUID: "$GUID",
    Name: "$NAME",
    Metadata: "",
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
    FrontTexture: "$CARDSHEET_FACE_FILENAME",
    BackTexture: "$CARDSHEET_BACK_FILENAME",
    HiddenTexture: "",
    BackIndex: "$BACK_INDEX", // 0 : same file (last card?), -1 : same as front, -2 : shared single card, stored in BackTexture, -3 : indexed back sheet, stored in BackTexture.
    HiddenIndex: -1, // 0 = use front, -1 = blur, -2 = separate file, -3 = use back
    NumHorizontal: 0, //"$NUM_COLS",
    NumVertical: 0, //"$NUM_ROWS",
    Width: 0, //"$CARD_WIDTH",
    Height: 0, //"$CARD_HEIGHT",
    Thickness: 0.05,
    HiddenInHand: true,
    UsedWithCardHolders: true,
    CanStack: true,
    UsePrimaryColorForSide: false,
    FrontTextureOverrideExposed: false,
    AllowFlippedInStack: false,
    MirrorBack: true,
    Model: "Rounded",
    Indices: [], //"$CARD_INDICES",
    CardNames: {}, //"$CARD_NAMES",
    CardMetadata: {}, //"$CARD_METADATA",
    CardTags: {},
    GroundAccessibility: "ZoomAndContext",
} as const;
