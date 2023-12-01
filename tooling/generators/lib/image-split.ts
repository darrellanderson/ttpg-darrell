import * as fs from "fs-extra";
import path from "path";

import sharp, { Sharp, SharpOptions } from "sharp"; // TypeScript workaround

const DATA_UNIT_CUBE: string = `v 0.5 0.5 0.5
v 0.5 0.5 -0.5
v -0.5 0.5 -0.5
v -0.5 0.5 0.5
v 0.5 -0.5 0.5
v 0.5 -0.5 -0.5
v -0.5 -0.5 -0.5
v -0.5 -0.5 0.5

# Bleed gutters
vt $VT_U0 $VT_V0
vt $VT_U1 $VT_V0
vt $VT_U1 $VT_V1
vt $VT_U0 $VT_V1

vn 0 1 0
vn 1 0 0
vn 0 0 1
vn -1 0 0
vn 0 0 -1
vn 0 -1 0

# Top (only top has UVs)
f 1/1/1 2/2/1 3/3/1
f 1/1/1 3/3/1 4/4/1

# Bottom
f 5//6 7//6 6//6
f 5//6 8//6 7//6 

# Sides
f 1//2 5//2 2//2
f 5//2 6//2 2//2

f 2//3 6//3 3//3
f 6//3 7//3 3//3

f 3//4 7//4 4//4
f 7//4 8//4 4//4

f 4//5 8//5 5//5
f 1//5 4//5 5//5
`;

// Image chunk contains an image with a bleed gutter.
// The "u" sizes are relative to the "inner" image, ignoring gutter.
// Relies on proper UV mapping to line up chunk edges.
export type ImageSplitChunk = {
  file: string;
  mask: string;
  model: string;

  // "Inner" chunk image position and size [0:1] relative to src size values.
  uLeft: number;
  vTop: number;
  uWidth: number;
  vHeight: number;

  // Gutter size relative to with-gutters final image.
  uGutter: number;
  vGutter: number;
};

/**
 * Split an image into chunks, optionally applying a UV gutter.
 * If using and image AND a mask, size the mask to be a pow2
 * child of the primary image so the UVs align.
 */
export class ImageSplit {
  public static readonly REPLACE_WITH_COLxROW = "{COLxROW}";

  private _verbose: boolean = true;

  // Input parameters.
  private _inFile: string = "";
  private _inMask: string = "";

  // Output parameters.
  private _outFile: string = ""; // with replace substring
  private _outMask: string = ""; // with replace substring
  private _outModel: string = ""; // with replace substring

  // Wrangle parameters.
  private _chunkPx: number = 4096;
  private _gutterPx: number = 0; // UV gutter
  private _preShrinkW: number = 0; // fit final image (handles gutter)
  private _preShrinkH: number = 0; // fit final image (handles gutter)
  private _maskMultiplier: number = 1;

  // Image processing.  Store buffer format to ensure no active mutations.
  private _inFileBuf: any;
  private _inMaskBuf: any;

  public setVerbose(value: boolean): this {
    this._verbose = value;
    return this;
  }

  // ----------------------------------

  public setInFile(inFile: string): this {
    if (!fs.existsSync(inFile) || !fs.statSync(inFile).isFile) {
      throw new Error(`missing inFile "${inFile}"`);
    }
    this._inFile = inFile;
    return this;
  }

  public setInMask(inMask: string): this {
    if (!fs.existsSync(inMask) || !fs.statSync(inMask).isFile) {
      throw new Error(`missing inMask "${inMask}"`);
    }
    this._inMask = inMask;
    return this;
  }

  // ----------------------------------

  public setOutFile(outFile: string): this {
    if (!outFile.includes(ImageSplit.REPLACE_WITH_COLxROW)) {
      throw new Error(
        `outFile "${outFile}" must contain replacement string "${ImageSplit.REPLACE_WITH_COLxROW}"`
      );
    }
    this._outFile = outFile;
    return this;
  }

  public setOutMask(outMask: string): this {
    if (!outMask.includes(ImageSplit.REPLACE_WITH_COLxROW)) {
      throw new Error(
        `outMask "${outMask}" must contain replacement string "${ImageSplit.REPLACE_WITH_COLxROW}"`
      );
    }
    this._outMask = outMask;
    return this;
  }

  public setOutModel(outModel: string): this {
    if (!outModel.includes(ImageSplit.REPLACE_WITH_COLxROW)) {
      throw new Error(
        `outModel "${outModel}" must contain replacement string "${ImageSplit.REPLACE_WITH_COLxROW}"`
      );
    }
    this._outModel = outModel;
    return this;
  }

  // ----------------------------------

  public setChunkPx(px: number): this {
    if (px <= 0 || px > 4096) {
      throw new Error("px out of range");
    }
    this._chunkPx = px;
    return this;
  }

  public setGutterPx(px: number): this {
    if (px < 0 || px > 256) {
      throw new Error("px out of range");
    }
    this._gutterPx = px;
    return this;
  }

  public setPreShrinkW(px: number): this {
    this._preShrinkW = px;
    return this;
  }

  public setPreShrinkH(px: number): this {
    this._preShrinkH = px;
    return this;
  }

  public setMaskMultiplier(value: number): this {
    this._maskMultiplier = value;
    return this;
  }

  // ----------------------------------

  public cleanOutFiles(): this {
    const clean = (filename: string) => {
      const dir = path.dirname(filename);
      const basename = path.basename(filename);
      const m = basename.match(
        "(.*)" + ImageSplit.REPLACE_WITH_COLxROW + "(.*)"
      );
      if (!m) {
        throw new Error(`outFile does not follow pattern`);
      }
      const prefix = m[1];
      const suffix = m[2];
      if (prefix.length === 0 || suffix.length === 0) {
        throw new Error("must have non-empty prefix and suffix");
      }
      if (this._verbose) {
        console.log(
          `cleanFiles TYPE "${dir}/${prefix}${ImageSplit.REPLACE_WITH_COLxROW}${suffix}"`
        );
      }

      if (!fs.existsSync(dir)) {
        return this;
      }
      const basenames = fs.readdirSync(dir);
      for (const basename of basenames) {
        if (basename.startsWith(prefix) && basename.endsWith(suffix)) {
          const filename = path.join(dir, basename);
          if (this._verbose) {
            console.log(`cleanFiles DELE "${filename}"`);
          }
          fs.removeSync(filename);
        }
      }
    };

    if (this._outFile.length > 0) {
      clean(path.join("assets", "Textures", this._outFile));
    }
    if (this._outMask.length > 0) {
      clean(path.join("assets", "Textures", this._outMask));
    }
    if (this._outModel.length > 0) {
      clean(path.join("assets", "Models", this._outModel));
    }
    return this;
  }

  // ----------------------------------

  private async _loadBufs(): Promise<void> {
    const load = async (filename: string) => {
      const img = sharp(filename);
      const metadata = await img.metadata();
      const w: number = metadata.width ? metadata.width : -1;
      const h: number = metadata.height ? metadata.height : -1;
      if (w < 0 || h < 0) {
        throw new Error("bad metadata");
      }
      if (this._verbose) {
        console.log(`loaded "${filename}" [${w}x${h}]`);
      }
      return await img.png().toBuffer();
    };
    if (this._inFile.length > 0) {
      this._inFileBuf = await load(this._inFile);
    }
    if (this._inMask.length > 0) {
      this._inMaskBuf = await load(this._inMask);
    }
  }

  private async _preshrink(): Promise<void> {
    const shrink = async (buf: any, isMask: boolean) => {
      // Get size.
      const img = sharp(buf);
      const metadata = await img.metadata();
      const w: number = metadata.width ? metadata.width : -1;
      const h: number = metadata.height ? metadata.height : -1;
      if (w < 0 || h < 0) {
        throw new Error("bad metadata");
      }

      let chunkPx = this._chunkPx;
      let gutterPx = this._gutterPx;
      let shrinkW = this._preShrinkW;
      let shrinkH = this._preShrinkH;
      const inner = 1 - (gutterPx * 2) / chunkPx;

      // If not shrinking, set to image size (in case mask multiplying).
      if (shrinkW <= 0) {
        shrinkW = w / inner;
      }
      if (shrinkH <= 0) {
        shrinkH = h / inner;
      }

      if (isMask) {
        chunkPx /= this._maskMultiplier;
        gutterPx /= this._maskMultiplier;
        shrinkW /= this._maskMultiplier;
        shrinkH /= this._maskMultiplier;
      }

      // Compute scaled size.
      let scale = 1;
      if (shrinkW > 0) {
        const usableW = Math.floor(shrinkW * inner);
        scale = Math.min(usableW / w, scale);
      }
      if (shrinkH > 0) {
        const usableH = Math.floor(shrinkH * inner);
        scale = Math.min(usableH / h, scale);
      }
      const outW = Math.floor(w * scale);
      const outH = Math.floor(h * scale);

      if (this._verbose) {
        console.log(
          `shrinking ${
            isMask ? "mask" : "file"
          } [${w}x${h}] => [${outW}x${outH}] (${(inner * 100).toFixed(3)})`
        );
      }
      const shrunkBuf = await img
        .resize(outW, outH, { fit: "fill" })
        .png()
        .toBuffer();

      return shrunkBuf;
    };

    if (this._inFileBuf) {
      this._inFileBuf = await shrink(this._inFileBuf, false);
    }
    if (this._inMaskBuf) {
      this._inMaskBuf = await shrink(this._inMaskBuf, true);
    }
  }

  private async _getChunkPlan(): Promise<ImageSplitChunk[]> {
    const chunks: ImageSplitChunk[] = [];

    // Compute num cols, rows.
    const innerChunkPx = this._chunkPx - this._gutterPx * 2;
    const img = sharp(this._inFileBuf);
    const metadata = await img.metadata();
    const w: number = metadata.width ? metadata.width : -1;
    const h: number = metadata.height ? metadata.height : -1;
    if (w < 0 || h < 0) {
      throw new Error("bad metadata");
    }
    const cols = Math.ceil(w / innerChunkPx);
    const rows = Math.ceil(h / innerChunkPx);
    if (this._verbose) {
      console.log(`chunk plan [${innerChunkPx}px] <${cols}x${rows}>`);
    }

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        // Compute inner image area.
        const left = innerChunkPx * col;
        const right = Math.min(left + innerChunkPx, w);
        const width = Math.min(right - left, innerChunkPx);
        const top = innerChunkPx * row;
        const bottom = Math.min(top + innerChunkPx, h);
        const height = Math.min(bottom - top, innerChunkPx);

        const colxrow = `${col}x${row}`;
        const chunk: ImageSplitChunk = {
          file: this._outFile.replace(ImageSplit.REPLACE_WITH_COLxROW, colxrow),
          mask: this._outMask.replace(ImageSplit.REPLACE_WITH_COLxROW, colxrow),
          model: this._outModel.replace(
            ImageSplit.REPLACE_WITH_COLxROW,
            colxrow
          ),

          // "Inner" chunk image position and size [0:1] relative to src size values.
          uLeft: left / w,
          vTop: top / h,
          uWidth: width / w,
          vHeight: height / h,

          // UV gutter may vary if smaller than chunk size.
          uGutter: this._gutterPx / (width + this._gutterPx * 2),
          vGutter: this._gutterPx / (height + this._gutterPx * 2),
        };
        if (this._verbose) {
          console.log(
            `chunk <${col}x${row}>: +${left}+${top} [${width}x${height}] wh{${chunk.uWidth},${chunk.vHeight}}`
          );
        }

        chunks.push(chunk);
      }
    }

    return chunks;
  }

  private async _createChunk(chunk: ImageSplitChunk): Promise<void> {
    const extractAndPad = async (isMask: boolean, writeFile: string) => {
      if (this._verbose) {
        console.log(`extracting [${isMask ? "mask" : "file"}] "${writeFile}"`);
      }

      const img = sharp(isMask ? this._inMaskBuf : this._inFileBuf);
      const metadata = await img.metadata();
      const w: number = metadata.width ? metadata.width : -1;
      const h: number = metadata.height ? metadata.height : -1;
      if (w < 0 || h < 0) {
        throw new Error("bad metadata");
      }
      const extractParams = {
        left: Math.round(chunk.uLeft * w),
        top: Math.round(chunk.vTop * h),
        width: Math.round(chunk.uWidth * w),
        height: Math.round(chunk.vHeight * h),
      };
      const innerImgBuf = await img.extract(extractParams).png().toBuffer();

      const gutterPx = this._gutterPx / (isMask ? this._maskMultiplier : 1);
      const outW = extractParams.width + gutterPx * 2;
      const outH = extractParams.height + gutterPx * 2;

      if (this._verbose) {
        console.log(
          `padding [${isMask ? "mask" : "file"}] [${extractParams.width}x${
            extractParams.height
          }] => [${outW}x${outH}] (+${this._gutterPx} @ ${
            this._maskMultiplier
          })`
        );
      }

      const chunkImg = sharp({
        create: {
          width: outW,
          height: outH,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 255 }, //{ r: 1, g: 255, b: 31, alpha: 255 },
        },
      }).composite([
        // Top
        {
          input: innerImgBuf,
          left: gutterPx - 1,
          top: gutterPx - 1,
        },
        {
          input: innerImgBuf,
          left: gutterPx + 1,
          top: gutterPx - 1,
        },
        {
          input: innerImgBuf,
          left: gutterPx,
          top: gutterPx - 1,
        },
        // Mid
        {
          input: innerImgBuf,
          left: gutterPx - 1,
          top: gutterPx,
        },
        {
          input: innerImgBuf,
          left: gutterPx + 1,
          top: gutterPx,
        },
        // Bottom
        {
          input: innerImgBuf,
          left: gutterPx - 1,
          top: gutterPx + 1,
        },
        {
          input: innerImgBuf,
          left: gutterPx + 1,
          top: gutterPx + 1,
        },
        {
          input: innerImgBuf,
          left: gutterPx,
          top: gutterPx + 1,
        },
        // Center
        {
          input: innerImgBuf,
          left: gutterPx,
          top: gutterPx,
        },
      ]);

      fs.mkdirSync(path.dirname(writeFile), { recursive: true });
      await chunkImg.toFile(writeFile);
    };

    if (chunk.file.length > 0) {
      const filename = path.join("assets", "Textures", chunk.file);
      await extractAndPad(false, filename);
    }
    if (chunk.mask.length > 0) {
      const filename = path.join("assets", "Textures", chunk.mask);
      await extractAndPad(true, filename);
    }

    if (chunk.model.length > 0) {
      const filename = path.join("assets", "Models", chunk.model);
      if (this._verbose) {
        console.log(`writing model "${filename}"`);
      }
      const u0 = chunk.uGutter;
      const u1 = 1 - chunk.uGutter;
      const v0 = chunk.vGutter;
      const v1 = 1 - chunk.vGutter;
      const fixed = 10;
      const data = DATA_UNIT_CUBE.replace(/\$VT_U0/g, u0.toFixed(fixed))
        .replace(/\$VT_U1/g, u1.toFixed(fixed))
        .replace(/\$VT_V0/g, v0.toFixed(fixed))
        .replace(/\$VT_V1/g, v1.toFixed(fixed));

      fs.mkdirSync(path.dirname(filename), { recursive: true });
      fs.writeFileSync(filename, data);
    }
  }

  // ----------------------------------

  public async split(): Promise<ImageSplitChunk[]> {
    await this._loadBufs();
    await this._preshrink();
    const chunks: ImageSplitChunk[] = await this._getChunkPlan();
    for (const chunk of chunks) {
      await this._createChunk(chunk);
    }
    return chunks;
  }
}
