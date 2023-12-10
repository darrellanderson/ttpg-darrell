#!env ts-node

/**
 * Create a deck from individual card images and corresponding metadata.
 *
 * ARGS:
 * -f : config file (e.g. "prebuild/base/dice/assault/assault.config.json")
 *
 * CONFIG FILE:
 * - inputDir : path relative to prebuild.
 * - faces : array of {face, name, metadata}.
 * - output : create dice image and template.
 * - tags : array of tags.
 *
 * OUTPUT:
 * - assets/Templates/dice/{die}.json
 * - assets/Textures/dice/{die}.jpg
 */

import * as crypto from "crypto";
import * as fs from "fs-extra";
import * as path from "path";
import * as yargs from "yargs";

import sharp, { Sharp } from "sharp"; // TypeScript workaround

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

const DATA_DICE_TEMPLATE: { [key: string]: any } = {
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
    !Array.isArray(config.faces) ||
    config.faces.length !== 6 ||
    !Array.isArray(config.tags) ||
    typeof config.output !== "string" ||
    typeof config.name !== "string"
  ) {
    throw new Error(`config error`);
  }
  for (const face of config.faces) {
    if (typeof face.face !== "string") {
      throw new Error("config faces error");
    }
    if (typeof face.name !== "string") {
      throw new Error("config faces error");
    }
    if (typeof face.metadata !== "string" && typeof face.metadata != "object") {
      throw new Error("config faces error");
    }
  }
  for (const tag of config.tags) {
    if (typeof tag !== "string") {
      throw new Error("config tags error");
    }
  }

  // Get images.
  let faceImgSize = -1;
  const faceImgs: sharp.Sharp[] = [];
  for (const face of config.faces) {
    const faceFile = path.join(
      DIR_INPUT_PREBUILD,
      path.normalize(config.inputDir),
      path.normalize(face.face)
    );
    if (!fs.existsSync(faceFile)) {
      throw new Error(`missing "${faceFile}`);
    }
    console.log(`loading "${faceFile}"`);

    // Remember size, enforce all same size.
    const faceImg = sharp(faceFile);
    const stats = await faceImg.metadata();
    if (!stats.width || !stats.height) {
      throw new Error(
        `sharp metadata missing width or height for "${faceFile}"`
      );
    }

    if (faceImgSize === -1) {
      faceImgSize = stats.width;
    }

    if (stats.width !== faceImgSize || stats.height !== faceImgSize) {
      throw new Error(
        `face "${faceFile}" is ${stats.width}x${stats.height}, require ${faceImgSize}x${faceImgSize}`
      );
    }

    faceImgs.push(faceImg);
  }

  // ------------------------------------
  console.log("\n----- CREATING DICE FACE SHEET -----\n");

  // Use same file type as face images.
  const faceFilename = config.faces[0].face;
  const ext = path.extname(faceFilename);
  if (!ext || ext.length === 0) {
    throw new Error(`Unknown image type from "${faceFilename}"`);
  }

  const diceSheetRelativeToAssetsTextures = config.output + ext;
  let dstFile = path.join(
    DIR_OUTPUT_TEXTURE,
    path.normalize(diceSheetRelativeToAssetsTextures)
  );

  // Image layout: <https://tabletop-playground.com/wp-content/uploads/UV_D6.jpg>
  const mergedImg = sharp({
    create: {
      width: faceImgSize * 3,
      height: faceImgSize * 3,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  }).composite([
    {
      // One
      input: await faceImgs[0].toBuffer(),
      top: 0 * faceImgSize,
      left: 1 * faceImgSize,
    },
    {
      // Two
      input: await faceImgs[1].toBuffer(),
      top: 1 * faceImgSize,
      left: 0 * faceImgSize,
    },
    {
      // Three
      input: await faceImgs[2].toBuffer(),
      top: 1 * faceImgSize,
      left: 1 * faceImgSize,
    },
    {
      // Four
      input: await faceImgs[3].toBuffer(),
      top: 2 * faceImgSize,
      left: 1 * faceImgSize,
    },
    {
      // Five
      input: await faceImgs[4].toBuffer(),
      top: 2 * faceImgSize,
      left: 0 * faceImgSize,
    },
    {
      // Six
      input: await faceImgs[5].toBuffer(),
      top: 1 * faceImgSize,
      left: 2 * faceImgSize,
    },
  ]);

  console.log(`writing "${dstFile}"`);
  let dir = path.dirname(dstFile);
  fs.mkdirsSync(dir);
  mergedImg.toFile(dstFile);

  // ------------------------------------
  console.log("\n----- CREATING DICE TEMPLATE -----\n");

  dstFile = path.join(
    DIR_OUTPUT_TEMPLATE,
    path.normalize(config.output) + ".json"
  );

  const template = DATA_DICE_TEMPLATE;
  template.Name = config.name;
  template.GUID = crypto
    .createHash("sha256")
    .update(config.output)
    .digest("hex")
    .substring(0, 32)
    .toUpperCase();
  template.Metadata = config.metadata;
  template.Models[0].Texture = diceSheetRelativeToAssetsTextures;
  template.Tags = config.tags;

  // Overwrite face name/metadata.
  for (let i = 0; i < config.faces.length; i++) {
    const md = config.faces[i].metadata;
    template.Faces[i].Name = config.faces[i].name;
    template.Faces[i].Metadata =
      typeof md === "string" ? md : JSON.stringify(md);
  }

  console.log(`writing "${dstFile}"`);
  dir = path.dirname(dstFile);
  fs.mkdirsSync(dir);
  const data: string = JSON.stringify(template, null, 8);
  fs.writeFileSync(dstFile, data);
}

main();
