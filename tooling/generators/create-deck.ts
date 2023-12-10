#!env ts-node

/**
 * Create a deck from individual card images and corresponding metadata.
 *
 * ARGS:
 * -f : config file (e.g. "prebuild/card/.../{deck}.config.json")
 *
 * CONFIG FILE:
 * - inputDir : path relative to prebuild.
 * - inputCards : [{face, back?, name, metadata}, ...].
 * - cardWidth : card width, in game units.
 * - cardHeight : card height, in game units.
 * - preshrink : if positive, shrink cards to max dimension before assembly.
 * - output : create cardsheet and deck template.
 *
 * OUTPUT:
 * - assets/Templates/card/{deck}.json
 * - assets/Textures/card/{deck}.face.jpg
 * - assets/Textures/card/{deck}.back.jpg
 *
 * NOTES:
 *
 * Extract individual cards from an existing (e.g. TTS) cardsheet:
 * % convert -crop 744x1040 actioncards.jpg out.jpg
 *
 * Create input array JSON:
 * % ls -1 *\*.jpg |sed -e "s/.jpg$//" | awk -F\/ '{print "{ @face@: @" $1"/"$2".jpg@,@name@: @"toupper(substr($1, 1, 1)) substr($1, 2)" "$2"@,@metadata@: @card.action."$1":base/"$2"@}," }' | tr '@' '"'
 */

import * as fs from "fs-extra";
import * as yargs from "yargs";
import * as path from "path";
import * as crypto from "crypto";

import { MergeImage, MergeImageResult } from "./lib/merge-image";

const args = yargs
  .options({
    f: {
      alias: "config",
      descript: "input configuration file (JSON)",
      type: "string",
      demand: true,
    },
  })
  .parseSync(); // creates typed result

const DIR_INPUT_PREBUILD: string = path.normalize("prebuild");
const DIR_OUTPUT_TEMPLATE: string = path.normalize("assets/Templates");
const DIR_OUTPUT_TEXTURE: string = path.normalize("assets/Textures");

const CHUNK_SIZE = 4096;

const DATA_DECK_TEMPLATE: { [key: string]: any } = {
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
  BackIndex: "$BACK_INDEX",
  HiddenIndex: -3, // 0 = use front, -1 = blur, -2 = separate file, -3 = use back
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
};

async function main() {
  // ------------------------------------
  console.log("\n----- READ CONFIG -----\n");

  const configFile = path.normalize(args.f);
  if (!fs.existsSync(configFile)) {
    throw new Error(`Missing config file "${configFile}"`);
  }
  const configData = fs.readFileSync(configFile).toString();
  const config = JSON.parse(configData);

  // Validate expected fields.
  if (
    typeof config.inputDir !== "string" ||
    !Array.isArray(config.inputCards) ||
    typeof config.cardWidth !== "number" ||
    typeof config.cardHeight !== "number" ||
    typeof config.preshrink !== "number" ||
    typeof config.output !== "string" ||
    typeof config.name !== "string"
  ) {
    throw new Error(`config error`);
  }

  for (const inputCard of config.inputCards) {
    if (
      typeof inputCard.face !== "string" ||
      typeof inputCard.name !== "string" ||
      typeof inputCard.metadata !== "string"
    ) {
      throw new Error("config inputCard error");
    }
  }

  const origInputCards = config.inputCards;
  config.inputCards = "[ ... ]";
  console.log("CONFIG: " + JSON.stringify(config, null, 4));
  config.inputCards = origInputCards;

  // ------------------------------------
  console.log("\n----- CREATING FACE CARDSHEET -----\n");
  const cardsheetFaceRelativeToAssetsTextures = config.output + ".face.jpg";

  const mergeImageResult: MergeImageResult = await new MergeImage()
    .setSrcFilesRelativeToPrebuild(
      config.inputCards.map((x: any) =>
        path.join(path.normalize(config.inputDir), path.normalize(x.face))
      )
    )
    .setDstFileRelativeToAssetsTextures(cardsheetFaceRelativeToAssetsTextures)
    .setPreShrink(config.preshrink)
    .merge();
  const layout = {
    cols: mergeImageResult.cols,
    rows: mergeImageResult.rows,
  };

  // ------------------------------------
  console.log("\n----- CREATING BACK CARDSHEET -----\n");

  const cardsheetBackRelativeToAssetsTextures =
    path.normalize(config.output) + ".back.jpg";

  // Boring merge of a single image (resizes).
  await new MergeImage()
    .setSrcFilesRelativeToPrebuild([config.sharedBack])
    .setDstFileRelativeToAssetsTextures(cardsheetBackRelativeToAssetsTextures)
    .setPreShrink(config.preshrink)
    .merge();

  // ------------------------------------
  console.log("\n----- CREATING DECK TEMPLATE -----\n");

  const dstFile = path.join(
    DIR_OUTPUT_TEMPLATE,
    path.normalize(config.output) + ".json"
  );

  const template = DATA_DECK_TEMPLATE;
  template.Name = config.name;
  template.GUID = crypto
    .createHash("sha256")
    .update(config.output)
    .digest("hex")
    .substring(0, 32)
    .toUpperCase();
  template.FrontTexture = cardsheetFaceRelativeToAssetsTextures;
  template.BackTexture = cardsheetBackRelativeToAssetsTextures;
  template.NumHorizontal = layout.cols;
  template.NumVertical = layout.rows;
  template.Width = config.cardWidth;
  template.Height = config.cardHeight;

  for (let index = 0; index < config.inputCards.length; index++) {
    const inputCard = config.inputCards[index];
    template.Indices.push(index);
    template.CardNames[index] = inputCard.name;
    template.CardMetadata[index] = inputCard.metadata;
  }

  // If using tags, apply to deck AND each card
  if (config.cardTags) {
    template.Tags = config.cardTags;
    for (let index = 0; index < config.inputCards.length; index++) {
      template.CardTags[index] = config.cardTags;
    }
  }

  console.log(`writing "${dstFile}"`);
  const dir = path.dirname(dstFile);
  fs.mkdirsSync(dir);
  const data: string = JSON.stringify(template, null, 8);
  fs.writeFileSync(dstFile, data);
}

main();
