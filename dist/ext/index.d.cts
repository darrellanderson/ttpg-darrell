import { z } from "zod";
//#region src/lib-ext/create-assets/abstract-create-assets/abstract-create-assets.d.ts
export declare abstract class AbstractCreateAssets {
  abstract toFileData(): Promise<{
    [key: string]: Buffer;
  }>;
  static cleanByFilePrefix(dir: string, filenamePrefix: string): Promise<void>;
  /**
   * Image buffers are PNG internally, re-encode as JPG if requested.
   *
   * @param filename
   * @param buffer
   * @returns
   */
  static encodeOutputBuffer(filename: string, buffer: Buffer): Promise<Buffer>;
  static writeOneFile(filename: string, buffer: Buffer): Promise<void>;
  writeFiles(): Promise<void>;
}
//#endregion
//#region src/lib-ext/create-assets/create-board/create-board-params.d.ts
export declare const CreateBoardParamsSchema: z.ZodObject<{
  rootDir: z.ZodOptional<z.ZodString>;
  assetFilename: z.ZodString;
  preshrink: z.ZodOptional<z.ZodNumber>;
  scriptName: z.ZodOptional<z.ZodString>;
  srcImage: z.ZodObject<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">>;
  srcMask: z.ZodOptional<z.ZodObject<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">>>;
  templateMetadata: z.ZodOptional<z.ZodString>;
  templateName: z.ZodString;
  topDownWorldSize: z.ZodObject<{
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    depth: z.ZodNumber;
    autoWidthHeight: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
  }, "strict", z.ZodTypeAny, {
    depth: number;
    width?: number | undefined;
    height?: number | undefined;
    autoWidthHeight?: {
      pixel: number;
      world: number;
    } | undefined;
  }, {
    depth: number;
    width?: number | undefined;
    height?: number | undefined;
    autoWidthHeight?: {
      pixel: number;
      world: number;
    } | undefined;
  }>;
}, "strict", z.ZodTypeAny, {
  assetFilename: string;
  srcImage: {
    type: string;
    scale?: {
      pixel: number;
      world: number;
    } | undefined;
    exports?: Record<string, string | number> | undefined;
    id?: string | undefined;
    cloneId?: string | undefined;
    snapPoints?: {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }[] | undefined;
  } & {
    [k: string]: unknown;
  };
  templateName: string;
  topDownWorldSize: {
    depth: number;
    width?: number | undefined;
    height?: number | undefined;
    autoWidthHeight?: {
      pixel: number;
      world: number;
    } | undefined;
  };
  rootDir?: string | undefined;
  preshrink?: number | undefined;
  scriptName?: string | undefined;
  srcMask?: z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough"> | undefined;
  templateMetadata?: string | undefined;
}, {
  assetFilename: string;
  srcImage: {
    type: string;
    scale?: {
      pixel: number;
      world: number;
    } | undefined;
    exports?: Record<string, string | number> | undefined;
    id?: string | undefined;
    cloneId?: string | undefined;
    snapPoints?: {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }[] | undefined;
  } & {
    [k: string]: unknown;
  };
  templateName: string;
  topDownWorldSize: {
    depth: number;
    width?: number | undefined;
    height?: number | undefined;
    autoWidthHeight?: {
      pixel: number;
      world: number;
    } | undefined;
  };
  rootDir?: string | undefined;
  preshrink?: number | undefined;
  scriptName?: string | undefined;
  srcMask?: z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough"> | undefined;
  templateMetadata?: string | undefined;
}>;
export type CreateBoardParams = z.infer<typeof CreateBoardParamsSchema>;
//#endregion
//#region src/lib-ext/image/image-split/image-split.d.ts
export type ImageSplitChunk = {
  col: number;
  row: number;
  buffer: Buffer;
  px: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  uv: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};
export declare class ImageSplit {
  private readonly _srcBuffer;
  private readonly _chunkSize;
  constructor(srcBuffer: Buffer, chunkSize: number);
  private _getChunk;
  split(): Promise<Array<ImageSplitChunk>>;
}
//#endregion
//#region src/lib-ext/create-assets/create-board/create-board.d.ts
/**
 * Create assets for a (potentially large) board.
 *
 * assets/Textures:
 * - Split large board image into GPU friendly chunks.
 * - Bleed edges for UV gutters.
 *
 * assets/Models:
 * - Shared 1x1 cube with UV bleed gutters on top face.
 *
 * assets/Templates:
 * - Template with sub-meshes for each image chunk.
 */
export declare class CreateBoard extends AbstractCreateAssets {
  private static readonly INSET_SIZE;
  private readonly _params;
  private _srcImageCell;
  private _srcMaskCell;
  static fromParamsJson(paramsJson: Buffer): CreateBoard;
  constructor(params: CreateBoardParams);
  clean(): Promise<void>;
  _splitImage(bufferPromise: Promise<Buffer>): Promise<Array<ImageSplitChunk>>;
  toFileData(): Promise<{
    [key: string]: Buffer;
  }>;
}
//#endregion
//#region src/lib-ext/create-assets/create-cardsheets/create-cardsheet-params.d.ts
export declare const CardsheetCardSchema: z.ZodObject<{
  face: z.ZodUnion<[z.ZodString, z.ZodObject<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">>]>;
  back: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">>]>>;
  name: z.ZodOptional<z.ZodString>;
  metadata: z.ZodOptional<z.ZodString>;
  tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strict", z.ZodTypeAny, {
  face: (string | z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">) & (string | z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough"> | undefined);
  back?: string | z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough"> | undefined;
  name?: string | undefined;
  metadata?: string | undefined;
  tags?: string[] | undefined;
}, {
  face: (string | z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">) & (string | z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough"> | undefined);
  back?: string | z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough"> | undefined;
  name?: string | undefined;
  metadata?: string | undefined;
  tags?: string[] | undefined;
}>;
export type CardsheetCardType = z.infer<typeof CardsheetCardSchema>;
export declare const CreateCardsheetParamsSchema: z.ZodObject<{
  rootDir: z.ZodOptional<z.ZodString>;
  assetFilename: z.ZodString;
  templateName: z.ZodString;
  deckMetadata: z.ZodOptional<z.ZodString>;
  cardSizePixel: z.ZodObject<{
    width: z.ZodNumber;
    height: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    width: number;
    height: number;
  }, {
    width: number;
    height: number;
  }>;
  cardSizeWorld: z.ZodObject<{
    width: z.ZodNumber;
    height: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    width: number;
    height: number;
  }, {
    width: number;
    height: number;
  }>;
  applyAllInputDir: z.ZodOptional<z.ZodString>;
  applyAllTags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
  cards: z.ZodArray<z.ZodObject<{
    face: z.ZodUnion<[z.ZodString, z.ZodObject<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">>]>;
    back: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">>]>>;
    name: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
  }, "strict", z.ZodTypeAny, {
    face: (string | z.objectOutputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">) & (string | z.objectOutputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined);
    back?: string | z.objectOutputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    name?: string | undefined;
    metadata?: string | undefined;
    tags?: string[] | undefined;
  }, {
    face: (string | z.objectInputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">) & (string | z.objectInputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined);
    back?: string | z.objectInputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    name?: string | undefined;
    metadata?: string | undefined;
    tags?: string[] | undefined;
  }>, "many">;
  back: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">>]>>;
}, "strict", z.ZodTypeAny, {
  assetFilename: string;
  templateName: string;
  cardSizePixel: {
    width: number;
    height: number;
  };
  cardSizeWorld: {
    width: number;
    height: number;
  };
  cards: {
    face: (string | z.objectOutputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">) & (string | z.objectOutputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined);
    back?: string | z.objectOutputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    name?: string | undefined;
    metadata?: string | undefined;
    tags?: string[] | undefined;
  }[];
  rootDir?: string | undefined;
  deckMetadata?: string | undefined;
  applyAllInputDir?: string | undefined;
  applyAllTags?: string[] | undefined;
  back?: string | z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough"> | undefined;
}, {
  assetFilename: string;
  templateName: string;
  cardSizePixel: {
    width: number;
    height: number;
  };
  cardSizeWorld: {
    width: number;
    height: number;
  };
  cards: {
    face: (string | z.objectInputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">) & (string | z.objectInputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined);
    back?: string | z.objectInputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    name?: string | undefined;
    metadata?: string | undefined;
    tags?: string[] | undefined;
  }[];
  rootDir?: string | undefined;
  deckMetadata?: string | undefined;
  applyAllInputDir?: string | undefined;
  applyAllTags?: string[] | undefined;
  back?: string | z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough"> | undefined;
}>;
export type CreateCardsheetParams = z.infer<typeof CreateCardsheetParamsSchema>;
//#endregion
//#region src/lib-ext/create-assets/create-cardsheets/create-cardsheet.d.ts
export declare class CreateCardsheet extends AbstractCreateAssets {
  private readonly _params;
  private readonly _sheetPlan;
  private readonly _sharedBackFilenameRelativeToAssets;
  private readonly _fileData;
  static fromParamsJson(paramsJson: Buffer): CreateCardsheet;
  constructor(params: CreateCardsheetParams);
  clean(): Promise<void>;
  /**
   * Create a single cell from image data (either a filename, or a ZCell schema).
   *
   * @param imageData
   * @returns
   */
  private _getCardCell;
  /**
   * Create (with potential resize) card cells.
   * It is better to use cells than PNG Buffer because we can leverage
   * GridCell to merge them into cardsheets later.
   *
   * @param cardSide
   * @returns
   */
  private _getCardCells;
  /**
   * Organize cards into one or more sheets (possible overflow due to size limits).
   *
   * @returns
   */
  private _getSheetPlan;
  toFileData(): Promise<{
    [key: string]: Buffer;
  }>;
  /**
   * Generage the cardsheet image(s) for a single cardsheet, always face and
   * optionally back if using a different image for each card back (shared
   * back is created via a different path).
   *
   * If the sheet is split up, this just generates one entry.
   *
   * @param sheetPlan
   * @param cardSide
   * @returns
   */
  private _createCardSheet;
  /**
   * If using a shared back (single card), create it.
   *
   * @returns
   */
  private _createSharedBack;
  /**
   * Generate the template for a single cardsheet.
   *
   * If the sheet is split up, this just generates one entry.
   *
   * @param sheetPlan
   */
  private _createDeckTemplate;
}
//#endregion
//#region src/lib-ext/create-assets/create-d6/create-d6-params.d.ts
export declare const CreateD6ParamsSchema: z.ZodObject<{
  rootDir: z.ZodOptional<z.ZodString>;
  assetFilename: z.ZodString;
  faceSizePixel: z.ZodObject<{
    width: z.ZodNumber;
    height: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    width: number;
    height: number;
  }, {
    width: number;
    height: number;
  }>;
  tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
  templateName: z.ZodString;
  templateMetadata: z.ZodOptional<z.ZodString>;
  faces: z.ZodArray<z.ZodObject<{
    image: z.ZodUnion<[z.ZodString, z.ZodObject<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">>]>;
    name: z.ZodOptional<z.ZodString>;
    metadata: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>]>;
  }, "strict", z.ZodTypeAny, {
    image: (string | z.objectOutputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">) & (string | z.objectOutputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined);
    name?: string | undefined;
    metadata?: string | z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
  }, {
    image: (string | z.objectInputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">) & (string | z.objectInputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined);
    name?: string | undefined;
    metadata?: string | z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
  }>, "many">;
}, "strict", z.ZodTypeAny, {
  assetFilename: string;
  templateName: string;
  faceSizePixel: {
    width: number;
    height: number;
  };
  faces: {
    image: (string | z.objectOutputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">) & (string | z.objectOutputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined);
    name?: string | undefined;
    metadata?: string | z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
  }[];
  rootDir?: string | undefined;
  tags?: string[] | undefined;
  templateMetadata?: string | undefined;
}, {
  assetFilename: string;
  templateName: string;
  faceSizePixel: {
    width: number;
    height: number;
  };
  faces: {
    image: (string | z.objectInputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">) & (string | z.objectInputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined);
    name?: string | undefined;
    metadata?: string | z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
  }[];
  rootDir?: string | undefined;
  tags?: string[] | undefined;
  templateMetadata?: string | undefined;
}>;
export type CreateD6Params = z.infer<typeof CreateD6ParamsSchema>;
//#endregion
//#region src/lib-ext/create-assets/create-d6/create-d6.d.ts
export declare class CreateD6 extends AbstractCreateAssets {
  private readonly _params;
  static fromParamsJson(paramsJson: Buffer): CreateD6;
  constructor(params: CreateD6Params);
  clean(): Promise<void>;
  _createD6Image(): Promise<Buffer>;
  toFileData(): Promise<{
    [key: string]: Buffer;
  }>;
}
//#endregion
//#region src/lib-ext/image/cell/abstract-cell/abstract-cell.d.ts
export type CellSize = {
  width: number;
  height: number;
};
export type CellPosition = {
  left: number;
  top: number;
};
export type UVPosition = {
  u: number;
  v: number;
};
export type CellChild = {
  child: AbstractCell;
  left: number;
  top: number;
};
export type CellSnapPoint = {
  tags?: Array<string>;
  left?: number;
  top?: number;
  rotation?: number;
  range?: number;
};
/**
 * Create images from one or more cells.
 *
 * Fix size in the constructor, do not resize cells afterward!
 *
 * Cells may not be shared, they can have one one parent.
 */
export declare abstract class AbstractCell {
  private readonly _width;
  private readonly _height;
  private readonly _children;
  private readonly _snapPoints;
  private _parent;
  private _localPosition;
  /**
   * Calculate the max width and height of cells.
   *
   * @param cells
   * @returns
   */
  static getMaxSize(cells: Array<AbstractCell>): CellSize;
  /**
   * Constructor.
   *
   * Require children at constructor time, getSize does not change
   * so we can do layout now.
   *
   * @param children
   */
  constructor(width: number, height: number, children?: Array<CellChild>);
  addSnapPoint(snapPoint: CellSnapPoint): this;
  /**
   * Get the UV [0:1] coordinates of the center of this cell
   * with respect to the root cell size.
   *
   * @returns
   */
  getCenterUV(): UVPosition;
  /**
   * Get children.
   *
   * @returns
   */
  getChildren(): Array<AbstractCell>;
  /**
   * Get position relative to the direct parent cell.
   *
   * @returns
   */
  getLocalPosition(): CellPosition;
  /**
   * Get position relative to the root cell, potentially several
   * cells outward.
   *
   * @returns
   */
  getGlobalPosition(): CellPosition;
  /**
   * Get all snap points, rewrite to global positions.
   *
   * @returns
   */
  getSnapPoints(): Array<CellSnapPoint>;
  /**
   * Get (immutable) cell size.
   *
   * @returns
   */
  getSize(): CellSize;
  /**
   * Render cell to PNG image.
   */
  abstract toBuffer(): Promise<Buffer>;
  /**
   * For cell group styles, render children in order.
   *
   * @returns
   */
  protected _renderChildren(): Promise<Buffer>;
}
//#endregion
//#region src/lib-ext/image/cell/bleed-cell/bleed-cell.d.ts
/**
 * Wrap a cell in a bleed-size frame, copy edge pixels from the cell
 * to the edge of the larger bleed-cell.
 */
export declare class BleedCell extends AbstractCell {
  private readonly _innerCell;
  private readonly _bleedLeftRight;
  private readonly _bleedTopBottom;
  constructor(innerCell: AbstractCell, bleedLeftRight: number, bleedTopBottom: number);
  private _extractAndStretch;
  toBuffer(): Promise<Buffer>;
}
//#endregion
//#region src/lib-ext/image/cell/buffer-cell/buffer-cell.d.ts
export declare class BufferCell extends AbstractCell {
  private readonly _buffer;
  constructor(width: number, height: number, buffer: Buffer);
  toBuffer(): Promise<Buffer>;
}
//#endregion
//#region src/lib-ext/image/cell/canvas-cell/canvas-cell.d.ts
export declare class CanvasCell extends AbstractCell {
  constructor(width: number, height: number, children: Array<CellChild>);
  toBuffer(): Promise<Buffer>;
}
//#endregion
//#region src/lib-ext/image/cell/cell-parser/cell-parser.d.ts
export declare class CellParser {
  private readonly _rootDir;
  private readonly _exports;
  private readonly _idToJson;
  private _scale;
  constructor(rootDir?: string);
  setScale(scale: number): this;
  parse(jsonObject: object): AbstractCell;
}
//#endregion
//#region src/lib-ext/image/cell/cell-parser/cell-schema.d.ts
export declare const ZBaseCellSchema: z.ZodObject<{
  type: z.ZodString;
  scale: z.ZodOptional<z.ZodObject<{
    pixel: z.ZodNumber;
    world: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    pixel: number;
    world: number;
  }, {
    pixel: number;
    world: number;
  }>>;
  exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
  id: z.ZodOptional<z.ZodString>;
  cloneId: z.ZodOptional<z.ZodString>;
  snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    left: z.ZodOptional<z.ZodNumber>;
    top: z.ZodOptional<z.ZodNumber>;
    rotation: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodNumber>;
    createCountToPrev: z.ZodOptional<z.ZodNumber>;
  }, "strict", z.ZodTypeAny, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }>, "many">>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
  type: z.ZodString;
  scale: z.ZodOptional<z.ZodObject<{
    pixel: z.ZodNumber;
    world: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    pixel: number;
    world: number;
  }, {
    pixel: number;
    world: number;
  }>>;
  exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
  id: z.ZodOptional<z.ZodString>;
  cloneId: z.ZodOptional<z.ZodString>;
  snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    left: z.ZodOptional<z.ZodNumber>;
    top: z.ZodOptional<z.ZodNumber>;
    rotation: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodNumber>;
    createCountToPrev: z.ZodOptional<z.ZodNumber>;
  }, "strict", z.ZodTypeAny, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }>, "many">>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
  type: z.ZodString;
  scale: z.ZodOptional<z.ZodObject<{
    pixel: z.ZodNumber;
    world: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    pixel: number;
    world: number;
  }, {
    pixel: number;
    world: number;
  }>>;
  exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
  id: z.ZodOptional<z.ZodString>;
  cloneId: z.ZodOptional<z.ZodString>;
  snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    left: z.ZodOptional<z.ZodNumber>;
    top: z.ZodOptional<z.ZodNumber>;
    rotation: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodNumber>;
    createCountToPrev: z.ZodOptional<z.ZodNumber>;
  }, "strict", z.ZodTypeAny, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }>, "many">>;
}, z.ZodTypeAny, "passthrough">>;
export type ZBaseCell = z.infer<typeof ZBaseCellSchema>;
export declare const ZBleedCellSchema: z.ZodObject<{
  scale: z.ZodOptional<z.ZodObject<{
    pixel: z.ZodNumber;
    world: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    pixel: number;
    world: number;
  }, {
    pixel: number;
    world: number;
  }>>;
  exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
  id: z.ZodOptional<z.ZodString>;
  cloneId: z.ZodOptional<z.ZodString>;
  snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    left: z.ZodOptional<z.ZodNumber>;
    top: z.ZodOptional<z.ZodNumber>;
    rotation: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodNumber>;
    createCountToPrev: z.ZodOptional<z.ZodNumber>;
  }, "strict", z.ZodTypeAny, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }>, "many">>;
  type: z.ZodLiteral<"BleedCell">;
  child: z.ZodObject<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">>;
  leftRight: z.ZodNumber;
  topBottom: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
  type: "BleedCell";
  child: {
    type: string;
    scale?: {
      pixel: number;
      world: number;
    } | undefined;
    exports?: Record<string, string | number> | undefined;
    id?: string | undefined;
    cloneId?: string | undefined;
    snapPoints?: {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }[] | undefined;
  } & {
    [k: string]: unknown;
  };
  leftRight: number;
  topBottom: number;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}, {
  type: "BleedCell";
  child: {
    type: string;
    scale?: {
      pixel: number;
      world: number;
    } | undefined;
    exports?: Record<string, string | number> | undefined;
    id?: string | undefined;
    cloneId?: string | undefined;
    snapPoints?: {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }[] | undefined;
  } & {
    [k: string]: unknown;
  };
  leftRight: number;
  topBottom: number;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}>;
export type ZBleedCell = z.infer<typeof ZBleedCellSchema>;
export declare const ZBufferCellSchema: z.ZodObject<{
  scale: z.ZodOptional<z.ZodObject<{
    pixel: z.ZodNumber;
    world: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    pixel: number;
    world: number;
  }, {
    pixel: number;
    world: number;
  }>>;
  exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
  id: z.ZodOptional<z.ZodString>;
  cloneId: z.ZodOptional<z.ZodString>;
  snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    left: z.ZodOptional<z.ZodNumber>;
    top: z.ZodOptional<z.ZodNumber>;
    rotation: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodNumber>;
    createCountToPrev: z.ZodOptional<z.ZodNumber>;
  }, "strict", z.ZodTypeAny, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }>, "many">>;
  type: z.ZodLiteral<"BufferCell">;
  width: z.ZodNumber;
  height: z.ZodNumber;
  bufferData: z.ZodString;
}, "strict", z.ZodTypeAny, {
  type: "BufferCell";
  width: number;
  height: number;
  bufferData: string;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}, {
  type: "BufferCell";
  width: number;
  height: number;
  bufferData: string;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}>;
export type ZBufferCell = z.infer<typeof ZBufferCellSchema>;
export declare const ZCanvasCellSchema: z.ZodObject<{
  scale: z.ZodOptional<z.ZodObject<{
    pixel: z.ZodNumber;
    world: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    pixel: number;
    world: number;
  }, {
    pixel: number;
    world: number;
  }>>;
  exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
  id: z.ZodOptional<z.ZodString>;
  cloneId: z.ZodOptional<z.ZodString>;
  snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    left: z.ZodOptional<z.ZodNumber>;
    top: z.ZodOptional<z.ZodNumber>;
    rotation: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodNumber>;
    createCountToPrev: z.ZodOptional<z.ZodNumber>;
  }, "strict", z.ZodTypeAny, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }>, "many">>;
  type: z.ZodLiteral<"CanvasCell">;
  width: z.ZodNumber;
  height: z.ZodNumber;
  children: z.ZodArray<z.ZodObject<{
    left: z.ZodNumber;
    top: z.ZodNumber;
    child: z.ZodObject<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
      type: z.ZodString;
      scale: z.ZodOptional<z.ZodObject<{
        pixel: z.ZodNumber;
        world: z.ZodNumber;
      }, "strict", z.ZodTypeAny, {
        pixel: number;
        world: number;
      }, {
        pixel: number;
        world: number;
      }>>;
      exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
      id: z.ZodOptional<z.ZodString>;
      cloneId: z.ZodOptional<z.ZodString>;
      snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        left: z.ZodOptional<z.ZodNumber>;
        top: z.ZodOptional<z.ZodNumber>;
        rotation: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodNumber>;
        createCountToPrev: z.ZodOptional<z.ZodNumber>;
      }, "strict", z.ZodTypeAny, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }, {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }>, "many">>;
    }, z.ZodTypeAny, "passthrough">>;
  }, "strict", z.ZodTypeAny, {
    left: number;
    top: number;
    child: {
      type: string;
      scale?: {
        pixel: number;
        world: number;
      } | undefined;
      exports?: Record<string, string | number> | undefined;
      id?: string | undefined;
      cloneId?: string | undefined;
      snapPoints?: {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }[] | undefined;
    } & {
      [k: string]: unknown;
    };
  }, {
    left: number;
    top: number;
    child: {
      type: string;
      scale?: {
        pixel: number;
        world: number;
      } | undefined;
      exports?: Record<string, string | number> | undefined;
      id?: string | undefined;
      cloneId?: string | undefined;
      snapPoints?: {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }[] | undefined;
    } & {
      [k: string]: unknown;
    };
  }>, "many">;
}, "strict", z.ZodTypeAny, {
  type: "CanvasCell";
  width: number;
  height: number;
  children: {
    left: number;
    top: number;
    child: {
      type: string;
      scale?: {
        pixel: number;
        world: number;
      } | undefined;
      exports?: Record<string, string | number> | undefined;
      id?: string | undefined;
      cloneId?: string | undefined;
      snapPoints?: {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }[] | undefined;
    } & {
      [k: string]: unknown;
    };
  }[];
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}, {
  type: "CanvasCell";
  width: number;
  height: number;
  children: {
    left: number;
    top: number;
    child: {
      type: string;
      scale?: {
        pixel: number;
        world: number;
      } | undefined;
      exports?: Record<string, string | number> | undefined;
      id?: string | undefined;
      cloneId?: string | undefined;
      snapPoints?: {
        tags?: string[] | undefined;
        left?: number | undefined;
        top?: number | undefined;
        rotation?: number | undefined;
        range?: number | undefined;
        createCountToPrev?: number | undefined;
      }[] | undefined;
    } & {
      [k: string]: unknown;
    };
  }[];
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}>;
export type ZCanvasCell = z.infer<typeof ZCanvasCellSchema>;
export declare const ZColCellSchema: z.ZodObject<{
  scale: z.ZodOptional<z.ZodObject<{
    pixel: z.ZodNumber;
    world: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    pixel: number;
    world: number;
  }, {
    pixel: number;
    world: number;
  }>>;
  exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
  id: z.ZodOptional<z.ZodString>;
  cloneId: z.ZodOptional<z.ZodString>;
  snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    left: z.ZodOptional<z.ZodNumber>;
    top: z.ZodOptional<z.ZodNumber>;
    rotation: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodNumber>;
    createCountToPrev: z.ZodOptional<z.ZodNumber>;
  }, "strict", z.ZodTypeAny, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }>, "many">>;
  type: z.ZodLiteral<"ColCell">;
  children: z.ZodArray<z.ZodObject<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">>, "many">;
  spacing: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
  type: "ColCell";
  children: z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">[];
  spacing: number;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}, {
  type: "ColCell";
  children: z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">[];
  spacing: number;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}>;
export type ZColCell = z.infer<typeof ZColCellSchema>;
export declare const ZGridCellSchema: z.ZodObject<{
  scale: z.ZodOptional<z.ZodObject<{
    pixel: z.ZodNumber;
    world: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    pixel: number;
    world: number;
  }, {
    pixel: number;
    world: number;
  }>>;
  exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
  id: z.ZodOptional<z.ZodString>;
  cloneId: z.ZodOptional<z.ZodString>;
  snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    left: z.ZodOptional<z.ZodNumber>;
    top: z.ZodOptional<z.ZodNumber>;
    rotation: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodNumber>;
    createCountToPrev: z.ZodOptional<z.ZodNumber>;
  }, "strict", z.ZodTypeAny, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }>, "many">>;
  type: z.ZodLiteral<"GridCell">;
  children: z.ZodArray<z.ZodObject<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">>, "many">;
  numCols: z.ZodNumber;
  spacing: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
  type: "GridCell";
  children: z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">[];
  spacing: number;
  numCols: number;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}, {
  type: "GridCell";
  children: z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">[];
  spacing: number;
  numCols: number;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}>;
export type ZGridCell = z.infer<typeof ZGridCellSchema>;
export declare const ZImageCellSchema: z.ZodObject<{
  scale: z.ZodOptional<z.ZodObject<{
    pixel: z.ZodNumber;
    world: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    pixel: number;
    world: number;
  }, {
    pixel: number;
    world: number;
  }>>;
  exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
  id: z.ZodOptional<z.ZodString>;
  cloneId: z.ZodOptional<z.ZodString>;
  snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    left: z.ZodOptional<z.ZodNumber>;
    top: z.ZodOptional<z.ZodNumber>;
    rotation: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodNumber>;
    createCountToPrev: z.ZodOptional<z.ZodNumber>;
  }, "strict", z.ZodTypeAny, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }>, "many">>;
  type: z.ZodLiteral<"ImageCell">;
  width: z.ZodNumber;
  height: z.ZodNumber;
  imageFile: z.ZodString;
  alpha: z.ZodOptional<z.ZodNumber>;
  grayscale: z.ZodOptional<z.ZodBoolean>;
  tint: z.ZodOptional<z.ZodString>;
  invert: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
  type: "ImageCell";
  width: number;
  height: number;
  imageFile: string;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
  alpha?: number | undefined;
  grayscale?: boolean | undefined;
  tint?: string | undefined;
  invert?: boolean | undefined;
}, {
  type: "ImageCell";
  width: number;
  height: number;
  imageFile: string;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
  alpha?: number | undefined;
  grayscale?: boolean | undefined;
  tint?: string | undefined;
  invert?: boolean | undefined;
}>;
export type ZImageCell = z.infer<typeof ZImageCellSchema>;
export declare const ZPaddedCellSchema: z.ZodObject<{
  scale: z.ZodOptional<z.ZodObject<{
    pixel: z.ZodNumber;
    world: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    pixel: number;
    world: number;
  }, {
    pixel: number;
    world: number;
  }>>;
  exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
  id: z.ZodOptional<z.ZodString>;
  cloneId: z.ZodOptional<z.ZodString>;
  snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    left: z.ZodOptional<z.ZodNumber>;
    top: z.ZodOptional<z.ZodNumber>;
    rotation: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodNumber>;
    createCountToPrev: z.ZodOptional<z.ZodNumber>;
  }, "strict", z.ZodTypeAny, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }>, "many">>;
  type: z.ZodLiteral<"PaddedCell">;
  child: z.ZodObject<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">>;
  padding: z.ZodNumber;
  background: z.ZodString;
}, "strict", z.ZodTypeAny, {
  type: "PaddedCell";
  child: {
    type: string;
    scale?: {
      pixel: number;
      world: number;
    } | undefined;
    exports?: Record<string, string | number> | undefined;
    id?: string | undefined;
    cloneId?: string | undefined;
    snapPoints?: {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }[] | undefined;
  } & {
    [k: string]: unknown;
  };
  padding: number;
  background: string;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}, {
  type: "PaddedCell";
  child: {
    type: string;
    scale?: {
      pixel: number;
      world: number;
    } | undefined;
    exports?: Record<string, string | number> | undefined;
    id?: string | undefined;
    cloneId?: string | undefined;
    snapPoints?: {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }[] | undefined;
  } & {
    [k: string]: unknown;
  };
  padding: number;
  background: string;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}>;
export type ZPaddedCell = z.infer<typeof ZPaddedCellSchema>;
export declare const ZRowCellSchema: z.ZodObject<{
  scale: z.ZodOptional<z.ZodObject<{
    pixel: z.ZodNumber;
    world: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    pixel: number;
    world: number;
  }, {
    pixel: number;
    world: number;
  }>>;
  exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
  id: z.ZodOptional<z.ZodString>;
  cloneId: z.ZodOptional<z.ZodString>;
  snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    left: z.ZodOptional<z.ZodNumber>;
    top: z.ZodOptional<z.ZodNumber>;
    rotation: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodNumber>;
    createCountToPrev: z.ZodOptional<z.ZodNumber>;
  }, "strict", z.ZodTypeAny, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }>, "many">>;
  type: z.ZodLiteral<"RowCell">;
  children: z.ZodArray<z.ZodObject<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">>, "many">;
  spacing: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
  type: "RowCell";
  children: z.objectOutputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">[];
  spacing: number;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}, {
  type: "RowCell";
  children: z.objectInputType<{
    type: z.ZodString;
    scale: z.ZodOptional<z.ZodObject<{
      pixel: z.ZodNumber;
      world: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
      pixel: number;
      world: number;
    }, {
      pixel: number;
      world: number;
    }>>;
    exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    id: z.ZodOptional<z.ZodString>;
    cloneId: z.ZodOptional<z.ZodString>;
    snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
      tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
      left: z.ZodOptional<z.ZodNumber>;
      top: z.ZodOptional<z.ZodNumber>;
      rotation: z.ZodOptional<z.ZodNumber>;
      range: z.ZodOptional<z.ZodNumber>;
      createCountToPrev: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }, {
      tags?: string[] | undefined;
      left?: number | undefined;
      top?: number | undefined;
      rotation?: number | undefined;
      range?: number | undefined;
      createCountToPrev?: number | undefined;
    }>, "many">>;
  }, z.ZodTypeAny, "passthrough">[];
  spacing: number;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}>;
export type ZRowCell = z.infer<typeof ZRowCellSchema>;
export declare const ZSolidCellSchema: z.ZodObject<{
  scale: z.ZodOptional<z.ZodObject<{
    pixel: z.ZodNumber;
    world: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    pixel: number;
    world: number;
  }, {
    pixel: number;
    world: number;
  }>>;
  exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
  id: z.ZodOptional<z.ZodString>;
  cloneId: z.ZodOptional<z.ZodString>;
  snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    left: z.ZodOptional<z.ZodNumber>;
    top: z.ZodOptional<z.ZodNumber>;
    rotation: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodNumber>;
    createCountToPrev: z.ZodOptional<z.ZodNumber>;
  }, "strict", z.ZodTypeAny, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }>, "many">>;
  type: z.ZodLiteral<"SolidCell">;
  width: z.ZodNumber;
  height: z.ZodNumber;
  color: z.ZodString;
}, "strict", z.ZodTypeAny, {
  type: "SolidCell";
  width: number;
  height: number;
  color: string;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}, {
  type: "SolidCell";
  width: number;
  height: number;
  color: string;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
}>;
export type ZSolidCell = z.infer<typeof ZSolidCellSchema>;
export declare const ZTextCellSchema: z.ZodObject<{
  scale: z.ZodOptional<z.ZodObject<{
    pixel: z.ZodNumber;
    world: z.ZodNumber;
  }, "strict", z.ZodTypeAny, {
    pixel: number;
    world: number;
  }, {
    pixel: number;
    world: number;
  }>>;
  exports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
  id: z.ZodOptional<z.ZodString>;
  cloneId: z.ZodOptional<z.ZodString>;
  snapPoints: z.ZodOptional<z.ZodArray<z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    left: z.ZodOptional<z.ZodNumber>;
    top: z.ZodOptional<z.ZodNumber>;
    rotation: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodNumber>;
    createCountToPrev: z.ZodOptional<z.ZodNumber>;
  }, "strict", z.ZodTypeAny, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }, {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }>, "many">>;
  type: z.ZodLiteral<"TextCell">;
  width: z.ZodNumber;
  height: z.ZodNumber;
  text: z.ZodString;
  textColor: z.ZodOptional<z.ZodString>;
  font: z.ZodOptional<z.ZodString>;
  fontSize: z.ZodOptional<z.ZodNumber>;
  fontStyle: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
  type: "TextCell";
  width: number;
  height: number;
  text: string;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
  textColor?: string | undefined;
  font?: string | undefined;
  fontSize?: number | undefined;
  fontStyle?: string | undefined;
}, {
  type: "TextCell";
  width: number;
  height: number;
  text: string;
  scale?: {
    pixel: number;
    world: number;
  } | undefined;
  exports?: Record<string, string | number> | undefined;
  id?: string | undefined;
  cloneId?: string | undefined;
  snapPoints?: {
    tags?: string[] | undefined;
    left?: number | undefined;
    top?: number | undefined;
    rotation?: number | undefined;
    range?: number | undefined;
    createCountToPrev?: number | undefined;
  }[] | undefined;
  textColor?: string | undefined;
  font?: string | undefined;
  fontSize?: number | undefined;
  fontStyle?: string | undefined;
}>;
export type ZTextCell = z.infer<typeof ZTextCellSchema>;
//#endregion
//#region src/lib-ext/image/cell/col-cell/col-cell.d.ts
/**
 * Layout cells in a column.
 */
export declare class ColCell extends AbstractCell {
  constructor(children: Array<AbstractCell>, spacing?: number);
  toBuffer(): Promise<Buffer>;
}
//#endregion
//#region src/lib-ext/image/cell/grid-cell/grid-cell.d.ts
/**
 * Layout cells in a grid (potentially for cardsheets).
 */
export declare class GridCell extends AbstractCell {
  static readonly MAX_DIMENSION = 4096;
  static getMaxCellCount(cellSize: CellSize): number;
  /**
   * Most GPUs reserve power-of-2 dimensions.  Compute the
   * row/col layout with the fewest wasted pixels.
   *
   * @param cellCount
   * @param cellSize
   * @returns
   */
  static getOptimalLayout(cellCount: number, cellSize: CellSize): {
    cols: number;
    rows: number;
  };
  constructor(cells: Array<AbstractCell>, numCols: number, spacing?: number);
  toBuffer(): Promise<Buffer>;
}
//#endregion
//#region src/lib-ext/image/cell/image-cell/image-cell.d.ts
/**
 * Load an image from a file.
 */
export declare class ImageCell extends AbstractCell {
  private readonly _imageFile;
  private _alpha;
  private _grayscale;
  private _tint;
  private _invert;
  static from(imageFile: string): Promise<ImageCell>;
  constructor(width: number, height: number, imageFile: string);
  setAlpha(value: number): this;
  setGrayscale(value: boolean): this;
  setInvert(value: boolean): this;
  setTint(value: string): this;
  toBuffer(): Promise<Buffer>;
}
//#endregion
//#region src/lib-ext/image/cell/padded-cell/padded-cell.d.ts
export declare class PaddedCell extends AbstractCell {
  private readonly _background;
  constructor(child: AbstractCell, padding: number);
  setColor(color: string): this;
  toBuffer(): Promise<Buffer>;
}
//#endregion
//#region src/lib-ext/image/cell/resize-cell/resize-cell.d.ts
/**
 * Wrap another cell, resizing it to the given dimensions.
 */
export declare class ResizeCell extends AbstractCell {
  private readonly _innerCell;
  constructor(width: number, height: number, cell: AbstractCell);
  toBuffer(): Promise<Buffer>;
}
//#endregion
//#region src/lib-ext/image/cell/row-cell/row-cell.d.ts
/**
 * Layout cells in a row.
 */
export declare class RowCell extends AbstractCell {
  constructor(children: Array<AbstractCell>, spacing?: number);
  toBuffer(): Promise<Buffer>;
}
//#endregion
//#region src/lib-ext/image/cell/solid-cell/solid-cell.d.ts
export declare class SolidCell extends AbstractCell {
  private _backgroundColor;
  constructor(width: number, height: number, color: string);
  setColor(color: string): this;
  toBuffer(): Promise<Buffer>;
}
//#endregion
//#region src/lib-ext/image/cell/text-cell/text-cell.d.ts
/**
 * Center text in a cell.
 *
 * Supports custom fonts, which must be installed on the system.
 */
export declare class TextCell extends AbstractCell {
  private readonly _text;
  private _font;
  private _fontStyle;
  private _fontSize;
  private _textColor;
  constructor(width: number, height: number, text: string);
  setTextColor(color: string): this;
  setFont(font: string): this;
  setFontSize(fontSize: number): this;
  setFontStyle(fontStyle: string): this;
  toBuffer(): Promise<Buffer>;
}
//#endregion
//#region src/lib-ext/model/abstract-model/abstract-model.d.ts
export type OffsetAndSize = {
  left: number;
  top: number;
  width: number;
  height: number;
};
export type ObjVertexForFace = `${number}/${number | ""}/${number | ""}`;
export declare abstract class AbstractModel {
  /**
   * Given a size, calculate the inset bounds for the UV mapped space.
   *
   * @param width
   * @param height
   * @returns
   */
  static getInsetForUVs(width: number, height: number): OffsetAndSize;
  /**
   * Given a size, calculate the outset bounds after applying UV gutters.
   */
  static getOutsetForUVs(width: number, height: number): OffsetAndSize;
  static triangleStrip(vertices: Array<ObjVertexForFace>, isTop: boolean): Array<string>;
  static triangleSides(topVerticies: Array<ObjVertexForFace>, botVerticies: Array<ObjVertexForFace>): Array<string>;
  abstract toModel(): string;
}
//#endregion
//#region src/lib-ext/model/cube-model/cube-model.data.d.ts
export declare const CUBE_MODEL: string;
//#endregion
//#region src/lib-ext/model/cube-model/cube-model.d.ts
export declare class CubeModel extends AbstractModel {
  static readonly ASSET_FILENAME = "uv-cube.obj";
  toModel(): string;
}
//#endregion
//#region src/lib-ext/model/cube-tiled-model/cube-tiled-model.data.d.ts
export declare const CUBE_MODEL_WITHOUT_TOP: string;
//#endregion
//#region src/lib-ext/model/cube-tiled-model/cube-tiled-model.d.ts
export declare class CubeTiledModel extends AbstractModel {
  static readonly ASSET_FILENAME = "uv-cube-tiled.obj";
  private readonly _tileCount;
  toModel(): string;
}
//#endregion
//#region src/lib-ext/model/cylinder-model/cylinder-model.d.ts
type Vector = {
  x: number;
  y: number;
  z: number;
};
export declare class CylinderModel extends AbstractModel {
  private readonly _numSides;
  constructor(numSides: number);
  _getCircle(isTop: boolean): Array<Vector>;
  _getSideNormals(circle: Array<Vector>): Array<Vector>;
  _toVertexLine(vertex: Vector): string;
  toModel(): string;
}
//#endregion
//#region src/lib-ext/model/hull-model/hull-model.d.ts
export type HullVector3d = {
  x: number;
  y: number;
  z: number;
};
export declare class HullModel extends AbstractModel {
  private _hull;
  private _height;
  private _padding;
  private _pixelSize;
  /**
   * Given an arbitrary collection of points, create a clockwise-winging
   * XY hull (clear Z).
   *
   * @param points
   * @returns {Array<HullVector3d>} padded hull
   */
  static __convexHull(points: Array<HullVector3d>): Array<HullVector3d>;
  constructor(points: Array<HullVector3d>, height: number);
  getHull(): Array<HullVector3d>;
  /**
   * Pad the hull by a given amount, creating a new hull.
   * Apply corner segments to smooth the hull.
   *
   * @param padding
   * @param cornerSegments
   * @returns
   */
  padHull(padding: number, cornerSegments: number): this;
  /**
   * Quantize hull, "pixelating" then creating a hull from pixel corners.
   * This can significantly reduce the number of edges in the hull,
   * especially for curves.  Hull will grow by a portion of pixel size.
   */
  quantizeHull(pixelSize: number): this;
  cleanHull(): this;
  /**
   * Generate the side normals for each point, the next point should be split
   * and have the pervious point's normal followed by that point's normal.
   *
   * @param hull
   * @returns
   */
  static _getSideNormals(hull: Array<HullVector3d>): Array<HullVector3d>;
  static _toObjLineine(type: "v" | "vn", vertex: HullVector3d): string;
  toModel(): string;
}
//#endregion
//#region src/lib-ext/template/abstract-template/abstract-template.d.ts
export type TemplateType = {
  [key: string]: any;
};
export declare abstract class AbstractTemplate {
  private _guidFrom;
  private _templateMetadata;
  private _templateName;
  private _scriptName;
  private _tags;
  constructor();
  /**
   * Create a deterministic GUID from this string.
   * Suggest using the template file path for uniqueness.
   *
   * @param guidFrom
   * @returns
   */
  setGuidFrom(guidFrom: string): this;
  setTags(tags: Array<string>): this;
  setTemplateMetadata(templateMetadata: string): this;
  /**
   * Template name appears in the object library.
   *
   * @param name
   * @returns
   */
  setTemplateName(templateName: string): this;
  setScriptName(scriptName: string): this;
  copyAndFillBasicFields(template: TemplateType): TemplateType;
}
//#endregion
//#region src/lib-ext/template/cardsheet-template/cardsheet-template.data.d.ts
export declare const CARDSHEET_TEMPLATE: {
  readonly Type: "Card";
  readonly GUID: "$GUID";
  readonly Name: "$NAME";
  readonly Metadata: "";
  readonly CollisionType: "Regular";
  readonly Friction: 0.7;
  readonly Restitution: 0;
  readonly Density: 0.5;
  readonly SurfaceType: "Cardboard";
  readonly Roughness: 1;
  readonly Metallic: 0;
  readonly PrimaryColor: {
    readonly R: 255;
    readonly G: 255;
    readonly B: 255;
  };
  readonly SecondaryColor: {
    readonly R: 0;
    readonly G: 0;
    readonly B: 0;
  };
  readonly Flippable: true;
  readonly AutoStraighten: false;
  readonly ShouldSnap: true;
  readonly ScriptName: "";
  readonly Blueprint: "";
  readonly Models: readonly [];
  readonly Collision: readonly [];
  readonly SnapPointsGlobal: false;
  readonly SnapPoints: readonly [];
  readonly ZoomViewDirection: {
    readonly X: 0;
    readonly Y: 0;
    readonly Z: 0;
  };
  readonly FrontTexture: "$CARDSHEET_FACE_FILENAME";
  readonly BackTexture: "$CARDSHEET_BACK_FILENAME";
  readonly HiddenTexture: "";
  readonly BackIndex: "$BACK_INDEX";
  readonly HiddenIndex: -1;
  readonly NumHorizontal: 0;
  readonly NumVertical: 0;
  readonly Width: 0;
  readonly Height: 0;
  readonly Thickness: 0.05;
  readonly HiddenInHand: true;
  readonly UsedWithCardHolders: true;
  readonly CanStack: true;
  readonly UsePrimaryColorForSide: false;
  readonly FrontTextureOverrideExposed: false;
  readonly AllowFlippedInStack: false;
  readonly MirrorBack: true;
  readonly Model: "Rounded";
  readonly Indices: readonly [];
  readonly CardNames: {};
  readonly CardMetadata: {};
  readonly CardTags: {};
  readonly GroundAccessibility: "ZoomAndContext";
};
//#endregion
//#region src/lib-ext/template/cardsheet-template/cardsheet-template.d.ts
export type CardEntry = {
  name?: string;
  metadata?: string;
  tags?: Array<string>;
};
export declare class CardsheetTemplate extends AbstractTemplate {
  private _textureFront;
  private _textureBack;
  private _backIndex;
  private _numCols;
  private _numRows;
  private _cardWidth;
  private _cardHeight;
  private readonly _cards;
  constructor();
  setTextures(front: string, back: string, backIndex: number): this;
  setCardSizeWorld(width: number, height: number): this;
  setNumColsAndRows(cols: number, rows: number): this;
  addCard(cardEntry: CardEntry): this;
  toTemplate(): string;
}
//#endregion
//#region src/lib-ext/template/cube-template/cube-template.data.d.ts
export declare const CUBE_SUB_TEMPLATE: {
  readonly Model: "$MODEL_HERE";
  readonly Offset: {
    readonly X: 0;
    readonly Y: 0;
    readonly Z: 0;
  };
  readonly Scale: {
    readonly X: 1;
    readonly Y: 1;
    readonly Z: 1;
  };
  readonly Rotation: {
    readonly X: 0;
    readonly Y: 0;
    readonly Z: 0;
  };
  readonly Texture: "$TEXTURE HERE";
  readonly NormalMap: "";
  readonly ExtraMap: "";
  readonly ExtraMap2: "";
  readonly IsTransparent: false;
  readonly CastShadow: true;
  readonly IsTwoSided: false;
  readonly UseOverrides: true;
  readonly SurfaceType: "Cardboard";
};
export declare const CUBE_SNAP_POINT: {
  readonly X: 0;
  readonly Y: 0;
  readonly Z: 0;
  readonly Range: 3;
  readonly SnapRotation: 2;
  readonly RotationOffset: 0;
  readonly Shape: 0;
  readonly FlipValidity: 0;
  readonly Tags: readonly [];
};
export declare const CUBE_TEMPLATE: {
  readonly Type: "Generic";
  readonly GUID: "$GUID HERE";
  readonly Name: "$NAME HERE";
  readonly Metadata: "";
  readonly CollisionType: "Regular";
  readonly Friction: 0.7;
  readonly Restitution: 0.1;
  readonly Density: 1;
  readonly SurfaceType: "Cardboard";
  readonly Roughness: 1;
  readonly Metallic: 0;
  readonly PrimaryColor: {
    readonly R: 255;
    readonly G: 255;
    readonly B: 255;
  };
  readonly SecondaryColor: {
    readonly R: 0;
    readonly G: 0;
    readonly B: 0;
  };
  readonly Flippable: false;
  readonly AutoStraighten: false;
  readonly ShouldSnap: false;
  readonly ScriptName: "";
  readonly Blueprint: "";
  readonly Models: readonly ["$REPLACE THIS"];
  readonly Collision: readonly [{
    readonly Model: "$COLLISION MODEL HERE";
    readonly Offset: {
      readonly X: 0;
      readonly Y: 0;
      readonly Z: 0;
    };
    readonly Scale: {
      readonly X: 1;
      readonly Y: 1;
      readonly Z: 1;
    };
    readonly Rotation: {
      readonly X: 0;
      readonly Y: 0;
      readonly Z: 0;
    };
    readonly Type: "Convex";
  }];
  readonly Lights: readonly [];
  readonly SnapPointsGlobal: false;
  readonly SnapPoints: readonly [];
  readonly ZoomViewDirection: {
    readonly X: 0;
    readonly Y: 0;
    readonly Z: 1;
  };
  readonly GroundAccessibility: "ZoomAndContext";
  readonly Tags: readonly [];
};
//#endregion
//#region src/lib-ext/template/cube-template/cube-template.d.ts
export type CubeTemplateEntry = {
  texture: string;
  mask?: string;
  model: string;
  width: number;
  height: number;
  depth: number;
  left?: number;
  top?: number;
};
export type CubeTemplateBoundingBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  maxDepth: number;
};
export declare class CubeTemplate extends AbstractTemplate {
  private readonly _subCubeEntries;
  private _collider;
  private _snapPoints;
  static getBoundingBox(entries: Array<CubeTemplateEntry>): CubeTemplateBoundingBox;
  constructor();
  addSubCubeEntry(entry: CubeTemplateEntry): this;
  setCollider(model: string): this;
  setSnapPoints(snapPoints: Array<CellSnapPoint>): this;
  toTemplate(): string;
}
//#endregion
//#region src/lib-ext/template/d6-template/d6-template.data.d.ts
export declare const D6_TEMPLATE: {
  readonly Type: "Dice";
  readonly GUID: "$GUID";
  readonly Name: "$NAME";
  readonly Metadata: "$METADATA";
  readonly CollisionType: "Regular";
  readonly Friction: 0.7;
  readonly Restitution: 0.5;
  readonly Density: 1;
  readonly SurfaceType: "Plastic";
  readonly Roughness: 0.2;
  readonly Metallic: 0;
  readonly PrimaryColor: {
    readonly R: 255;
    readonly G: 255;
    readonly B: 255;
  };
  readonly SecondaryColor: {
    readonly R: 0;
    readonly G: 0;
    readonly B: 0;
  };
  readonly Flippable: false;
  readonly AutoStraighten: false;
  readonly ShouldSnap: true;
  readonly ScriptName: "";
  readonly Blueprint: "";
  readonly Models: readonly [{
    readonly Model: "StaticMesh'/Game/Meshes/Dice/Dice_D6.Dice_D6'";
    readonly Offset: {
      readonly X: 0;
      readonly Y: 0;
      readonly Z: 0;
    };
    readonly Scale: {
      readonly X: 1;
      readonly Y: 1;
      readonly Z: 1;
    };
    readonly Rotation: {
      readonly X: 0;
      readonly Y: 0;
      readonly Z: 0;
    };
    readonly Texture: "$TEXTURE";
    readonly NormalMap: "";
    readonly ExtraMap: "";
    readonly ExtraMap2: "";
    readonly IsTransparent: false;
    readonly CastShadow: true;
    readonly IsTwoSided: false;
    readonly UseOverrides: true;
    readonly SurfaceType: "Plastic";
  }];
  readonly Collision: readonly [];
  readonly Lights: readonly [];
  readonly SnapPointsGlobal: false;
  readonly SnapPoints: readonly [];
  readonly ZoomViewDirection: {
    readonly X: 0;
    readonly Y: 0;
    readonly Z: 0;
  };
  readonly GroundAccessibility: "Nothing";
  readonly Tags: readonly [];
  readonly Faces: readonly [{
    readonly X: 0;
    readonly Y: 0;
    readonly Z: 1;
    readonly Name: "1";
    readonly Metadata: "";
  }, {
    readonly X: -1;
    readonly Y: 0;
    readonly Z: 0;
    readonly Name: "2";
    readonly Metadata: "";
  }, {
    readonly X: 0;
    readonly Y: 1;
    readonly Z: 0;
    readonly Name: "3";
    readonly Metadata: "";
  }, {
    readonly X: 0;
    readonly Y: -1;
    readonly Z: 0;
    readonly Name: "4";
    readonly Metadata: "";
  }, {
    readonly X: 1;
    readonly Y: 0;
    readonly Z: 0;
    readonly Name: "5";
    readonly Metadata: "";
  }, {
    readonly X: 0;
    readonly Y: 0;
    readonly Z: -1;
    readonly Name: "6";
    readonly Metadata: "";
  }];
};
//#endregion
//#region src/lib-ext/template/d6-template/d6-template.d.ts
export declare class D6Template extends AbstractTemplate {
  private _texturePathRelativeToAssetsTextures;
  private _faceMetadata;
  private _faceNames;
  constructor();
  setFaceMetadata(faceIndex: number, faceMetadata: string): this;
  setFaceName(faceIndex: number, faceName: string): this;
  setTexturePathRelativeToAssetsTextures(texture: string): this;
  toTemplate(): string;
}
//#endregion
//#region src/lib-ext/wavefront-obj/wavefront-obj.d.ts
export type WavefrontVector = {
  x: number;
  y: number;
  z: number;
};
export type WavefrontUV = {
  u: number;
  v: number;
};
export type WavefrontFaceEntry = {
  vertexIndexOneBased: number;
  normalIndexOneBased: number;
  uvIndexOneBased: number;
};
export type WavefrontFace = Array<WavefrontFaceEntry>;
/**
 * Parse and generate Wavefront OBJ files.
 */
export declare class WavefrontObj {
  private readonly _vertices;
  private readonly _normals;
  private readonly _uvs;
  private readonly _faces;
  addVertex(vertex: WavefrontVector): number;
  addNormal(normal: WavefrontVector): number;
  addUV(uv: WavefrontUV): number;
  addFace(face: WavefrontFace): void;
  getVertices(): Array<WavefrontVector>;
  load(fileData: string): this;
}
//#endregion