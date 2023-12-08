#!env ts-node

/**
 * Create mat with card images and corresponding metadata.
 *
 * ARGS:
 * -f : config file (e.g. "prebuild/base/mat/court.config.json")
 *
 * CONFIG FILE:
 * - cardWidth : card width, in game units.
 * - cardHeight : card height, in game units.
 * - depth : final obj depth, in game units.
 * - gap : padding between cards and to mat edge, in game units.
 * - gapAfterColumn : extra padding after.
 *
 * - inputDir : path relative to prebuild.
 * - slots : array of [img, label, tags].
 * - cols : if > 0, wrap after N columns.
 * - postShrink : if > 0, shrink final image.
 * - alpha : if < 0, fade slot images.
 *
 * - metadata : string
 * - output : create mat image and template.
 * - tags : array of tags.
 *
 * OUTPUT:
 * - assets/Templates/{output}.json
 * - assets/Textures/{output}.jpg
 *
 * NOTES:
 * - No need for preshrink, card processing handled that.
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

const DATA_MAT_TEMPLATE: { [key: string]: any } = {
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
  Models: [
    {
      Model: "utility/unit-cube-top-uvs.obj",
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
    },
  ],
  Collision: [],
  Lights: [],
  SnapPointsGlobal: false,
  SnapPoints: [{}],
  ZoomViewDirection: {
    X: 0,
    Y: 0,
    Z: 1,
  },
  GroundAccessibility: "Nothing",
  Tags: [],
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
    !Array.isArray(config.slots) ||
    !Array.isArray(config.tags) ||
    typeof config.cardWidth !== "number" ||
    typeof config.cardHeight !== "number" ||
    typeof config.depth !== "number" ||
    typeof config.gap !== "number" ||
    typeof config.postShrink !== "number" ||
    typeof config.cols !== "number" ||
    typeof config.metadata !== "string" ||
    typeof config.output !== "string" ||
    !Array.isArray(config.tags)
  ) {
    throw new Error(`config error`);
  }
  for (const slot of config.slots) {
    if (typeof slot.img !== "string") {
      throw new Error("config slot error (img)");
    }
    if (typeof slot.label !== "string") {
      throw new Error("config slot error (label)");
    }
    if (!Array.isArray(slot.tags)) {
      throw new Error("config slot error (tags)");
    }
  }
  for (const tag of config.tags) {
    if (typeof tag !== "string") {
      throw new Error("config tags error");
    }
  }

  // ------------------------------------
  console.log("\n----- DO LAYOUT -----\n");

  // Get card size in pixels, make sure all card images are same size.
  const cardPixels = { w: 0, h: 0 };
  for (let index = 0; index < config.slots.length; index++) {
    const slot = config.slots[index];

    // Store image in slot record.
    const srcFile = path.join(
      DIR_INPUT_PREBUILD,
      path.normalize(config.inputDir),
      path.normalize(slot.img)
    );
    if (!fs.existsSync(srcFile)) {
      throw new Error(`missing "${srcFile}`);
    }
    console.log(`loading card "${srcFile}"`);
    slot.img = sharp(srcFile);

    const stats = await slot.img.metadata();
    if (!stats.width || !stats.height) {
      throw new Error(
        `sharp metadata missing width or height for "${srcFile}"`
      );
    }
    if (cardPixels.w <= 0) {
      cardPixels.w = stats.width;
      cardPixels.h = stats.height;
    }
    if (cardPixels.w !== stats.width || cardPixels.h !== stats.height) {
      throw new Error(
        `img "${srcFile}" is ${stats.width}x${stats.height}, require ${cardPixels.w}x${cardPixels.h}`
      );
    }
  }
  if (cardPixels.h <= 0) {
    throw new Error("no slots?");
  }

  // Create backing image.  We could be clever with shared UVs, but keep
  // things simple and create a single image.
  const cols = config.cols > 0 ? config.cols : config.slots.length;
  const rows = Math.ceil(config.slots.length / cols);
  console.log(
    `layout ${cols}x${rows} (config #slots=${config.slots.length} cols=${config.cols})`
  );

  // Game object size (world space).
  const world = {
    w: config.gap * (cols + 1) + config.cardWidth * cols,
    h: config.gap * (rows + 1) + config.cardHeight * rows,
  };

  // Backing image size (pixels).
  const gapPx = Math.floor((config.gap * cardPixels.h) / config.cardHeight);
  const px = {
    w: gapPx * (cols + 1) + cardPixels.w * cols,
    h: gapPx * (rows + 1) + cardPixels.h * rows,
  };

  // ------------------------------------
  console.log("\n----- CREATE MAT IMAGE -----\n");

  // Compute bleed for 126/128 image use (UVs).
  const bleed = {
    w: Math.max(Math.floor(px.w * 0.007936), 1),
    h: Math.max(Math.floor(px.h * 0.007936), 1),
  };

  const composite: {}[] = [];
  const snapPoints: {}[] = [];
  for (let index = 0; index < config.slots.length; index++) {
    const slot = config.slots[index];
    const col = index % cols;
    const row = Math.floor(index / cols);

    let left = gapPx + col * (gapPx + cardPixels.w) + bleed.w;
    const top = gapPx + row * (gapPx + cardPixels.h) + bleed.h;

    console.log(`[${index} @ ${col}x${row}]`);

    const alpha = config.alpha ? config.alpha : 1;
    const input = await slot.img.grayscale(true).ensureAlpha(alpha).toBuffer();

    // Config value is 1-based.
    if (config.gapAfterColumn && col >= config.gapAfterColumn) {
      left += gapPx * 3;
    }

    // Card image.
    composite.push({ input, left, top });

    // Label.
    if (slot.label) {
      const w = cardPixels.w;
      const h = cardPixels.h;
      const text = slot.label;
      const svgText = `<svg width="${w}" height="${h}">
            <style>
              .label { 
                fill: white;
                font-size: 85px;
                paint-order: stroke;
                stroke: #000000;
                stroke-width: 60px;
                stroke-linecap: butt;
                stroke-linejoin: miter;
                font-weight: 800;
            }
            </style>
            <text x="50%" y="50%" text-anchor="middle" alignment-baseline="middle" class="label">${text}</text>
          </svg>`;
      const svgBuffer = Buffer.from(svgText);
      composite.push({ input: svgBuffer, left, top });
    }

    // Slot snap point (TTPG flips XY).
    const snapPoint = {
      Y: config.gap * (col + 1) + config.cardWidth * (col + 0.5) - world.w / 2,
      X:
        world.h / 2 -
        (config.gap * (row + 1) + config.cardHeight * (row + 0.5)),
      Tags: slot.tags,

      // Other snap point fields.
      Z: config.depth / 2,
      Range: 3,
      SnapRotation: config.snapRotation ? config.snapRotation : 2, // 3 = rotate + upright
      RotationOffset: 0,
      Shape: 0,
      FlipValidity: 0,
    };
    if (config.snapDeltaX) {
      snapPoint.X += config.snapDeltaX;
    }
    if (slot.snapRotation) {
      snapPoint.SnapRotation = slot.snapRotation;
    }
    snapPoints.push(snapPoint);
  }

  let width = px.w + bleed.w * 2;
  let height = px.h + bleed.h * 2;

  if (config.gapAfterColumn) {
    width += gapPx * 3;
  }

  let dstImg = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  }).composite(composite);

  if (config.postShrink > 0) {
    const scale = config.postShrink / Math.max(width, height);
    const postW = Math.round(width * scale);
    const postH = Math.round(height * scale);
    console.log(`postShrink: ${postW}x${postH}`);
    dstImg = sharp(await dstImg.png().toBuffer());
    dstImg = dstImg.resize(postW, postH, {
      fit: "fill",
    });
  }

  const dstImgRelativeToAssetsTextures = path.normalize(config.output + ".jpg");
  let dstFile = path.join(DIR_OUTPUT_TEXTURE, dstImgRelativeToAssetsTextures);
  console.log(`writing mat image "${dstFile}"`);

  let dir = path.dirname(dstFile);
  fs.mkdirsSync(dir);
  dstImg.toFile(dstFile);

  // ------------------------------------
  console.log("\n----- CREATE MAT TEMPLATE -----\n");

  const template = DATA_MAT_TEMPLATE;
  template.Name = path.basename(config.output);
  template.GUID = crypto
    .createHash("sha256")
    .update(config.output)
    .digest("hex")
    .substring(0, 32)
    .toUpperCase();
  template.Metadata = config.metadata;
  template.Tags = config.tags;
  template.Models[0].Texture = dstImgRelativeToAssetsTextures;
  template.Models[0].Scale = { X: world.h, Y: world.w, Z: config.depth };
  template.SnapPoints = snapPoints;

  dstFile = path.join(
    DIR_OUTPUT_TEMPLATE,
    path.normalize(config.output + ".json")
  );
  console.log(`writing template "${dstFile}"`);
  fs.mkdirSync(path.dirname(dstFile), { recursive: true });
  const data: string = JSON.stringify(template, null, 8);
  fs.writeFileSync(dstFile, data);
}

main();
