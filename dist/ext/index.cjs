Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let zod = require("zod");
let fs_promises = require("fs/promises");
fs_promises = __toESM(fs_promises);
let path = require("path");
path = __toESM(path);
let sharp = require("sharp");
sharp = __toESM(sharp);
let fs_extra = require("fs-extra");
fs_extra = __toESM(fs_extra);
let yargs = require("yargs");
yargs = __toESM(yargs);
let crypto = require("crypto");
crypto = __toESM(crypto);
let monotone_chain_convex_hull = require("monotone-chain-convex-hull");
monotone_chain_convex_hull = __toESM(monotone_chain_convex_hull);
let klaw_sync = require("klaw-sync");
klaw_sync = __toESM(klaw_sync);
//#region src/lib-ext/create-assets/abstract-create-assets/abstract-create-assets.ts
var AbstractCreateAssets = class AbstractCreateAssets {
	static cleanByFilePrefix(dir, filenamePrefix) {
		const dirPortionOfFilename = path.default.dirname(filenamePrefix);
		dir = path.default.join(dir, dirPortionOfFilename);
		filenamePrefix = path.default.basename(filenamePrefix);
		return new Promise((resolve, reject) => {
			fs_promises.default.stat(dir).then((stats) => {
				if (stats.isDirectory()) fs_promises.default.readdir(dir).then((filenames) => {
					const promises = [];
					for (const filename of filenames) if (filename.startsWith(filenamePrefix)) {
						const pathFile = path.default.join(dir, filename);
						console.log(`CreateAssets.clean: removing "${pathFile}"`);
						promises.push(fs_promises.default.rm(pathFile));
					}
					Promise.all(promises).then(() => {
						resolve();
					}, reject);
				}, reject);
			}, resolve);
		});
	}
	/**
	* Image buffers are PNG internally, re-encode as JPG if requested.
	*
	* @param filename
	* @param buffer
	* @returns
	*/
	static encodeOutputBuffer(filename, buffer) {
		return new Promise((resolve, reject) => {
			if (filename.endsWith(".jpg")) (0, sharp.default)(buffer).jpeg().toBuffer().then((buffer2) => {
				resolve(buffer2);
			}, reject);
			else resolve(buffer);
		});
	}
	static writeOneFile(filename, buffer) {
		console.log(`CreateAssets: writing "${filename}"`);
		return new Promise((resolve, reject) => {
			AbstractCreateAssets.encodeOutputBuffer(filename, buffer).then((buffer2) => {
				const dir = path.default.dirname(filename);
				fs_promises.default.mkdir(dir, { recursive: true }).then(() => {
					fs_promises.default.writeFile(filename, buffer2).then(() => {
						resolve();
					}, reject);
				}, reject);
			});
		});
	}
	writeFiles() {
		return new Promise((resolve, reject) => {
			this.toFileData().then((filenameToBuffer) => {
				Promise.all(Object.entries(filenameToBuffer).map(([filename, buffer]) => {
					return AbstractCreateAssets.writeOneFile(filename, buffer);
				})).then(() => {
					resolve();
				}, reject);
			}, reject);
		});
	}
};
//#endregion
//#region src/lib-ext/image/cell/cell-parser/cell-schema.ts
const ZBaseCellSchema = zod.z.object({
	type: zod.z.string().min(1),
	scale: zod.z.object({
		pixel: zod.z.number(),
		world: zod.z.number()
	}).strict().optional(),
	exports: zod.z.record(zod.z.string().min(1), zod.z.union([zod.z.number(), zod.z.string()])).optional(),
	id: zod.z.string().min(1).optional(),
	cloneId: zod.z.string().min(1).optional(),
	snapPoints: zod.z.array(zod.z.object({
		tags: zod.z.array(zod.z.string().min(1)).optional(),
		left: zod.z.number().optional(),
		top: zod.z.number().optional(),
		rotation: zod.z.number().optional(),
		range: zod.z.number().optional(),
		createCountToPrev: zod.z.number().optional()
	}).strict()).optional()
}).passthrough();
const ZBleedCellSchema = ZBaseCellSchema.extend({
	type: zod.z.literal("BleedCell"),
	child: ZBaseCellSchema,
	leftRight: zod.z.number().nonnegative(),
	topBottom: zod.z.number().nonnegative()
}).strict();
const ZBufferCellSchema = ZBaseCellSchema.extend({
	type: zod.z.literal("BufferCell"),
	width: zod.z.number().positive(),
	height: zod.z.number().positive(),
	bufferData: zod.z.string()
}).strict();
const ZCanvasCellSchema = ZBaseCellSchema.extend({
	type: zod.z.literal("CanvasCell"),
	width: zod.z.number().positive(),
	height: zod.z.number().positive(),
	children: zod.z.array(zod.z.object({
		left: zod.z.number(),
		top: zod.z.number(),
		child: ZBaseCellSchema
	}).strict())
}).strict();
const ZColCellSchema = ZBaseCellSchema.extend({
	type: zod.z.literal("ColCell"),
	children: zod.z.array(ZBaseCellSchema),
	spacing: zod.z.number()
}).strict();
const ZGridCellSchema = ZBaseCellSchema.extend({
	type: zod.z.literal("GridCell"),
	children: zod.z.array(ZBaseCellSchema),
	numCols: zod.z.number().positive(),
	spacing: zod.z.number()
}).strict();
const ZImageCellSchema = ZBaseCellSchema.extend({
	type: zod.z.literal("ImageCell"),
	width: zod.z.number().positive(),
	height: zod.z.number().positive(),
	imageFile: zod.z.string(),
	alpha: zod.z.number().optional(),
	grayscale: zod.z.boolean().optional(),
	tint: zod.z.string().length(7).regex(/^#/).optional(),
	invert: zod.z.boolean().optional()
}).strict();
const ZPaddedCellSchema = ZBaseCellSchema.extend({
	type: zod.z.literal("PaddedCell"),
	child: ZBaseCellSchema,
	padding: zod.z.number(),
	background: zod.z.string().length(7).regex(/^#/)
}).strict();
const ZRowCellSchema = ZBaseCellSchema.extend({
	type: zod.z.literal("RowCell"),
	children: zod.z.array(ZBaseCellSchema),
	spacing: zod.z.number()
}).strict();
const ZSolidCellSchema = ZBaseCellSchema.extend({
	type: zod.z.literal("SolidCell"),
	width: zod.z.number().positive(),
	height: zod.z.number().positive(),
	color: zod.z.string().length(7).regex(/^#/)
}).strict();
const ZTextCellSchema = ZBaseCellSchema.extend({
	type: zod.z.literal("TextCell"),
	width: zod.z.number().positive(),
	height: zod.z.number().positive(),
	text: zod.z.string(),
	textColor: zod.z.string().length(7).regex(/^#/).optional(),
	font: zod.z.string().optional(),
	fontSize: zod.z.number().positive().optional(),
	fontStyle: zod.z.string().optional()
}).strict();
//#endregion
//#region src/lib-ext/create-assets/create-board/create-board-params.ts
const CreateBoardParamsSchema = zod.z.object({
	rootDir: zod.z.string().min(1).optional(),
	assetFilename: zod.z.string().min(1),
	preshrink: zod.z.number().nonnegative().optional(),
	scriptName: zod.z.string().optional(),
	srcImage: ZBaseCellSchema,
	srcMask: ZBaseCellSchema.optional(),
	templateMetadata: zod.z.string().optional(),
	templateName: zod.z.string().min(1),
	topDownWorldSize: zod.z.object({
		width: zod.z.number().positive().optional(),
		height: zod.z.number().positive().optional(),
		depth: zod.z.number().positive(),
		autoWidthHeight: zod.z.object({
			pixel: zod.z.number(),
			world: zod.z.number()
		}).strict().optional()
	}).strict()
}).strict();
//#endregion
//#region src/lib-ext/image/image-split/image-split.ts
var ImageSplit = class {
	constructor(srcBuffer, chunkSize) {
		if (chunkSize <= 0) throw new Error(`invalid chunk size "${chunkSize}"`);
		this._srcBuffer = srcBuffer;
		this._chunkSize = chunkSize;
	}
	_getChunk(col, row) {
		return new Promise((resolve, reject) => {
			const image = (0, sharp.default)(this._srcBuffer);
			image.metadata().then((metadata) => {
				const imgWidth = metadata.width ?? 1;
				const imgHeight = metadata.height ?? 1;
				const left = col * this._chunkSize;
				const top = row * this._chunkSize;
				const width = Math.min(imgWidth - left, this._chunkSize);
				const height = Math.min(imgHeight - top, this._chunkSize);
				image.extract({
					left,
					top,
					width,
					height
				}).png().toBuffer().then((buffer) => {
					resolve({
						col,
						row,
						buffer,
						px: {
							left,
							top,
							width,
							height
						},
						uv: {
							left: left / imgWidth,
							top: top / imgHeight,
							width: width / imgWidth,
							height: height / imgHeight
						}
					});
				}, reject);
			}, reject);
		});
	}
	split() {
		return new Promise((resolve, reject) => {
			(0, sharp.default)(this._srcBuffer).metadata().then((metadata) => {
				const { width, height } = metadata;
				if (width === void 0 || height === void 0) throw new Error("metadata missing width and/or height");
				const numCols = Math.ceil(width / this._chunkSize);
				const numRows = Math.ceil(height / this._chunkSize);
				const promises = [];
				for (let col = 0; col < numCols; col++) for (let row = 0; row < numRows; row++) promises.push(this._getChunk(col, row));
				Promise.all(promises).then((ImageSplitChunks) => {
					resolve(ImageSplitChunks);
				}, reject);
			}, reject);
		});
	}
};
//#endregion
//#region src/lib-ext/image/cell/abstract-cell/abstract-cell.ts
/**
* Create images from one or more cells.
*
* Fix size in the constructor, do not resize cells afterward!
*
* Cells may not be shared, they can have one one parent.
*/
var AbstractCell = class {
	/**
	* Calculate the max width and height of cells.
	*
	* @param cells
	* @returns
	*/
	static getMaxSize(cells) {
		const maxSize = {
			width: 0,
			height: 0
		};
		for (const cell of cells) {
			const size = cell.getSize();
			maxSize.width = Math.max(maxSize.width, size.width);
			maxSize.height = Math.max(maxSize.height, size.height);
		}
		return maxSize;
	}
	/**
	* Constructor.
	*
	* Require children at constructor time, getSize does not change
	* so we can do layout now.
	*
	* @param children
	*/
	constructor(width, height, children) {
		this._children = [];
		this._snapPoints = [];
		this._localPosition = {
			left: 0,
			top: 0
		};
		if (width <= 0 || height <= 0) throw new Error("negative size");
		this._width = width;
		this._height = height;
		if (children) for (const { child, left, top } of children) {
			if (child._parent) throw new Error("child already added elsewhere");
			child._parent = this;
			this._children.push(child);
			child._localPosition = {
				left,
				top
			};
		}
	}
	addSnapPoint(snapPoint) {
		this._snapPoints.push(snapPoint);
		return this;
	}
	/**
	* Get the UV [0:1] coordinates of the center of this cell
	* with respect to the root cell size.
	*
	* @returns
	*/
	getCenterUV() {
		let root = this;
		while (root._parent) root = root._parent;
		const rootSize = root.getSize();
		const thisPos = this.getGlobalPosition();
		const thisSize = this.getSize();
		const thisCenterPos = {
			left: thisPos.left + thisSize.width / 2,
			top: thisPos.top + thisSize.height / 2
		};
		return {
			u: thisCenterPos.left / rootSize.width,
			v: thisCenterPos.top / rootSize.height
		};
	}
	/**
	* Get children.
	*
	* @returns
	*/
	getChildren() {
		return [...this._children];
	}
	/**
	* Get position relative to the direct parent cell.
	*
	* @returns
	*/
	getLocalPosition() {
		return {
			left: this._localPosition.left,
			top: this._localPosition.top
		};
	}
	/**
	* Get position relative to the root cell, potentially several
	* cells outward.
	*
	* @returns
	*/
	getGlobalPosition() {
		let left = this._localPosition.left;
		let top = this._localPosition.top;
		if (this._parent) {
			const parentGlobalPosition = this._parent.getGlobalPosition();
			left += parentGlobalPosition.left;
			top += parentGlobalPosition.top;
		}
		return {
			left,
			top
		};
	}
	/**
	* Get all snap points, rewrite to global positions.
	*
	* @returns
	*/
	getSnapPoints() {
		const result = [];
		const { width, height } = this.getSize();
		const { left, top } = this.getGlobalPosition();
		for (const snapPoint of this._snapPoints) result.push({
			tags: [...snapPoint.tags ?? []],
			left: left + (snapPoint.left ?? width / 2),
			top: top + (snapPoint.top ?? height / 2),
			rotation: snapPoint.rotation ?? 0
		});
		for (const child of this._children) result.push(...child.getSnapPoints());
		return result;
	}
	/**
	* Get (immutable) cell size.
	*
	* @returns
	*/
	getSize() {
		return {
			width: this._width,
			height: this._height
		};
	}
	/**
	* For cell group styles, render children in order.
	*
	* @returns
	*/
	_renderChildren() {
		const { width, height } = this.getSize();
		const image = (0, sharp.default)({ create: {
			width,
			height,
			channels: 4,
			background: {
				r: 0,
				g: 0,
				b: 0,
				alpha: 0
			}
		} });
		const children = this.getChildren();
		const promises = children.map((child) => child.toBuffer());
		return new Promise((resolve) => {
			Promise.all(promises).then((buffers) => {
				const composite = [];
				buffers.map((buffer, index) => {
					const child = children[index];
					if (child) {
						const { left, top } = child.getLocalPosition();
						composite.push({
							input: buffer,
							left,
							top
						});
					}
				});
				image.composite(composite);
				resolve(image.png().toBuffer());
			});
		});
	}
};
//#endregion
//#region src/lib-ext/image/cell/bleed-cell/bleed-cell.ts
/**
* Wrap a cell in a bleed-size frame, copy edge pixels from the cell
* to the edge of the larger bleed-cell.
*/
var BleedCell = class extends AbstractCell {
	constructor(innerCell, bleedLeftRight, bleedTopBottom) {
		if (bleedLeftRight < 0 || bleedTopBottom < 0) throw new Error("bad bleed");
		const innerSize = innerCell.getSize();
		super(innerSize.width + bleedLeftRight * 2, innerSize.height + bleedTopBottom * 2);
		this._innerCell = innerCell;
		this._bleedLeftRight = bleedLeftRight;
		this._bleedTopBottom = bleedTopBottom;
	}
	_extractAndStretch(edge) {
		const innerSize = this._innerCell.getSize();
		let left = 0;
		let top = 0;
		let srcWidth = 0;
		let srcHeight = 0;
		let dstWidth = 0;
		let dstHeight = 0;
		if (edge === "left" || edge === "top") {
			left = 0;
			top = 0;
		} else if (edge === "right") {
			left = innerSize.width - 1;
			top = 0;
		} else if (edge === "bottom") {
			left = 0;
			top = innerSize.height - 1;
		}
		if (edge === "left" || edge === "right") {
			srcWidth = 1;
			srcHeight = innerSize.height;
			dstWidth = this._bleedLeftRight;
			dstHeight = innerSize.height;
		} else if (edge === "top" || edge === "bottom") {
			srcWidth = innerSize.width;
			srcHeight = 1;
			dstWidth = innerSize.width;
			dstHeight = this._bleedTopBottom;
		}
		return new Promise((resolve) => {
			this._innerCell.toBuffer().then((buffer) => {
				if (dstWidth === 0 || dstHeight === 0) {
					resolve(buffer);
					return;
				}
				(0, sharp.default)(buffer).extract({
					left,
					top,
					width: srcWidth,
					height: srcHeight
				}).resize(dstWidth, dstHeight, {
					fit: "fill",
					kernel: "nearest"
				}).png().toBuffer().then((buffer2) => {
					resolve(buffer2);
				});
			});
		});
	}
	toBuffer() {
		const { width, height } = this.getSize();
		const image = (0, sharp.default)({ create: {
			width,
			height,
			channels: 4,
			background: {
				r: 0,
				g: 0,
				b: 0,
				alpha: 255
			}
		} });
		const inner = this._innerCell.toBuffer();
		const left = this._extractAndStretch("left");
		const right = this._extractAndStretch("right");
		const top = this._extractAndStretch("top");
		const bottom = this._extractAndStretch("bottom");
		return new Promise((resolve) => {
			Promise.all([
				inner,
				left,
				right,
				top,
				bottom
			]).then(([inner2, left2, right2, top2, bottom2]) => {
				image.composite([
					{
						left: 0,
						top: this._bleedTopBottom,
						input: left2
					},
					{
						left: width - this._bleedLeftRight,
						top: this._bleedTopBottom,
						input: right2
					},
					{
						left: this._bleedLeftRight,
						top: 0,
						input: top2
					},
					{
						left: this._bleedLeftRight,
						top: height - this._bleedTopBottom,
						input: bottom2
					},
					{
						left: this._bleedLeftRight,
						top: this._bleedTopBottom,
						input: inner2
					}
				]).png().toBuffer().then((buffer) => {
					resolve(buffer);
				});
			});
		});
	}
};
//#endregion
//#region src/lib-ext/image/cell/buffer-cell/buffer-cell.ts
var BufferCell = class extends AbstractCell {
	constructor(width, height, buffer) {
		super(width, height);
		this._buffer = buffer;
	}
	toBuffer() {
		return new Promise((resolve) => {
			resolve(this._buffer);
		});
	}
};
//#endregion
//#region src/lib-ext/image/cell/canvas-cell/canvas-cell.ts
var CanvasCell = class extends AbstractCell {
	constructor(width, height, children) {
		if (children.length === 0) throw new Error("empty children");
		super(width, height, children);
	}
	toBuffer() {
		return this._renderChildren();
	}
};
//#endregion
//#region src/lib-ext/image/cell/col-cell/col-cell.ts
/**
* Layout cells in a column.
*/
var ColCell = class extends AbstractCell {
	constructor(children, spacing = 0) {
		if (children.length === 0) throw new Error("empty children");
		let lastTop = 0;
		let maxWidth = 0;
		const childrenWithLayout = children.map((child, index) => {
			if (index > 0) lastTop += spacing;
			const top = lastTop;
			const { width, height } = child.getSize();
			lastTop += height;
			maxWidth = Math.max(maxWidth, width);
			return {
				child,
				left: 0,
				top
			};
		});
		super(maxWidth, lastTop, childrenWithLayout);
	}
	toBuffer() {
		return this._renderChildren();
	}
};
//#endregion
//#region src/lib-ext/image/cell/grid-cell/grid-cell.ts
/**
* Layout cells in a grid (potentially for cardsheets).
*/
var GridCell = class GridCell extends AbstractCell {
	static #_ = this.MAX_DIMENSION = 4096;
	static getMaxCellCount(cellSize) {
		const { width, height } = cellSize;
		return Math.floor(this.MAX_DIMENSION / width) * Math.floor(this.MAX_DIMENSION / height);
	}
	/**
	* Most GPUs reserve power-of-2 dimensions.  Compute the
	* row/col layout with the fewest wasted pixels.
	*
	* @param cellCount
	* @param cellSize
	* @returns
	*/
	static getOptimalLayout(cellCount, cellSize) {
		let optLayout = {
			cols: -1,
			rows: -1
		};
		let optEfficiency = 0;
		const absoluteMaxCols = Math.floor(this.MAX_DIMENSION / cellSize.width);
		const absoluteMaxRows = Math.floor(this.MAX_DIMENSION / cellSize.height);
		const maxCols = Math.min(absoluteMaxCols, cellCount);
		for (let cols = 1; cols <= maxCols; cols++) {
			const maxRows = Math.min(absoluteMaxRows, cellCount);
			const rows = Math.ceil(cellCount / cols);
			if (rows > maxRows) continue;
			const w = cols * cellSize.width;
			const h = rows * cellSize.height;
			const pow2w = Math.pow(2, Math.ceil(Math.log2(w)));
			const pow2h = Math.pow(2, Math.ceil(Math.log2(h)));
			const efficiency = w * h / (pow2w * pow2h);
			if (efficiency > optEfficiency) {
				optLayout = {
					cols,
					rows
				};
				optEfficiency = efficiency;
			}
		}
		return optLayout;
	}
	constructor(cells, numCols, spacing = 0) {
		if (cells.length === 0) throw new Error("no cells");
		if (numCols <= 0) throw new Error(`invalid column count "${numCols}"`);
		const maxSize = GridCell.getMaxSize(cells);
		const maxCellCount = GridCell.getMaxCellCount(maxSize);
		if (cells.length > maxCellCount) throw new Error(`${cells.length} cells, max ${maxCellCount}`);
		const numRows = Math.ceil(cells.length / numCols);
		const childrenWithLayout = cells.map((child, index) => {
			const col = index % numCols;
			const row = Math.floor(index / numCols);
			return {
				child,
				left: col * (maxSize.width + spacing),
				top: row * (maxSize.height + spacing)
			};
		});
		super(maxSize.width * numCols + spacing * (numCols - 1), maxSize.height * numRows + spacing * (numRows - 1), childrenWithLayout);
	}
	toBuffer() {
		return this._renderChildren();
	}
};
//#endregion
//#region src/lib-ext/image/cell/image-cell/image-cell.ts
/**
* Load an image from a file.
*/
var ImageCell = class ImageCell extends AbstractCell {
	static from(imageFile) {
		return new Promise((resolve, reject) => {
			(0, sharp.default)(imageFile).metadata().then((metadata) => {
				const w = metadata.width;
				const h = metadata.height;
				if (w === void 0 || h === void 0) reject("missing width or height");
				else resolve(new ImageCell(w, h, imageFile));
			});
		});
	}
	constructor(width, height, imageFile) {
		super(width, height);
		this._alpha = 1;
		this._grayscale = false;
		this._tint = "#ffffff";
		this._invert = false;
		this._imageFile = imageFile;
	}
	setAlpha(value) {
		if (value < 0 || value > 1) throw new Error(`invalid alpha "${value}"`);
		this._alpha = value;
		return this;
	}
	setGrayscale(value) {
		this._grayscale = value;
		return this;
	}
	setInvert(value) {
		this._invert = value;
		return this;
	}
	setTint(value) {
		if (!value.match(/^#[0-9a-f]{6}$/i)) throw new Error(`invalid tint "${value}"`);
		this._tint = value;
		return this;
	}
	toBuffer() {
		return new Promise((resolve) => {
			const { width, height } = this.getSize();
			let image = (0, sharp.default)(this._imageFile);
			image = image.resize(width, height);
			if (this._alpha < 1) image = image.ensureAlpha(this._alpha);
			if (this._tint !== "#ffffff") image = image.tint(this._tint);
			if (this._grayscale) image = image.grayscale(true);
			if (this._invert) image = image.negate(true);
			resolve(image.png().toBuffer());
		});
	}
};
//#endregion
//#region src/lib-ext/image/cell/solid-cell/solid-cell.ts
var SolidCell = class extends AbstractCell {
	constructor(width, height, color) {
		super(width, height);
		this._backgroundColor = {
			r: 0,
			g: 0,
			b: 0
		};
		this.setColor(color);
	}
	setColor(color) {
		const m = color.match(/^#([0-9a-f]{6})$/i);
		if (!m || !m[1]) throw new Error(`invalid color "${color}"`);
		color = m[1];
		const r = Number.parseInt(color.substring(0, 2), 16);
		const g = Number.parseInt(color.substring(2, 4), 16);
		const b = Number.parseInt(color.substring(4, 6), 16);
		this._backgroundColor = {
			r,
			g,
			b
		};
		return this;
	}
	toBuffer() {
		const { width, height } = this.getSize();
		return (0, sharp.default)({ create: {
			width,
			height,
			channels: 4,
			background: this._backgroundColor
		} }).png().toBuffer();
	}
};
//#endregion
//#region src/lib-ext/image/cell/padded-cell/padded-cell.ts
var PaddedCell = class extends AbstractCell {
	constructor(child, padding) {
		let { width, height } = child.getSize();
		width += 2 * padding;
		height += 2 * padding;
		const background = new SolidCell(width, height, "#ffffff");
		super(width, height, [{
			child: background,
			left: 0,
			top: 0
		}, {
			child,
			left: padding,
			top: padding
		}]);
		this._background = background;
	}
	setColor(color) {
		this._background.setColor(color);
		return this;
	}
	toBuffer() {
		return super._renderChildren();
	}
};
//#endregion
//#region src/lib-ext/image/cell/row-cell/row-cell.ts
/**
* Layout cells in a row.
*/
var RowCell = class extends AbstractCell {
	constructor(children, spacing = 0) {
		if (children.length === 0) throw new Error("empty children");
		let lastRight = 0;
		let maxHeight = 0;
		const childrenWithLayout = children.map((child, index) => {
			if (index > 0) lastRight += spacing;
			const left = lastRight;
			const { width, height } = child.getSize();
			lastRight += width;
			maxHeight = Math.max(maxHeight, height);
			return {
				child,
				left,
				top: 0
			};
		});
		super(lastRight, maxHeight, childrenWithLayout);
	}
	toBuffer() {
		return this._renderChildren();
	}
};
//#endregion
//#region src/lib-ext/image/cell/text-cell/text-cell.ts
/**
* Center text in a cell.
*
* Supports custom fonts, which must be installed on the system.
*/
var TextCell = class extends AbstractCell {
	constructor(width, height, text) {
		super(width, height);
		this._font = "Futura";
		this._fontStyle = "Regular";
		this._fontSize = 16;
		this._textColor = "#000000";
		this._text = text;
	}
	setTextColor(color) {
		this._textColor = color;
		return this;
	}
	setFont(font) {
		this._font = font;
		return this;
	}
	setFontSize(fontSize) {
		this._fontSize = fontSize;
		return this;
	}
	setFontStyle(fontStyle) {
		this._fontStyle = fontStyle;
		return this;
	}
	toBuffer() {
		const { width, height } = this.getSize();
		const svgText = `<?xml version="1.0" standalone="no"?>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xml:lang="en"
                height="${height}"
                width="${width}"
            >
                <text
                    text-anchor="middle"
                    x="50%" y="50%"
                    dy="${Math.floor(this._fontSize * .37)}"
                    fill="${this._textColor}"
                    font-size="${this._fontSize}"
                    font-family="${this._font}"
                    font-style="${this._fontStyle}"
                >
                    ${this._text}
                </text>
            </svg>`;
		const svgBuffer = Buffer.from(svgText);
		return (0, sharp.default)(svgBuffer).png().toBuffer();
	}
};
//#endregion
//#region src/lib-ext/image/cell/cell-parser/cell-parser.ts
var CellParser = class {
	constructor(rootDir) {
		this._exports = {};
		this._idToJson = {};
		this._scale = 1;
		this._rootDir = rootDir ?? ".";
	}
	setScale(scale) {
		this._scale = scale;
		return this;
	}
	parse(jsonObject) {
		let zBaseCellType = ZBaseCellSchema.parse(jsonObject);
		let type = zBaseCellType.type;
		const applyScale = (scaleJsonObject) => {
			for (let [k, v] of Object.entries(scaleJsonObject)) {
				if (k.startsWith("$scale")) {
					if (typeof v !== "number") throw new Error(`scale only applies to numbers`);
					const force = scaleJsonObject;
					delete force[k];
					k = k.substring(6);
					v = Math.round(v * this._scale);
					force[k] = v;
				}
				if (typeof v === "object") applyScale(v);
				else if (Array.isArray(v)) {
					for (const entry of v) if (typeof entry === "object") applyScale(entry);
				}
			}
		};
		applyScale(zBaseCellType);
		if (zBaseCellType.exports) for (const [k, v] of Object.entries(zBaseCellType.exports)) this._exports[k] = v;
		if (zBaseCellType.id) this._idToJson[zBaseCellType.id] = JSON.stringify(jsonObject);
		if (zBaseCellType.cloneId) {
			const cloneJson = this._idToJson[zBaseCellType.cloneId];
			if (!cloneJson) throw new Error(`cloneId "${zBaseCellType.cloneId}" not found`);
			jsonObject = JSON.parse(cloneJson);
			zBaseCellType = ZBaseCellSchema.parse(jsonObject);
			type = zBaseCellType.type;
		}
		const applyExports = (jsonObject2) => {
			for (const [k, v] of Object.entries(jsonObject2)) {
				if (v === "$import") {
					const exportedValue = this._exports[k];
					if (exportedValue === void 0) throw new Error(`export "${k}" not found`);
					const force = jsonObject2;
					force[k] = exportedValue;
				}
				if (k === "child" || k === "children" || k === "exports") continue;
				if (typeof v === "object") applyExports(v);
				else if (Array.isArray(v)) {
					for (const entry of v) if (typeof entry === "object") applyExports(entry);
				}
			}
		};
		applyExports(jsonObject);
		let abstractCell;
		if (type === "BleedCell") {
			const zBleedCell = ZBleedCellSchema.parse(jsonObject);
			const child = this.parse(zBleedCell.child);
			const leftRight = zBleedCell.leftRight;
			const topBottom = zBleedCell.topBottom;
			abstractCell = new BleedCell(child, leftRight, topBottom);
		}
		if (type === "BufferCell") {
			const zBufferCell = ZBufferCellSchema.parse(jsonObject);
			const width = zBufferCell.width;
			const height = zBufferCell.height;
			abstractCell = new BufferCell(width, height, Buffer.from(zBufferCell.bufferData));
		}
		if (type === "CanvasCell") {
			const zCanvasCell = ZCanvasCellSchema.parse(jsonObject);
			const width = zCanvasCell.width;
			const height = zCanvasCell.height;
			abstractCell = new CanvasCell(width, height, zCanvasCell.children.map((childEntry) => {
				return {
					left: childEntry.left,
					top: childEntry.top,
					child: this.parse(childEntry.child)
				};
			}));
		}
		if (type === "ColCell") {
			const zColCell = ZColCellSchema.parse(jsonObject);
			const children = zColCell.children.map((child) => this.parse(child));
			const spacing = zColCell.spacing;
			abstractCell = new ColCell(children, spacing);
		}
		if (type === "GridCell") {
			const zGridCell = ZGridCellSchema.parse(jsonObject);
			const children = zGridCell.children.map((child) => this.parse(child));
			const numCols = zGridCell.numCols;
			const spacing = zGridCell.spacing;
			abstractCell = new GridCell(children, numCols, spacing);
		}
		if (type === "ImageCell") {
			const zImageCell = ZImageCellSchema.parse(jsonObject);
			const width = zImageCell.width;
			const height = zImageCell.height;
			let imageFile = zImageCell.imageFile;
			const alpha = zImageCell.alpha ?? 1;
			const grayscale = zImageCell.grayscale ?? false;
			const invert = zImageCell.invert ?? false;
			const tint = zImageCell.tint ?? "#ffffff";
			imageFile = path.default.join(this._rootDir, path.default.normalize(imageFile));
			abstractCell = new ImageCell(width, height, imageFile).setAlpha(alpha).setGrayscale(grayscale).setInvert(invert).setTint(tint);
		}
		if (type === "PaddedCell") {
			const zPaddedCell = ZPaddedCellSchema.parse(jsonObject);
			const child = this.parse(zPaddedCell.child);
			const padding = zPaddedCell.padding;
			const background = zPaddedCell.background;
			abstractCell = new PaddedCell(child, padding).setColor(background);
		}
		if (type === "RowCell") {
			const zRowCell = ZRowCellSchema.parse(jsonObject);
			const children = zRowCell.children.map((child) => this.parse(child));
			const spacing = zRowCell.spacing;
			abstractCell = new RowCell(children, spacing);
		}
		if (type === "SolidCell") {
			const zSolidCell = ZSolidCellSchema.parse(jsonObject);
			const width = zSolidCell.width;
			const height = zSolidCell.height;
			const color = zSolidCell.color;
			abstractCell = new SolidCell(width, height, color);
		}
		if (type === "TextCell") {
			const zTextCell = ZTextCellSchema.parse(jsonObject);
			const width = zTextCell.width;
			const height = zTextCell.height;
			const text = zTextCell.text;
			const textColor = zTextCell.textColor;
			const font = zTextCell.font;
			const fontSize = zTextCell.fontSize;
			const fontStyle = zTextCell.fontStyle;
			const textCell = new TextCell(width, height, text);
			if (textColor) textCell.setTextColor(textColor);
			if (font) textCell.setFont(font);
			if (fontSize) textCell.setFontSize(fontSize);
			if (fontStyle) textCell.setFontStyle(fontStyle);
			abstractCell = textCell;
		}
		if (!abstractCell) throw new Error(`bad type "${type}"`);
		if (zBaseCellType.snapPoints) {
			let prev = void 0;
			for (const snapPoint of zBaseCellType.snapPoints) {
				if (snapPoint.createCountToPrev) {
					if (!prev) throw new Error("no prev");
					const dWidth = (snapPoint.left ?? 0) - (prev.left ?? 0);
					const dHeight = (snapPoint.top ?? 0) - (prev.top ?? 0);
					for (let i = 1; i < snapPoint.createCountToPrev; i++) {
						const d = i / snapPoint.createCountToPrev;
						abstractCell.addSnapPoint({
							tags: snapPoint.tags,
							left: (prev.left ?? 0) + dWidth * d,
							top: (prev.top ?? 0) + dHeight * d,
							rotation: snapPoint.rotation,
							range: snapPoint.range
						});
					}
				}
				const cellSnapPoint = {
					tags: snapPoint.tags,
					left: snapPoint.left,
					top: snapPoint.top,
					rotation: snapPoint.rotation,
					range: snapPoint.range
				};
				abstractCell.addSnapPoint(cellSnapPoint);
				prev = cellSnapPoint;
			}
		}
		return abstractCell;
	}
};
//#endregion
//#region src/lib-ext/model/abstract-model/abstract-model.ts
var AbstractModel = class {
	/**
	* Given a size, calculate the inset bounds for the UV mapped space.
	*
	* @param width
	* @param height
	* @returns
	*/
	static getInsetForUVs(width, height) {
		const left = Math.ceil(width / 256);
		const top = Math.ceil(height / 256);
		return {
			left,
			top,
			width: width - left * 2,
			height: height - top * 2
		};
	}
	/**
	* Given a size, calculate the outset bounds after applying UV gutters.
	*/
	static getOutsetForUVs(width, height) {
		const outerWidth = width * 256 / 254;
		const left = Math.floor((outerWidth - width) / 2);
		const outerHeight = height * 256 / 254;
		const top = Math.floor((outerHeight - height) / 2);
		return {
			left,
			top,
			width: width + left * 2,
			height: height + top * 2
		};
	}
	static triangleStrip(vertices, isTop) {
		const lines = [];
		let nextLeft = 0;
		let nextRight = vertices.length - 1;
		let goLeft = true;
		while (nextLeft + 1 < nextRight) {
			let a, b, c;
			if (goLeft) {
				a = nextLeft;
				b = nextLeft + 1;
				c = nextRight;
				nextLeft = b;
				goLeft = false;
			} else {
				a = nextLeft;
				b = nextRight - 1;
				c = nextRight;
				nextRight = b;
				goLeft = true;
			}
			if (!isTop) [a, c] = [c, a];
			lines.push([
				"f",
				vertices[a],
				vertices[b],
				vertices[c]
			].join(" "));
		}
		return lines;
	}
	static triangleSides(topVerticies, botVerticies) {
		const lines = [];
		for (let i = 0; i < topVerticies.length; i += 1) {
			const a = i;
			const b = a;
			const d = (i + 1) % topVerticies.length;
			const c = d;
			lines.push([
				"f",
				topVerticies[a],
				botVerticies[b],
				botVerticies[c]
			].join(" "));
			lines.push([
				"f",
				botVerticies[c],
				topVerticies[d],
				topVerticies[a]
			].join(" "));
		}
		return lines;
	}
};
//#endregion
//#region src/lib-ext/model/cube-model/cube-model.data.ts
const CUBE_MODEL = `# 1x1x1 cube, UVs for top face (with gutter)
v 0.5 0.5 0.5
v 0.5 0.5 -0.5
v -0.5 0.5 -0.5
v -0.5 0.5 0.5
v 0.5 -0.5 0.5
v 0.5 -0.5 -0.5
v -0.5 -0.5 -0.5
v -0.5 -0.5 0.5

# Use 1/256 bleed gutters
vt 0.00390625 0.00390625
vt 0.99609375 0.00390625
vt 0.99609375 0.99609375
vt 0.00390625 0.99609375

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
f 1//5 4//5 5//5`;
//#endregion
//#region src/lib-ext/model/cube-model/cube-model.ts
var CubeModel = class extends AbstractModel {
	static #_ = this.ASSET_FILENAME = "uv-cube.obj";
	toModel() {
		return CUBE_MODEL;
	}
};
//#endregion
//#region src/lib-ext/template/cube-template/cube-template.data.ts
const CUBE_SUB_TEMPLATE = {
	Model: "$MODEL_HERE",
	Offset: {
		X: 0,
		Y: 0,
		Z: 0
	},
	Scale: {
		X: 1,
		Y: 1,
		Z: 1
	},
	Rotation: {
		X: 0,
		Y: 0,
		Z: 0
	},
	Texture: "$TEXTURE HERE",
	NormalMap: "",
	ExtraMap: "",
	ExtraMap2: "",
	IsTransparent: false,
	CastShadow: true,
	IsTwoSided: false,
	UseOverrides: true,
	SurfaceType: "Cardboard"
};
const CUBE_SNAP_POINT = {
	X: 0,
	Y: 0,
	Z: 0,
	Range: 3,
	SnapRotation: 2,
	RotationOffset: 0,
	Shape: 0,
	FlipValidity: 0,
	Tags: []
};
const CUBE_TEMPLATE = {
	Type: "Generic",
	GUID: "$GUID HERE",
	Name: "$NAME HERE",
	Metadata: "",
	CollisionType: "Regular",
	Friction: .7,
	Restitution: .1,
	Density: 1,
	SurfaceType: "Cardboard",
	Roughness: 1,
	Metallic: 0,
	PrimaryColor: {
		R: 255,
		G: 255,
		B: 255
	},
	SecondaryColor: {
		R: 0,
		G: 0,
		B: 0
	},
	Flippable: false,
	AutoStraighten: false,
	ShouldSnap: false,
	ScriptName: "",
	Blueprint: "",
	Models: ["$REPLACE THIS"],
	Collision: [{
		Model: "$COLLISION MODEL HERE",
		Offset: {
			X: 0,
			Y: 0,
			Z: 0
		},
		Scale: {
			X: 1,
			Y: 1,
			Z: 1
		},
		Rotation: {
			X: 0,
			Y: 0,
			Z: 0
		},
		Type: "Convex"
	}],
	Lights: [],
	SnapPointsGlobal: false,
	SnapPoints: [],
	ZoomViewDirection: {
		X: 0,
		Y: 0,
		Z: 1
	},
	GroundAccessibility: "ZoomAndContext",
	Tags: []
};
//#endregion
//#region src/lib-ext/template/abstract-template/abstract-template.ts
var AbstractTemplate = class {
	constructor() {
		this._guidFrom = "";
		this._templateMetadata = "";
		this._templateName = "";
		this._scriptName = "";
		this._tags = [];
	}
	/**
	* Create a deterministic GUID from this string.
	* Suggest using the template file path for uniqueness.
	*
	* @param guidFrom
	* @returns
	*/
	setGuidFrom(guidFrom) {
		this._guidFrom = guidFrom;
		return this;
	}
	setTags(tags) {
		this._tags = tags;
		return this;
	}
	setTemplateMetadata(templateMetadata) {
		this._templateMetadata = templateMetadata;
		return this;
	}
	/**
	* Template name appears in the object library.
	*
	* @param name
	* @returns
	*/
	setTemplateName(templateName) {
		this._templateName = templateName;
		return this;
	}
	setScriptName(scriptName) {
		this._scriptName = scriptName;
		return this;
	}
	copyAndFillBasicFields(template) {
		if (this._guidFrom === "") throw new Error("must setGuidFrom");
		if (this._templateName === "") throw new Error("must setTemplateName");
		template = JSON.parse(JSON.stringify(template));
		const guid = crypto.default.createHash("sha256").update(this._guidFrom).digest("hex").substring(0, 32).toUpperCase();
		template.GUID = guid;
		template.Name = this._templateName;
		template.Metadata = this._templateMetadata;
		template.ScriptName = this._scriptName;
		template.Tags = this._tags;
		return template;
	}
};
//#endregion
//#region src/lib-ext/template/cube-template/cube-template.ts
var CubeTemplate = class CubeTemplate extends AbstractTemplate {
	static getBoundingBox(entries) {
		const firstEntry = entries[0];
		if (!firstEntry) return {
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
			maxDepth: 0
		};
		let left = firstEntry.left ?? 0;
		let right = firstEntry.left ?? 0;
		let top = firstEntry.top ?? 0;
		let bottom = firstEntry.top ?? 0;
		let maxDepth = 0;
		for (const entry of entries) {
			left = Math.min(left, entry.left ?? 0);
			top = Math.min(top, entry.top ?? 0);
			right = Math.max(right, (entry.left ?? 0) + entry.width);
			bottom = Math.max(bottom, (entry.top ?? 0) + entry.height);
			maxDepth = Math.max(maxDepth, entry.depth);
		}
		return {
			left,
			top,
			right,
			bottom,
			maxDepth
		};
	}
	constructor() {
		super();
		this._subCubeEntries = [];
		this._snapPoints = [];
	}
	addSubCubeEntry(entry) {
		this._subCubeEntries.push(entry);
		return this;
	}
	setCollider(model) {
		this._collider = model;
		return this;
	}
	setSnapPoints(snapPoints) {
		this._snapPoints = [...snapPoints];
		return this;
	}
	toTemplate() {
		if (this._subCubeEntries.length === 0) throw new Error("must addEntry");
		const modelEntries = this._subCubeEntries.map((entry) => {
			const modelEntry = JSON.parse(JSON.stringify(CUBE_SUB_TEMPLATE));
			modelEntry.Model = entry.model;
			modelEntry.Texture = entry.texture;
			modelEntry.ExtraMap = entry.mask ?? "";
			modelEntry.Offset.Y = (entry.left ?? 0) + entry.width / 2;
			modelEntry.Offset.X = -((entry.top ?? 0) + entry.height / 2);
			modelEntry.Offset.Z = 0;
			modelEntry.Scale.Y = entry.width;
			modelEntry.Scale.X = entry.height;
			modelEntry.Scale.Z = entry.depth;
			return modelEntry;
		});
		const template = this.copyAndFillBasicFields(CUBE_TEMPLATE);
		template.Models = modelEntries;
		const bb = CubeTemplate.getBoundingBox(this._subCubeEntries);
		template.SnapPoints = this._snapPoints.map((snapPoint) => {
			const templateSnapPoint = JSON.parse(JSON.stringify(CUBE_SNAP_POINT));
			templateSnapPoint.Y = snapPoint.left ?? 0;
			templateSnapPoint.X = snapPoint.top ?? 0;
			templateSnapPoint.Z = bb.maxDepth / 2;
			templateSnapPoint.RotationOffset = snapPoint.rotation ?? 0;
			templateSnapPoint.Tags = snapPoint.tags ?? [];
			return templateSnapPoint;
		});
		if (this._collider) {
			template.Collision[0].Model = this._collider;
			template.Collision[0].Offset.Y = bb.left + (bb.right - bb.left) / 2;
			template.Collision[0].Offset.X = -(bb.top + (bb.bottom - bb.top) / 2);
			template.Collision[0].Scale.Y = bb.right - bb.left;
			template.Collision[0].Scale.X = bb.bottom - bb.top;
			template.Collision[0].Scale.Z = bb.maxDepth;
		} else delete template.Collision;
		return JSON.stringify(template, null, 4);
	}
};
//#endregion
//#region src/lib-ext/image/cell/resize-cell/resize-cell.ts
/**
* Wrap another cell, resizing it to the given dimensions.
*/
var ResizeCell = class extends AbstractCell {
	constructor(width, height, cell) {
		super(width, height);
		this._innerCell = cell;
		const scaleW = width / cell.getSize().width;
		const scaleH = height / cell.getSize().height;
		for (const snapPoint of cell.getSnapPoints()) {
			if (snapPoint.left !== void 0) snapPoint.left *= scaleW;
			if (snapPoint.top !== void 0) snapPoint.top *= scaleH;
			this.addSnapPoint(snapPoint);
		}
	}
	toBuffer() {
		return new Promise((resolve, reject) => {
			this._innerCell.toBuffer().then((buffer) => {
				const { width, height } = this.getSize();
				(0, sharp.default)(buffer).resize(width, height, { fit: "fill" }).png().toBuffer().then((buffer2) => {
					resolve(buffer2);
				}, reject);
			}, reject);
		});
	}
};
//#endregion
//#region src/lib-ext/create-assets/create-board/create-board.ts
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
var CreateBoard = class CreateBoard extends AbstractCreateAssets {
	static #_ = this.INSET_SIZE = CubeModel.getInsetForUVs(4096, 4096);
	static fromParamsJson(paramsJson) {
		const params = CreateBoardParamsSchema.parse(JSON.parse(paramsJson.toString()));
		return new CreateBoard(params);
	}
	constructor(params) {
		super();
		this._params = params;
		let scale = 1;
		if (this._params.topDownWorldSize.autoWidthHeight) {
			const { pixel, world } = this._params.topDownWorldSize.autoWidthHeight;
			scale = pixel / world;
		}
		this._srcImageCell = new CellParser(this._params.rootDir).setScale(scale).parse(this._params.srcImage);
		if (this._params.srcMask) this._srcMaskCell = new CellParser(this._params.rootDir).parse(this._params.srcMask);
		let { width, height } = this._srcImageCell.getSize();
		if (this._params.topDownWorldSize.autoWidthHeight) {
			const { pixel, world } = this._params.topDownWorldSize.autoWidthHeight;
			this._params.topDownWorldSize.width = width * world / pixel;
			this._params.topDownWorldSize.height = height * world / pixel;
		}
		if (this._params.preshrink) {
			const maxDimension = Math.max(width, height);
			const scale2 = this._params.preshrink / maxDimension;
			width = Math.floor(width * scale2);
			height = Math.floor(height * scale2);
			const size = CubeModel.getInsetForUVs(width, height);
			this._srcImageCell = new ResizeCell(size.width, size.height, this._srcImageCell);
		}
	}
	clean() {
		const promises = [];
		const basename = path.default.basename(this._params.assetFilename);
		promises.push(AbstractCreateAssets.cleanByFilePrefix(path.default.join(this._params.rootDir ?? ".", "assets", "Textures", this._params.assetFilename), basename), AbstractCreateAssets.cleanByFilePrefix(path.default.join(this._params.rootDir ?? ".", "assets", "Templates"), this._params.assetFilename));
		return new Promise((resolve, reject) => {
			Promise.all(promises).then(() => {
				resolve();
			}, reject);
		});
	}
	_splitImage(bufferPromise) {
		if (CreateBoard.INSET_SIZE.width !== CreateBoard.INSET_SIZE.height) throw new Error("inset size mismatch");
		return new Promise((resolve, reject) => {
			bufferPromise.then((buffer) => {
				new ImageSplit(buffer, CreateBoard.INSET_SIZE.width).split().then((chunks) => {
					Promise.all(chunks.map((chunk) => {
						const inner = new BufferCell(chunk.px.width, chunk.px.height, chunk.buffer);
						const outset = CubeModel.getOutsetForUVs(chunk.px.width, chunk.px.height);
						return new BleedCell(inner, outset.left, outset.top).toBuffer();
					})).then((outsetBuffers) => {
						for (let i = 0; i < chunks.length; i++) {
							const chunk = chunks[i];
							const outsetBuffer = outsetBuffers[i];
							if (!chunk || !outsetBuffer) throw new Error("missing");
							chunk.buffer = outsetBuffer;
						}
						resolve(chunks);
					}, reject);
				}, reject);
			}, reject);
		});
	}
	toFileData() {
		const filenameToBuffer = {};
		const cubeModel = new CubeModel();
		const cubeModelFilename = path.default.join(this._params.rootDir ?? ".", "assets", "Models", CubeModel.ASSET_FILENAME);
		filenameToBuffer[cubeModelFilename] = Buffer.from(cubeModel.toModel(), "ascii");
		const templateFilename = path.default.join(this._params.rootDir ?? ".", "assets", "Templates", `${this._params.assetFilename}.json`);
		const cubeTemplate = new CubeTemplate().setGuidFrom(templateFilename).setScriptName(this._params.scriptName ?? "").setTemplateName(this._params.templateName).setTemplateMetadata(this._params.templateMetadata ?? "");
		const imgSize = this._srcImageCell.getSize();
		const worldSize = this._params.topDownWorldSize;
		const worldSpaceSnapPoints = this._srcImageCell.getSnapPoints().map((snapPoint) => {
			snapPoint.left = (snapPoint.left ?? 0) / imgSize.width * (worldSize.width ?? 0);
			snapPoint.top = (snapPoint.top ?? 0) / imgSize.height * (worldSize.height ?? 0);
			snapPoint.left = (snapPoint.left ?? 0) - (worldSize.width ?? 0) / 2;
			snapPoint.top = (worldSize.height ?? 0) / 2 - (snapPoint.top ?? 0);
			return snapPoint;
		});
		cubeTemplate.setSnapPoints(worldSpaceSnapPoints);
		const promises = [];
		const addImagePromise = (cell, hasMask, isMask) => {
			const promise = new Promise((resolve, reject) => {
				this._splitImage(cell.toBuffer()).then((chunks) => {
					for (const chunk of chunks) {
						const basename = path.default.basename(this._params.assetFilename);
						const colRow = chunks.length > 1 ? `-${chunk.col}x${chunk.row}` : "";
						const innerFilename = path.default.join(this._params.assetFilename, `${basename}${colRow}.jpg`);
						const innerMaskFilename = path.default.join(this._params.assetFilename, `${basename}${colRow}-mask.png`);
						const filename = path.default.join(this._params.rootDir ?? ".", "assets", "Textures", isMask ? innerMaskFilename : innerFilename);
						filenameToBuffer[filename] = chunk.buffer;
						let { width, height, depth } = this._params.topDownWorldSize;
						if (width === void 0) width = 0;
						if (height === void 0) height = 0;
						if (depth === void 0) depth = 0;
						cubeTemplate.addSubCubeEntry({
							texture: innerFilename,
							mask: hasMask ? innerMaskFilename : void 0,
							model: CubeModel.ASSET_FILENAME,
							width: chunk.uv.width * width,
							height: chunk.uv.height * height,
							depth,
							left: chunk.uv.left * width - width / 2,
							top: chunk.uv.top * height - height / 2
						});
					}
					if (chunks.length > 1) cubeTemplate.setCollider(CubeModel.ASSET_FILENAME);
					if (!isMask) filenameToBuffer[templateFilename] = Buffer.from(cubeTemplate.toTemplate(), "ascii");
					resolve();
				}, reject);
			});
			promises.push(promise);
		};
		const hasMask = this._srcMaskCell ? true : false;
		addImagePromise(this._srcImageCell, hasMask, false);
		if (this._srcMaskCell) addImagePromise(this._srcMaskCell, hasMask, true);
		return new Promise((resolve, reject) => {
			Promise.all(promises).then(() => {
				resolve(filenameToBuffer);
			}, reject);
		});
	}
};
//#endregion
//#region src/lib-ext/create-assets/create-board/create-board-run.ts
/**
* Call with the path to a CreateBoardParams config file.
*/
const args$3 = yargs.options({ i: {
	alias: "input",
	descript: "create-board-params config file",
	type: "string",
	demand: true
} }).parseSync();
async function main$3() {
	const paramsJson = fs_extra.readFileSync(args$3.i);
	const createBoard = CreateBoard.fromParamsJson(paramsJson);
	await createBoard.clean();
	await createBoard.writeFiles();
}
main$3();
//#endregion
//#region src/lib-ext/create-assets/create-cardsheets/create-cardsheet-params.ts
const CardsheetCardSchema = zod.z.object({
	face: zod.z.union([zod.z.string(), ZBaseCellSchema]),
	back: zod.z.union([zod.z.string(), ZBaseCellSchema]).optional(),
	name: zod.z.string().optional(),
	metadata: zod.z.string().optional(),
	tags: zod.z.array(zod.z.string()).optional()
}).strict();
const CreateCardsheetParamsSchema = zod.z.object({
	rootDir: zod.z.string().min(1).optional(),
	assetFilename: zod.z.string().min(1),
	templateName: zod.z.string().min(1),
	deckMetadata: zod.z.string().optional(),
	cardSizePixel: zod.z.object({
		width: zod.z.number().positive(),
		height: zod.z.number().positive()
	}).strict(),
	cardSizeWorld: zod.z.object({
		width: zod.z.number().positive(),
		height: zod.z.number().positive()
	}).strict(),
	applyAllInputDir: zod.z.string().optional(),
	applyAllTags: zod.z.array(zod.z.string()).optional(),
	cards: zod.z.array(CardsheetCardSchema),
	back: zod.z.union([zod.z.string(), ZBaseCellSchema]).optional()
}).strict();
//#endregion
//#region src/lib-ext/template/cardsheet-template/cardsheet-template.data.ts
const CARDSHEET_TEMPLATE = {
	Type: "Card",
	GUID: "$GUID",
	Name: "$NAME",
	Metadata: "",
	CollisionType: "Regular",
	Friction: .7,
	Restitution: 0,
	Density: .5,
	SurfaceType: "Cardboard",
	Roughness: 1,
	Metallic: 0,
	PrimaryColor: {
		R: 255,
		G: 255,
		B: 255
	},
	SecondaryColor: {
		R: 0,
		G: 0,
		B: 0
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
		Z: 0
	},
	FrontTexture: "$CARDSHEET_FACE_FILENAME",
	BackTexture: "$CARDSHEET_BACK_FILENAME",
	HiddenTexture: "",
	BackIndex: "$BACK_INDEX",
	HiddenIndex: -1,
	NumHorizontal: 0,
	NumVertical: 0,
	Width: 0,
	Height: 0,
	Thickness: .05,
	HiddenInHand: true,
	UsedWithCardHolders: true,
	CanStack: true,
	UsePrimaryColorForSide: false,
	FrontTextureOverrideExposed: false,
	AllowFlippedInStack: false,
	MirrorBack: true,
	Model: "Rounded",
	Indices: [],
	CardNames: {},
	CardMetadata: {},
	CardTags: {},
	GroundAccessibility: "ZoomAndContext"
};
//#endregion
//#region src/lib-ext/template/cardsheet-template/cardsheet-template.ts
var CardsheetTemplate = class extends AbstractTemplate {
	constructor() {
		super();
		this._textureFront = "";
		this._textureBack = "";
		this._backIndex = 0;
		this._numCols = 0;
		this._numRows = 0;
		this._cardWidth = 0;
		this._cardHeight = 0;
		this._cards = [];
	}
	setTextures(front, back, backIndex) {
		this._textureFront = front;
		this._textureBack = back;
		this._backIndex = backIndex;
		return this;
	}
	setCardSizeWorld(width, height) {
		this._cardWidth = width;
		this._cardHeight = height;
		return this;
	}
	setNumColsAndRows(cols, rows) {
		this._numCols = cols;
		this._numRows = rows;
		return this;
	}
	addCard(cardEntry) {
		this._cards.push(cardEntry);
		return this;
	}
	toTemplate() {
		if (this._textureFront.length === 0 || this._textureBack.length === 0) throw new Error("must setTextures");
		if (this._cardWidth <= 0 || this._cardHeight <= 0) throw new Error("must setCardSizeWorld");
		if (this._numCols <= 0 || this._numRows <= 0) throw new Error("must setNumColsAndRows");
		if (this._cards.length === 0) throw new Error("must addEntry");
		const template = this.copyAndFillBasicFields(CARDSHEET_TEMPLATE);
		template.FrontTexture = this._textureFront;
		template.BackTexture = this._textureBack;
		template.BackIndex = this._backIndex;
		template.NumHorizontal = this._numCols;
		template.NumVertical = this._numRows;
		template.Width = this._cardWidth;
		template.Height = this._cardHeight;
		this._cards.forEach((card, index) => {
			template.Indices.push(index);
			if (card.name) template.CardNames[index] = card.name;
			if (card.metadata) template.CardMetadata[index] = card.metadata;
			if (card.tags) template.CardTags[index] = card.tags;
		});
		return JSON.stringify(template, null, 4);
	}
};
//#endregion
//#region src/lib-ext/create-assets/create-cardsheets/create-cardsheet.ts
var CreateCardsheet = class CreateCardsheet extends AbstractCreateAssets {
	static fromParamsJson(paramsJson) {
		const params = CreateCardsheetParamsSchema.parse(JSON.parse(paramsJson.toString()));
		return new CreateCardsheet(params);
	}
	constructor(params) {
		super();
		this._fileData = {};
		this._params = params;
		this._sheetPlan = this._getSheetPlan();
		const basename = path.default.basename(params.assetFilename);
		this._sharedBackFilenameRelativeToAssets = path.default.join(params.assetFilename, `${basename}.back.jpg`);
	}
	clean() {
		const promises = [];
		const basename = path.default.basename(this._params.assetFilename);
		promises.push(AbstractCreateAssets.cleanByFilePrefix(path.default.join(this._params.rootDir ?? ".", "assets", "Textures", this._params.assetFilename), basename), AbstractCreateAssets.cleanByFilePrefix(path.default.join(this._params.rootDir ?? ".", "assets", "Templates", this._params.assetFilename), basename));
		return new Promise((resolve, reject) => {
			Promise.all(promises).then(() => {
				resolve();
			}, reject);
		});
	}
	/**
	* Create a single cell from image data (either a filename, or a ZCell schema).
	*
	* @param imageData
	* @returns
	*/
	_getCardCell(imageData) {
		if (typeof imageData === "string") {
			let srcFilename = "";
			if (imageData.startsWith("./")) srcFilename = path.default.join(this._params.rootDir ?? ".", imageData);
			else srcFilename = path.default.join(this._params.rootDir ?? ".", this._params.applyAllInputDir ?? ".", imageData);
			return new ImageCell(this._params.cardSizePixel.width, this._params.cardSizePixel.height, srcFilename);
		} else if (imageData) {
			const cardCell = new CellParser().parse(imageData);
			return new ResizeCell(this._params.cardSizePixel.width, this._params.cardSizePixel.height, cardCell);
		} else throw new Error(`missing image`);
	}
	/**
	* Create (with potential resize) card cells.
	* It is better to use cells than PNG Buffer because we can leverage
	* GridCell to merge them into cardsheets later.
	*
	* @param cardSide
	* @returns
	*/
	_getCardCells(cardSide) {
		if (cardSide === "back" && this._params.back) return [];
		return this._params.cards.map((cardEntry) => {
			const imageData = cardSide === "face" ? cardEntry.face : cardEntry.back;
			return this._getCardCell(imageData);
		});
	}
	/**
	* Organize cards into one or more sheets (possible overflow due to size limits).
	*
	* @returns
	*/
	_getSheetPlan() {
		const result = [];
		const faceCells = this._getCardCells("face");
		const backCells = this._getCardCells("back");
		const totalCellCount = this._params.cards.length;
		const cellSize = this._params.cardSizePixel;
		const maxCellsPerSheet = GridCell.getMaxCellCount(cellSize);
		const numSheets = Math.ceil(totalCellCount / maxCellsPerSheet);
		for (let sheetIndex = 0; sheetIndex < numSheets; sheetIndex++) {
			const start = sheetIndex * maxCellsPerSheet;
			const end = Math.min(start + maxCellsPerSheet, totalCellCount);
			const cellCount = end - start;
			const layout = GridCell.getOptimalLayout(cellCount, cellSize);
			const basename = path.default.basename(this._params.assetFilename);
			const indexPart = numSheets > 1 ? `.${sheetIndex}` : "";
			const sheetPlan = {
				faceFilenameRelativeToAssetsTextures: path.default.join(this._params.assetFilename, `${basename}.face${indexPart}.jpg`),
				backFilenameRelativeToAssetsTextures: path.default.join(this._params.assetFilename, `${basename}.back${indexPart}.jpg`),
				templateFilenameRelativeToAssetsTemplates: path.default.join(this._params.assetFilename, `${basename}${indexPart}.json`),
				cols: layout.cols,
				rows: layout.rows,
				faceCells: faceCells.slice(start, end),
				backCells: backCells.slice(start, end),
				cardEntries: this._params.cards.slice(start, end)
			};
			if (this._params.applyAllTags) for (const cardEntry of sheetPlan.cardEntries) for (const tag of this._params.applyAllTags) {
				if (!cardEntry.tags) cardEntry.tags = [];
				if (!cardEntry.tags.includes(tag)) cardEntry.tags.push(tag);
			}
			result.push(sheetPlan);
		}
		return result;
	}
	toFileData() {
		const promises = [];
		for (const sheetPlan of this._sheetPlan) {
			promises.push(this._createCardSheet(sheetPlan, "face"));
			if (this._params.back === void 0) promises.push(this._createCardSheet(sheetPlan, "back"));
		}
		if (this._params.back) promises.push(this._createSharedBack());
		let index = 0;
		for (const sheetPlan of this._sheetPlan) this._createDeckTemplate(sheetPlan, index++, this._sheetPlan.length);
		return new Promise((resolve, reject) => {
			Promise.all(promises).then(() => {
				resolve(this._fileData);
			}, reject);
		});
	}
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
	_createCardSheet(sheetPlan, cardSide) {
		const relativeFilename = cardSide === "face" ? sheetPlan.faceFilenameRelativeToAssetsTextures : sheetPlan.backFilenameRelativeToAssetsTextures;
		const dstFilename = path.default.join(this._params.rootDir ?? ".", "assets", "Textures", relativeFilename);
		const gridCell = new GridCell(cardSide === "face" ? sheetPlan.faceCells : sheetPlan.backCells, sheetPlan.cols, 0);
		return new Promise((resolve, reject) => {
			gridCell.toBuffer().then((buffer) => {
				this._fileData[dstFilename] = buffer;
				resolve();
			}, reject);
		});
	}
	/**
	* If using a shared back (single card), create it.
	*
	* @returns
	*/
	_createSharedBack() {
		if (!this._params.back) throw new Error("missing shared back");
		const cell = this._getCardCell(this._params.back);
		const dstFilename = path.default.join(this._params.rootDir ?? ".", "assets", "Textures", this._sharedBackFilenameRelativeToAssets);
		return new Promise((resolve, reject) => {
			cell.toBuffer().then((buffer) => {
				this._fileData[dstFilename] = buffer;
				resolve();
			}, reject);
		});
	}
	/**
	* Generate the template for a single cardsheet.
	*
	* If the sheet is split up, this just generates one entry.
	*
	* @param sheetPlan
	*/
	_createDeckTemplate(sheetPlan, index, count) {
		const dstFilename = path.default.join(this._params.rootDir ?? ".", "assets", "Templates", sheetPlan.templateFilenameRelativeToAssetsTemplates);
		let backIndex = 0;
		let backTexture = "";
		if (this._params.back) {
			backIndex = -2;
			backTexture = this._sharedBackFilenameRelativeToAssets;
		} else {
			backIndex = -3;
			backTexture = sheetPlan.backFilenameRelativeToAssetsTextures;
		}
		let nameSuffix = "";
		if (count > 1) nameSuffix = ` ${index + 1}/${count}`;
		const sheetTemplate = new CardsheetTemplate().setCardSizeWorld(this._params.cardSizeWorld.width, this._params.cardSizeWorld.height).setGuidFrom(sheetPlan.templateFilenameRelativeToAssetsTemplates).setTemplateMetadata(this._params.deckMetadata ?? "").setTemplateName((this._params.templateName ?? "") + nameSuffix).setNumColsAndRows(sheetPlan.cols, sheetPlan.rows).setTextures(sheetPlan.faceFilenameRelativeToAssetsTextures, backTexture, backIndex).setTags(this._params.applyAllTags ?? []);
		for (const cardEntry of sheetPlan.cardEntries) sheetTemplate.addCard(cardEntry);
		this._fileData[dstFilename] = Buffer.from(sheetTemplate.toTemplate());
	}
};
//#endregion
//#region src/lib-ext/create-assets/create-cardsheets/create-cardsheet-run.ts
/**
* Call with the path to a CreateBoardParams config file.
*/
const args$2 = yargs.options({ i: {
	alias: "input",
	descript: "create-board-params config file",
	type: "string",
	demand: true
} }).parseSync();
async function main$2() {
	const paramsJson = fs_extra.readFileSync(args$2.i);
	const createCardSheet = CreateCardsheet.fromParamsJson(paramsJson);
	await createCardSheet.clean();
	await createCardSheet.writeFiles();
}
main$2();
//#endregion
//#region src/lib-ext/create-assets/create-d6/create-d6-params.ts
const CreateD6ParamsSchema = zod.z.object({
	rootDir: zod.z.string().min(1).optional(),
	assetFilename: zod.z.string().min(1),
	faceSizePixel: zod.z.object({
		width: zod.z.number().positive(),
		height: zod.z.number().positive()
	}).strict(),
	tags: zod.z.array(zod.z.string().min(1)).optional(),
	templateName: zod.z.string().min(1),
	templateMetadata: zod.z.string().optional(),
	faces: zod.z.array(zod.z.object({
		image: zod.z.union([zod.z.string(), ZBaseCellSchema]),
		name: zod.z.string().optional(),
		metadata: zod.z.union([zod.z.string().optional(), zod.z.object({}).passthrough()])
	}).strict())
}).strict();
//#endregion
//#region src/lib-ext/template/d6-template/d6-template.data.ts
const D6_TEMPLATE = {
	Type: "Dice",
	GUID: "$GUID",
	Name: "$NAME",
	Metadata: "$METADATA",
	CollisionType: "Regular",
	Friction: .7,
	Restitution: .5,
	Density: 1,
	SurfaceType: "Plastic",
	Roughness: .2,
	Metallic: 0,
	PrimaryColor: {
		R: 255,
		G: 255,
		B: 255
	},
	SecondaryColor: {
		R: 0,
		G: 0,
		B: 0
	},
	Flippable: false,
	AutoStraighten: false,
	ShouldSnap: true,
	ScriptName: "",
	Blueprint: "",
	Models: [{
		Model: "StaticMesh'/Game/Meshes/Dice/Dice_D6.Dice_D6'",
		Offset: {
			X: 0,
			Y: 0,
			Z: 0
		},
		Scale: {
			X: 1,
			Y: 1,
			Z: 1
		},
		Rotation: {
			X: 0,
			Y: 0,
			Z: 0
		},
		Texture: "$TEXTURE",
		NormalMap: "",
		ExtraMap: "",
		ExtraMap2: "",
		IsTransparent: false,
		CastShadow: true,
		IsTwoSided: false,
		UseOverrides: true,
		SurfaceType: "Plastic"
	}],
	Collision: [],
	Lights: [],
	SnapPointsGlobal: false,
	SnapPoints: [],
	ZoomViewDirection: {
		X: 0,
		Y: 0,
		Z: 0
	},
	GroundAccessibility: "Nothing",
	Tags: [],
	Faces: [
		{
			X: 0,
			Y: 0,
			Z: 1,
			Name: "1",
			Metadata: ""
		},
		{
			X: -1,
			Y: 0,
			Z: 0,
			Name: "2",
			Metadata: ""
		},
		{
			X: 0,
			Y: 1,
			Z: 0,
			Name: "3",
			Metadata: ""
		},
		{
			X: 0,
			Y: -1,
			Z: 0,
			Name: "4",
			Metadata: ""
		},
		{
			X: 1,
			Y: 0,
			Z: 0,
			Name: "5",
			Metadata: ""
		},
		{
			X: 0,
			Y: 0,
			Z: -1,
			Name: "6",
			Metadata: ""
		}
	]
};
//#endregion
//#region src/lib-ext/template/d6-template/d6-template.ts
var D6Template = class extends AbstractTemplate {
	constructor() {
		super();
		this._texturePathRelativeToAssetsTextures = "";
		this._faceMetadata = {};
		this._faceNames = {};
	}
	setFaceMetadata(faceIndex, faceMetadata) {
		this._faceMetadata[faceIndex] = faceMetadata;
		return this;
	}
	setFaceName(faceIndex, faceName) {
		this._faceNames[faceIndex] = faceName;
		return this;
	}
	setTexturePathRelativeToAssetsTextures(texture) {
		this._texturePathRelativeToAssetsTextures = texture;
		return this;
	}
	toTemplate() {
		const template = this.copyAndFillBasicFields(D6_TEMPLATE);
		template.Models[0].Texture = this._texturePathRelativeToAssetsTextures;
		for (let i = 0; i < 6; i++) {
			template.Faces[i].Metadata = this._faceMetadata[i] ?? "";
			template.Faces[i].Name = this._faceNames[i] ?? (i + 1).toString();
		}
		return JSON.stringify(template, null, 4);
	}
};
//#endregion
//#region src/lib-ext/create-assets/create-d6/create-d6.ts
var CreateD6 = class CreateD6 extends AbstractCreateAssets {
	static fromParamsJson(paramsJson) {
		const params = CreateD6ParamsSchema.parse(JSON.parse(paramsJson.toString()));
		return new CreateD6(params);
	}
	constructor(params) {
		super();
		this._params = params;
	}
	clean() {
		const promises = [];
		promises.push(AbstractCreateAssets.cleanByFilePrefix(path.default.join(this._params.rootDir ?? ".", "assets", "Textures"), this._params.assetFilename), AbstractCreateAssets.cleanByFilePrefix(path.default.join(this._params.rootDir ?? ".", "assets", "Templates"), this._params.assetFilename));
		return new Promise((resolve, reject) => {
			Promise.all(promises).then(() => {
				resolve();
			}, reject);
		});
	}
	_createD6Image() {
		const width = this._params.faceSizePixel.width;
		const height = this._params.faceSizePixel.height;
		const getFaceCell = (index) => {
			const face = this._params.faces[index];
			if (!face) throw new Error("missing face");
			let cell;
			if (typeof face.image === "string") cell = new ImageCell(this._params.faceSizePixel.width, this._params.faceSizePixel.height, face.image);
			else {
				cell = new CellParser().parse(face.image);
				cell = new ResizeCell(this._params.faceSizePixel.width, this._params.faceSizePixel.height, cell);
			}
			return cell;
		};
		return new CanvasCell(width * 3, height * 3, [
			{
				left: width * 1,
				top: height * 0,
				child: getFaceCell(0)
			},
			{
				left: width * 0,
				top: height * 1,
				child: getFaceCell(1)
			},
			{
				left: width * 1,
				top: height * 1,
				child: getFaceCell(2)
			},
			{
				left: width * 1,
				top: height * 2,
				child: getFaceCell(3)
			},
			{
				left: width * 0,
				top: height * 2,
				child: getFaceCell(4)
			},
			{
				left: width * 2,
				top: height * 1,
				child: getFaceCell(5)
			}
		]).toBuffer();
	}
	toFileData() {
		const fileData = {};
		const texturePathRelativeToAssetsTextures = `${this._params.assetFilename}.png`;
		const imageTextureFile = path.default.join(this._params.rootDir ?? ".", "assets", "Textures", texturePathRelativeToAssetsTextures);
		const imageCell = this._createD6Image();
		const d6template = new D6Template().setGuidFrom(this._params.assetFilename).setTags(this._params.tags ?? []).setTemplateMetadata(this._params.templateMetadata ?? "").setTemplateName(this._params.templateName).setTexturePathRelativeToAssetsTextures(texturePathRelativeToAssetsTextures);
		for (let i = 0; i < 6; i++) {
			const face = this._params.faces[i];
			if (typeof (face === null || face === void 0 ? void 0 : face.metadata) === "object") {
				const metadata = JSON.stringify(face === null || face === void 0 ? void 0 : face.metadata);
				d6template.setFaceMetadata(i, metadata);
			} else if (typeof (face === null || face === void 0 ? void 0 : face.metadata) === "string") {
				const metadata = face === null || face === void 0 ? void 0 : face.metadata;
				d6template.setFaceMetadata(i, metadata);
			}
			if (face === null || face === void 0 ? void 0 : face.name) d6template.setFaceName(i, face.name);
		}
		fileData[path.default.join(this._params.rootDir ?? ".", "assets", "Templates", `${this._params.assetFilename}.json`)] = Buffer.from(d6template.toTemplate());
		return new Promise((resolve, reject) => {
			imageCell.then((buffer) => {
				fileData[imageTextureFile] = buffer;
				resolve(fileData);
			}, reject);
		});
	}
};
//#endregion
//#region src/lib-ext/create-assets/create-d6/create-d6-run.ts
/**
* Call with the path to a CreateBoardParams config file.
*/
const args$1 = yargs.options({ i: {
	alias: "input",
	descript: "create-board-params config file",
	type: "string",
	demand: true
} }).parseSync();
async function main$1() {
	const paramsJson = fs_extra.readFileSync(args$1.i);
	const createCardSheet = CreateD6.fromParamsJson(paramsJson);
	await createCardSheet.clean();
	await createCardSheet.writeFiles();
}
main$1();
//#endregion
//#region src/lib-ext/model/cube-tiled-model/cube-tiled-model.data.ts
const CUBE_MODEL_WITHOUT_TOP = `# 1x1x1 cube, UVs for top face (with gutter)
v 0.5 0.5 0.5
v 0.5 0.5 -0.5
v -0.5 0.5 -0.5
v -0.5 0.5 0.5
v 0.5 -0.5 0.5
v 0.5 -0.5 -0.5
v -0.5 -0.5 -0.5
v -0.5 -0.5 0.5

# Use 1/4000 bleed gutters
vt 0.00025 0.00025
vt 0.99975 0.00025
vt 0.99975 0.99975
vt 0.00025 0.99975

vn 0 1 0
vn 1 0 0
vn 0 0 1
vn -1 0 0
vn 0 0 -1
vn 0 -1 0

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
f 1//5 4//5 5//5`;
//#endregion
//#region src/lib-ext/model/cube-tiled-model/cube-tiled-model.ts
var CubeTiledModel = class extends AbstractModel {
	constructor(..._args) {
		super(..._args);
		this._tileCount = 10;
	}
	static #_ = this.ASSET_FILENAME = "uv-cube-tiled.obj";
	toModel() {
		const parts = [CUBE_MODEL_WITHOUT_TOP, ""];
		const vIdx = 9;
		for (let j = 0; j <= this._tileCount; j++) for (let i = 0; i <= this._tileCount; i++) {
			const x = Math.round((i / this._tileCount - .5) * 1e4) / 1e4;
			const y = Math.round((-j / this._tileCount + .5) * 1e4) / 1e4;
			parts.push(`v ${x} 0.5 ${y}`);
		}
		for (let y = 0; y < this._tileCount; y++) for (let x = 0; x < this._tileCount; x++) {
			const v0 = vIdx + x + y * (this._tileCount + 1);
			const a = v0;
			const b = v0 + 1;
			const c = v0 + this._tileCount + 1;
			const d = v0 + this._tileCount + 2;
			parts.push(`f ${a}/1/1 ${b}/2/1 ${c}/4/1`);
			parts.push(`f ${b}/2/1 ${d}/3/1 ${c}/4/1`);
		}
		return parts.join("\n");
	}
};
//#endregion
//#region src/lib-ext/model/cylinder-model/cylinder-model.ts
var CylinderModel = class extends AbstractModel {
	constructor(numSides) {
		super();
		this._numSides = numSides;
	}
	_getCircle(isTop) {
		const circle = [];
		for (let i = 0; i < this._numSides; i++) {
			const theta = i / this._numSides * 2 * Math.PI;
			const x = Math.cos(theta) * .5;
			const y = Math.sin(theta) * .5;
			circle.push({
				x,
				y,
				z: isTop ? .5 : -.5
			});
		}
		return circle;
	}
	_getSideNormals(circle) {
		return circle.map((point) => {
			const length = Math.sqrt(point.x * point.x + point.y * point.y);
			if (length === 0) return {
				x: 0,
				y: 0,
				z: 0
			};
			return {
				x: Math.round(point.x / length * 1e3) / 1e3,
				y: Math.round(point.y / length * 1e3) / 1e3,
				z: 0
			};
		});
	}
	_toVertexLine(vertex) {
		vertex.x = Math.round(vertex.x * 1e4) / 1e4;
		vertex.y = Math.round(vertex.y * 1e4) / 1e4;
		vertex.z = Math.round(vertex.z * 1e4) / 1e4;
		return `v ${vertex.y} ${vertex.z} ${vertex.x}`;
	}
	toModel() {
		const lines = [`# Cylinder, ${this._numSides} sides`];
		const topCircle = this._getCircle(true);
		const botCircle = this._getCircle(false);
		lines.push("");
		lines.push("# Top vertices");
		topCircle.forEach((vertex) => {
			lines.push(this._toVertexLine(vertex));
		});
		lines.push("");
		lines.push("# Bottom vertices");
		botCircle.forEach((vertex) => {
			lines.push(this._toVertexLine(vertex));
		});
		const topFaceEntries = topCircle.map((_vertex, index) => {
			return `${index + 1}//`;
		});
		const botFaceEntries = botCircle.map((_vertex, index) => {
			return `${this._numSides + index + 1}//`;
		});
		lines.push("", "# Top triangles", ...AbstractModel.triangleStrip(topFaceEntries, true), "", "# Bottom triangles", ...AbstractModel.triangleStrip(botFaceEntries, false), "", "# Side triangles", ...AbstractModel.triangleSides(topFaceEntries, botFaceEntries));
		return lines.join("\n");
	}
};
//#endregion
//#region src/lib-ext/model/hull-model/hull-model.ts
var HullModel = class HullModel extends AbstractModel {
	/**
	* Given an arbitrary collection of points, create a clockwise-winging
	* XY hull (clear Z).
	*
	* @param points
	* @returns {Array<HullVector3d>} padded hull
	*/
	static __convexHull(points) {
		const xyInput = points.map((point) => {
			return [point.x, point.y];
		});
		return (0, monotone_chain_convex_hull.default)(xyInput).map((xy) => {
			return {
				x: xy[0],
				y: xy[1],
				z: 0
			};
		});
	}
	constructor(points, height) {
		super();
		this._height = 0;
		this._padding = 0;
		this._pixelSize = 0;
		this._hull = HullModel.__convexHull(points);
		this._height = height;
	}
	getHull() {
		return this._hull;
	}
	/**
	* Pad the hull by a given amount, creating a new hull.
	* Apply corner segments to smooth the hull.
	*
	* @param padding
	* @param cornerSegments
	* @returns
	*/
	padHull(padding, cornerSegments) {
		const hullPlus = [...this._hull];
		const deltaPhi = Math.PI * 2 / cornerSegments;
		for (const point of this._hull) for (let i = 0; i < cornerSegments; i++) {
			const phi = deltaPhi * i;
			const x = padding * Math.cos(phi);
			const y = padding * Math.sin(phi);
			hullPlus.push({
				x: point.x + x,
				y: point.y + y,
				z: 0
			});
		}
		this._hull = HullModel.__convexHull(hullPlus);
		return this;
	}
	/**
	* Quantize hull, "pixelating" then creating a hull from pixel corners.
	* This can significantly reduce the number of edges in the hull,
	* especially for curves.  Hull will grow by a portion of pixel size.
	*/
	quantizeHull(pixelSize) {
		const hullPlus = [];
		for (const point of this._hull) {
			const x0 = Math.floor(point.x / pixelSize) * pixelSize;
			const x1 = Math.ceil(point.x / pixelSize) * pixelSize;
			const y0 = Math.floor(point.y / pixelSize) * pixelSize;
			const y1 = Math.ceil(point.y / pixelSize) * pixelSize;
			hullPlus.push({
				x: x0,
				y: y0,
				z: 0
			});
			hullPlus.push({
				x: x1,
				y: y0,
				z: 0
			});
			hullPlus.push({
				x: x1,
				y: y1,
				z: 0
			});
			hullPlus.push({
				x: x0,
				y: y1,
				z: 0
			});
		}
		this._hull = HullModel.__convexHull(hullPlus);
		return this;
	}
	cleanHull() {
		this._hull = this._hull.map((point) => {
			return {
				x: Math.round(point.x * 1e4) / 1e4,
				y: Math.round(point.y * 1e4) / 1e4,
				z: Math.round(point.z * 1e4) / 1e4
			};
		});
		return this;
	}
	/**
	* Generate the side normals for each point, the next point should be split
	* and have the pervious point's normal followed by that point's normal.
	*
	* @param hull
	* @returns
	*/
	static _getSideNormals(hull) {
		const normals = [];
		const zero = {
			x: 0,
			y: 0,
			z: 0
		};
		for (let i = 0; i < hull.length; i++) {
			const p0 = hull[i] ?? zero;
			const p1 = hull[(i + 1) % hull.length] ?? zero;
			const dx = p1.x - p0.x;
			const dy = p1.y - p0.y;
			const m = Math.max(Math.sqrt(dx * dx + dy * dy), Number.EPSILON);
			normals.push({
				x: dy / m,
				y: -dx / m,
				z: 0
			});
		}
		return normals;
	}
	static _toObjLineine(type, vertex) {
		vertex.x = Math.round(vertex.x * 1e4) / 1e4;
		vertex.y = Math.round(vertex.y * 1e4) / 1e4;
		vertex.z = Math.round(vertex.z * 1e4) / 1e4;
		return `${type} ${vertex.x} ${vertex.z} ${vertex.y}`;
	}
	toModel() {
		let numNormals = 0;
		let numVertices = 0;
		const hull = this._hull.reverse();
		const lines = [`# Hull, ${hull.length} sides`];
		lines.push("", "# Top vertices");
		const topVertices1BasedStart = numVertices + 1;
		numVertices += hull.length;
		hull.forEach((point) => {
			const vertex = {
				x: point.x,
				y: point.y,
				z: this._height / 2
			};
			lines.push(HullModel._toObjLineine("v", vertex));
		});
		lines.push("", "# Bottom vertices");
		const botVertices1BasedStart = numVertices + 1;
		numVertices += hull.length;
		hull.forEach((point) => {
			const vertex = {
				x: point.x,
				y: point.y,
				z: -this._height / 2
			};
			lines.push(HullModel._toObjLineine("v", vertex));
		});
		lines.push("", "# Top normal");
		const topNormal1BasedStart = numNormals + 1;
		numNormals += 1;
		lines.push(HullModel._toObjLineine("vn", {
			x: 0,
			y: 0,
			z: 1
		}));
		lines.push("", "# Bottom normal");
		const botNormal1BasedStart = numNormals + 1;
		numNormals += 1;
		lines.push(HullModel._toObjLineine("vn", {
			x: 0,
			y: 0,
			z: -1
		}));
		lines.push("", "# Side normals");
		const sideNormal1BasedStart = numNormals + 1;
		numNormals += hull.length;
		HullModel._getSideNormals(hull).forEach((normal) => {
			lines.push(HullModel._toObjLineine("vn", normal));
		});
		lines.push("", "# Top faces");
		const topFaceEntries = hull.map((_, index) => {
			return `${topVertices1BasedStart + index % hull.length}//${topNormal1BasedStart}`;
		});
		lines.push(...AbstractModel.triangleStrip(topFaceEntries, true));
		lines.push("", "# Bottom faces");
		const botFaceEntries = hull.map((_, index) => {
			return `${botVertices1BasedStart + index % hull.length}//${botNormal1BasedStart}`;
		});
		lines.push(...AbstractModel.triangleStrip(botFaceEntries, false));
		lines.push("", "# Side faces");
		for (let index = 0; index <= hull.length; index++) {
			const a = topVertices1BasedStart + index % hull.length;
			const b = topVertices1BasedStart + (index + 1) % hull.length;
			const c = botVertices1BasedStart + index % hull.length;
			const d = botVertices1BasedStart + (index + 1) % hull.length;
			const vn = sideNormal1BasedStart + index % hull.length;
			const f0 = [
				`${a}//${vn}`,
				`${c}//${vn}`,
				`${b}//${vn}`
			];
			const f1 = [
				`${b}//${vn}`,
				`${c}//${vn}`,
				`${d}//${vn}`
			];
			lines.push("f " + f0.join(" "));
			lines.push("f " + f1.join(" "));
		}
		return lines.join("\n");
	}
};
//#endregion
//#region src/lib-ext/nsid/extract-nsid-to-template-id.ts
/**
* Create map from template metadata ("NSID") to template id.
*
* ARGS:
* -i : path to assets/Templates dir
* -o : path to src/out.json file
* -f : overwrite any existing output file
*/
const args = yargs.options({
	i: {
		alias: "input",
		descript: "input directory",
		type: "string",
		demand: true
	},
	o: {
		alias: "output",
		descript: "output file (JSON)",
		type: "string",
		demand: true
	},
	f: {
		alias: "force",
		descript: "overwrite any existing output file?",
		type: "boolean"
	}
}).parseSync();
async function main() {
	const root = path.resolve(args.i);
	if (!fs_extra.existsSync(root) || !fs_extra.statSync(root).isDirectory) throw new Error(`missing (-i) template directory "${root}"`);
	console.log("\n----- LOCATING TEMPLATE JSON FILES -----\n");
	console.log(`scanning "${root}"`);
	const jsonFilenames = (0, klaw_sync.default)(root, {
		filter: (item) => path.extname(item.path) === ".json",
		nodir: true,
		traverseAll: true
	}).map((item) => item.path);
	const nsidToTemplateId = {};
	for (const jsonFilename of jsonFilenames) {
		const json = fs_extra.readJSONSync(jsonFilename);
		const templateId = json.GUID;
		let nsid = json.Metadata;
		if (typeof templateId !== "string") {
			console.log(`rejecting no GUID: "${jsonFilename}"`);
			continue;
		}
		if (typeof nsid !== "string") {
			console.log(`rejecting no metadata: "${jsonFilename}"`);
			continue;
		}
		if (json.Type === "Card" && typeof json.CardMetadata === "object") {
			var _cardNsids$;
			const cardNsids = Object.values(json.CardMetadata);
			if (cardNsids.length === 1 && (((_cardNsids$ = cardNsids[0]) === null || _cardNsids$ === void 0 ? void 0 : _cardNsids$.length) ?? 0) > 0) {
				const newNsid = cardNsids[0];
				if (nsid !== newNsid) {
					console.log(`REPLACING SINGLETON "${nsid}" with "${newNsid}" (${jsonFilename})`);
					nsid = newNsid;
				}
			} else if (cardNsids.length > 1) {
				const getPrefix = (items) => {
					const firstParts = (items[0] ?? "").split(".");
					let matchingPartsCount = firstParts.length;
					for (const item of items) {
						const parts = item.split(".");
						for (let i = 0; i < parts.length; i++) if (parts[i] !== firstParts[i]) {
							matchingPartsCount = Math.min(matchingPartsCount, i);
							break;
						}
					}
					return firstParts.slice(0, matchingPartsCount).join(".");
				};
				const newNsid = `${getPrefix(cardNsids.map((cardNsid) => {
					const m = cardNsid.match("([^:]+):([^/]+)/.+");
					return (m === null || m === void 0 ? void 0 : m[1]) ?? "";
				}))}:${getPrefix(cardNsids.map((cardNsid) => {
					const m = cardNsid.match("([^:]+):([^/]+)/.+");
					return (m === null || m === void 0 ? void 0 : m[2]) ?? "";
				}))}/*`;
				if (nsid !== newNsid) {
					console.log(`REPLACING DECK "${nsid}" with "${newNsid}" (${jsonFilename})`);
					nsid = newNsid;
				}
			}
		}
		if (!nsid.match("[^:]+:[^/]+/.+")) {
			console.log(`rejecting not nsid: "${jsonFilename}" ("${nsid}")`);
			continue;
		}
		console.log(`accepting "${jsonFilename}"`);
		if (nsidToTemplateId[nsid]) throw new Error(`Duplicate NSID "${nsid}"`);
		nsidToTemplateId[nsid] = templateId;
	}
	const data = JSON.stringify(nsidToTemplateId, Object.keys(nsidToTemplateId).sort(), 4) + "\n";
	fs_extra.writeFileSync(args.o, data);
}
main();
//#endregion
//#region src/lib-ext/wavefront-obj/wavefront-obj.ts
/**
* Parse and generate Wavefront OBJ files.
*/
var WavefrontObj = class {
	constructor() {
		this._vertices = [];
		this._normals = [];
		this._uvs = [];
		this._faces = [];
	}
	addVertex(vertex) {
		this._vertices.push(vertex);
		return this._vertices.length;
	}
	addNormal(normal) {
		this._normals.push(normal);
		return this._normals.length;
	}
	addUV(uv) {
		this._uvs.push(uv);
		return this._uvs.length;
	}
	addFace(face) {
		this._faces.push(face);
	}
	getVertices() {
		return this._vertices;
	}
	load(fileData) {
		const lines = fileData.toString().split("\n").map((line) => line.trim());
		for (const line of lines) {
			const parts = line.split(" ").filter((s) => s.length > 0);
			const key = parts.shift() ?? "";
			if (key === "v") {
				const x = parseFloat(parts[0] ?? "0");
				const y = parseFloat(parts[1] ?? "0");
				const z = parseFloat(parts[2] ?? "0");
				this.addVertex({
					x,
					y,
					z
				});
			} else if (key === "vn") {
				const x = parseFloat(parts[0] ?? "0");
				const y = parseFloat(parts[1] ?? "0");
				const z = parseFloat(parts[2] ?? "0");
				this.addNormal({
					x,
					y,
					z
				});
			} else if (key === "vt") {
				const u = parseFloat(parts[0] ?? "0");
				const v = parseFloat(parts[1] ?? "0");
				this.addUV({
					u,
					v
				});
			} else if (key === "f") {
				const face = parts.map((part) => {
					const indices = part.split("/");
					return {
						vertexIndexOneBased: parseInt(indices[0] ?? "0"),
						uvIndexOneBased: parseInt(indices[1] ?? "0"),
						normalIndexOneBased: parseInt(indices[2] ?? "0")
					};
				});
				this.addFace(face);
			}
		}
		return this;
	}
};
//#endregion
exports.AbstractCell = AbstractCell;
exports.AbstractCreateAssets = AbstractCreateAssets;
exports.AbstractModel = AbstractModel;
exports.AbstractTemplate = AbstractTemplate;
exports.BleedCell = BleedCell;
exports.BufferCell = BufferCell;
exports.CARDSHEET_TEMPLATE = CARDSHEET_TEMPLATE;
exports.CUBE_MODEL = CUBE_MODEL;
exports.CUBE_MODEL_WITHOUT_TOP = CUBE_MODEL_WITHOUT_TOP;
exports.CUBE_SNAP_POINT = CUBE_SNAP_POINT;
exports.CUBE_SUB_TEMPLATE = CUBE_SUB_TEMPLATE;
exports.CUBE_TEMPLATE = CUBE_TEMPLATE;
exports.CanvasCell = CanvasCell;
exports.CardsheetCardSchema = CardsheetCardSchema;
exports.CardsheetTemplate = CardsheetTemplate;
exports.CellParser = CellParser;
exports.ColCell = ColCell;
exports.CreateBoard = CreateBoard;
exports.CreateBoardParamsSchema = CreateBoardParamsSchema;
exports.CreateCardsheet = CreateCardsheet;
exports.CreateCardsheetParamsSchema = CreateCardsheetParamsSchema;
exports.CreateD6 = CreateD6;
exports.CreateD6ParamsSchema = CreateD6ParamsSchema;
exports.CubeModel = CubeModel;
exports.CubeTemplate = CubeTemplate;
exports.CubeTiledModel = CubeTiledModel;
exports.CylinderModel = CylinderModel;
exports.D6Template = D6Template;
exports.D6_TEMPLATE = D6_TEMPLATE;
exports.GridCell = GridCell;
exports.HullModel = HullModel;
exports.ImageCell = ImageCell;
exports.ImageSplit = ImageSplit;
exports.PaddedCell = PaddedCell;
exports.ResizeCell = ResizeCell;
exports.RowCell = RowCell;
exports.SolidCell = SolidCell;
exports.TextCell = TextCell;
exports.WavefrontObj = WavefrontObj;
exports.ZBaseCellSchema = ZBaseCellSchema;
exports.ZBleedCellSchema = ZBleedCellSchema;
exports.ZBufferCellSchema = ZBufferCellSchema;
exports.ZCanvasCellSchema = ZCanvasCellSchema;
exports.ZColCellSchema = ZColCellSchema;
exports.ZGridCellSchema = ZGridCellSchema;
exports.ZImageCellSchema = ZImageCellSchema;
exports.ZPaddedCellSchema = ZPaddedCellSchema;
exports.ZRowCellSchema = ZRowCellSchema;
exports.ZSolidCellSchema = ZSolidCellSchema;
exports.ZTextCellSchema = ZTextCellSchema;
