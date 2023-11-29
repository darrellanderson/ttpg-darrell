import * as fs from "fs-extra";
import * as path from "path";

import sharp, { Sharp } from "sharp"; // TypeScript workaround

export type MergeImageResult = {
  cols: number;
  rows: number;
  imgFileRelativeToAssetsTextures: string;
};

export class MergeImage {
  private _srcFilesRelativeToPrebuild: string[] | undefined;
  private _dstFileRelativeToAssetsTextures: string | undefined;

  private _chunkSize: number = 4096;
  private _preshrink: number = -1;
  private _verbose: boolean = true; // CAREFUL, CHUNKSIZE WILL BE INCREASED ~2%

  // ----------------------------------------------------

  constructor() {}

  setSrcFilesRelativeToPrebuild(values: string[]): MergeImage {
    this._srcFilesRelativeToPrebuild = values;
    return this;
  }

  setDstFileRelativeToAssetsTextures(value: string): MergeImage {
    this._dstFileRelativeToAssetsTextures = value;
    return this;
  }

  setChunkSize(value: number): MergeImage {
    if (value < 0 || value > 4096) {
      throw new Error(`value "${value}" out of range`);
    }
    this._chunkSize = value;
    return this;
  }

  setPreShrink(value: number): MergeImage {
    if (value < 0 || value === undefined) {
      throw new Error(`value "${value}" out of range`);
    }
    this._preshrink = value;
    return this;
  }

  setVerbose(value: boolean): MergeImage {
    this._verbose = value;
    return this;
  }

  // ----------------------------------------------------

  async merge(): Promise<MergeImageResult> {
    if (
      !this._srcFilesRelativeToPrebuild ||
      !this._dstFileRelativeToAssetsTextures
    ) {
      throw new Error("merge: not fully initialized");
    }

    // Load src images, apply preshrink.
    const origPixels = { w: -1, h: -1 }; // seed with first card loaded
    const cardPixels = { w: -1, h: -1 }; // seed with first card loaded APPLY PRESHINK
    const cardImages: sharp.Sharp[] = [];
    for (const srcFileRelativeToPrebuild of this._srcFilesRelativeToPrebuild) {
      // Compute input file name, store with card data.
      const srcFile = path.join(
        "prebuild",
        path.normalize(srcFileRelativeToPrebuild)
      );

      // Load file and metadata.
      if (!fs.existsSync(srcFile)) {
        throw new Error(`Missing "${srcFile}"`);
      }
      let cardImage = sharp(srcFile);
      const stats = await cardImage.metadata();
      if (!stats.width || !stats.height) {
        throw new Error(
          `sharp metadata missing width or height for "${srcFile}"`
        );
      }

      // Make sure all images same size.
      if (origPixels.w === -1) {
        origPixels.w = stats.width;
        origPixels.h = stats.height;
      } else if (
        origPixels.w !== stats.width ||
        origPixels.h !== stats.height
      ) {
        throw new Error(
          `card size mismatch (expect ${origPixels.w}x${origPixels.h}, got ${stats.width}x${stats.height}) for ${srcFile}`
        );
      }

      // Compute preshrink dimensions.
      if (cardPixels.w === -1) {
        const scaleW = Math.min(this._preshrink / stats.width, 1);
        const scaleH = Math.min(this._preshrink / stats.height, 1);
        const scale = this._preshrink > 0 ? Math.min(scaleW, scaleH) : 1;
        const w = Math.floor(stats.width * scale);
        const h = Math.floor(stats.height * scale);
        cardPixels.w = w;
        cardPixels.h = h;
      }

      // ALWAYS resize card, always deal with the same img type later.
      if (this._verbose) {
        console.log(
          `processing ${srcFile} (${origPixels.w}x${origPixels.h} => ${cardPixels.w}x${cardPixels.h} [${this._preshrink}])`
        );
      }
      cardImage = cardImage.resize(cardPixels.w, cardPixels.h, {
        fit: "fill",
      });
      cardImages.push(cardImage);
    }

    // Compute layout.
    const layout = {
      cols: -1,
      rows: -1,
      efficiency: -1,
    };
    const totalCardPixels = cardImages.length * cardPixels.w * cardPixels.h;
    const maxCols = Math.floor(this._chunkSize / cardPixels.w);
    const maxRows = Math.floor(this._chunkSize / cardPixels.h);
    const maxCards = maxCols * maxRows;
    if (cardImages.length > maxCards) {
      throw new Error(`too many cards (${cardImages.length}), max ${maxCards}`);
    }
    for (let numCols = 1; numCols <= maxCols; numCols += 1) {
      const numRows = Math.ceil(cardImages.length / numCols);
      if (numRows > maxRows) {
        continue; // too big, skip
      }
      if (numCols > cardImages.length) {
        continue; // too few cards, skip
      }
      const w = numCols * cardPixels.w;
      const h = numRows * cardPixels.h;
      const pow2w = Math.pow(2, Math.ceil(Math.log2(w)));
      const pow2h = Math.pow(2, Math.ceil(Math.log2(h)));
      const totalLayoutPixels = pow2w * pow2h;
      let efficiency = (totalCardPixels * 100) / totalLayoutPixels;

      // Favor square layouts when breaking ties.
      const tiebreaker = Math.abs(w - h) / 100000;
      efficiency -= tiebreaker;

      if (efficiency > layout.efficiency) {
        layout.cols = numCols;
        layout.rows = numRows;
        layout.efficiency = efficiency;
      }
      if (this._verbose) {
        console.log(
          `candidate ${numCols}x${numRows} [${w}x${h}] => [${pow2w}x${pow2h}px] (${efficiency.toFixed(
            5
          )}%)`
        );
      }
    }
    if (this._verbose) {
      console.log(
        `layout ${layout.cols}x${layout.rows} (${layout.efficiency.toFixed(
          1
        )}%)`
      );
    }

    // Merge images.
    const composite: object[] = [];
    for (let index = 0; index < cardImages.length; index++) {
      const cardImage = cardImages[index];
      const col = index % layout.cols;
      const row = Math.floor(index / layout.cols);
      composite.push({
        input: await cardImage.toBuffer(),
        top: row * cardPixels.h,
        left: col * cardPixels.w,
      });
    }
    const mergedImg = sharp({
      create: {
        width: layout.cols * cardPixels.w,
        height: layout.rows * cardPixels.h,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      },
    }).composite(composite);

    const dstFile = path.join(
      path.normalize("assets/Textures"),
      path.normalize(this._dstFileRelativeToAssetsTextures)
    );
    if (this._verbose) {
      console.log(`writing "${dstFile}"`);
    }
    const dir = path.dirname(dstFile);
    fs.mkdirsSync(dir);
    await mergedImg.toFile(dstFile);

    const result: MergeImageResult = {
      cols: layout.cols,
      rows: layout.rows,
      imgFileRelativeToAssetsTextures: this._dstFileRelativeToAssetsTextures,
    };
    return result;
  }
}
