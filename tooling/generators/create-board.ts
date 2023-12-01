#!env ts-node

/**
 * Create a board object from a board image.  If the image is large, split it
 * into chunks and join those as a series of objects in the final template.
 *
 * ARGS:
 * -f <file> : config file (e.g. "prebuild/base/board/map-red-dark.config.json")
 *
 * CONFIG FILE:
 * - width : final obj width, in game units.
 * - height : final obj height, in game units.
 * - depth : final obj depth, in game units.
 * - preshrink : if positive, shrink input to this max dimension before splitting.
 * - input : input image.
 * - inputMask : input image.
 * - output : create this output image set and template JSON file.
 * - metadata : object template metadata string.
 * - snapPoints : array of {x,y,z} points.
 *
 * OUTPUT:
 * - assets/Models/utility/unit-cube-top-uvs.obj (if missing)
 * - assets/Templates/.../{board}.json
 * - assets/Textures/.../{board}-?x?.jpg
 */

import * as fs from "fs-extra";
import * as yargs from "yargs";
import * as path from "path";
import * as crypto from "crypto";

import { ImageSplit, ImageSplitChunk } from "./lib/image-split";

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

const DIR_OUTPUT_TEMPLATE: string = path.normalize("assets/Templates");

const DATA_MERGED_CUBES_TEMPLATE = {
  Type: "Generic",
  GUID: "$GUID HERE",
  Name: "$NAME HERE",
  Metadata: "",
  CollisionType: "Regular",
  Friction: 0.7,
  Restitution: 0.3,
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
  Collision: [],
  Lights: [],
  SnapPointsGlobal: false,
  SnapPoints: [{}],
  ZoomViewDirection: {
    X: 0,
    Y: 0,
    Z: 1,
  },
  GroundAccessibility: "Zoom",
  Tags: [],
};

const DATA_CUBE_MODEL_TEMPLATE = {
  Model: "$MODEL_HERE",
  Offset: {
    X: -1,
    Y: 0,
    Z: 0,
  },
  Scale: {
    X: 1,
    Y: 1,
    Z: 0.1,
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

interface Chunk {
  left: number;
  top: number;
  width: number;
  height: number;
  dstFileRelativeToTextureDir: string;
}

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
    typeof config.width !== "number" ||
    typeof config.height !== "number" ||
    typeof config.depth !== "number" ||
    typeof config.preshrink.w !== "number" ||
    typeof config.preshrink.h !== "number" ||
    typeof config.input !== "string" ||
    typeof config.output !== "string" ||
    typeof config.metadata !== "string" ||
    !Array.isArray(config.snapPoints)
  ) {
    throw new Error(`config error`);
  }

  console.log("CONFIG: " + configFile);

  // ------------------------------------
  console.log("\n----- SPLIT INPUT -----\n");

  console.log(`PROCESSING "${config.input}"`);
  const outputBasename = path.basename(config.output);
  const inFile = path.join("prebuild", config.input);
  const outFile = path.join(
    config.output,
    outputBasename + "-" + ImageSplit.REPLACE_WITH_COLxROW + ".jpg"
  );
  const outModel = path.join(
    config.output,
    outputBasename + "-" + ImageSplit.REPLACE_WITH_COLxROW + ".obj"
  );

  const splitter = new ImageSplit()
    .setInFile(inFile)
    .setOutFile(outFile)
    .setOutModel(outModel)
    .setChunkPx(4096)
    .setGutterPx(4)
    .setMaskMultiplier(4)
    .setPreShrinkW(config.preshrink.w)
    .setPreShrinkH(config.preshrink.h);

  if (config.inputMask) {
    const inMask = path.join("prebuild", config.inputMask);
    const outMask = path.join(
      config.output,
      outputBasename + "-" + ImageSplit.REPLACE_WITH_COLxROW + "-mask.png"
    );
    splitter.setInMask(inMask).setOutMask(outMask);
  }

  const imageChunks: ImageSplitChunk[] = await splitter.cleanOutFiles().split();

  // ------------------------------------
  console.log("\n----- CREATE OUTPUT TEMPLATE -----\n");

  const dstFile: string = path.join(
    DIR_OUTPUT_TEMPLATE,
    `${config.output}.json`
  );
  const template = DATA_MERGED_CUBES_TEMPLATE;

  // Fill in the top-level.
  template.Name = path.basename(config.output);
  template.GUID = crypto
    .createHash("sha256")
    .update(config.output)
    .digest("hex")
    .substring(0, 32)
    .toUpperCase();
  template.Metadata = config.metadata;
  template.SnapPoints = config.snapPoints;

  // Add cubes.
  const _round3Decimals = (x: number): number => {
    return Math.round(x * 1000) / 1000;
  };
  template.Models = [];
  for (const chunk of imageChunks) {
    const cubeTemplate = JSON.parse(JSON.stringify(DATA_CUBE_MODEL_TEMPLATE)); // copy

    const y =
      (chunk.uLeft + chunk.uWidth / 2) * config.width - config.width / 2;
    const x =
      (chunk.vTop + chunk.vHeight / 2) * config.height - config.height / 2;
    cubeTemplate.Offset = {
      X: -_round3Decimals(x), // TTPG flips X/Y
      Y: _round3Decimals(y),
      Z: 0,
    };

    const height = chunk.vHeight * config.height;
    const width = chunk.uWidth * config.width;
    cubeTemplate.Scale = {
      X: _round3Decimals(height), // TTPG flips X/Y
      Y: _round3Decimals(width),
      Z: _round3Decimals(config.depth),
    };

    cubeTemplate.Model = chunk.model;
    cubeTemplate.Texture = chunk.file;
    if (chunk.mask) {
      cubeTemplate.ExtraMap = chunk.mask;
    }

    template.Models.push(cubeTemplate);
  }

  console.log(`creating "${dstFile}"`);
  fs.mkdirSync(path.dirname(dstFile), { recursive: true });
  const data: string = JSON.stringify(template, null, 8);
  fs.writeFileSync(dstFile, data);

  // ------------------------------------
  console.log("\n----- DONE -----\n");
}

main();
