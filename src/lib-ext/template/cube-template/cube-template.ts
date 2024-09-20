// Treat top-down view as width x height, depth is Z.
import {
    CUBE_SNAP_POINT,
    CUBE_SUB_TEMPLATE,
    CUBE_TEMPLATE,
} from "./cube-template.data";
import { CellSnapPoint } from "../../../index-ext";
import { AbstractTemplate } from "../abstract-template/abstract-template";

// Entries are always centered, may apply an offset.
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
    maxDepth: number; // Z dimension
};

export class CubeTemplate extends AbstractTemplate {
    private readonly _subCubeEntries: Array<CubeTemplateEntry> = [];
    private _collider: string | undefined;
    private _snapPoints: Array<CellSnapPoint> = [];

    static getBoundingBox(
        entries: Array<CubeTemplateEntry>
    ): CubeTemplateBoundingBox {
        const firstEntry: CubeTemplateEntry | undefined = entries[0];
        if (!firstEntry) {
            return { left: 0, top: 0, right: 0, bottom: 0, maxDepth: 0 };
        }
        let left: number = firstEntry.left ?? 0;
        let right: number = firstEntry.left ?? 0; // just has to be in bounds
        let top: number = firstEntry.top ?? 0;
        let bottom: number = firstEntry.top ?? 0; // just has to be in bounds
        let maxDepth: number = 0;
        for (const entry of entries) {
            left = Math.min(left, entry.left ?? 0);
            top = Math.min(top, entry.top ?? 0);
            right = Math.max(right, (entry.left ?? 0) + entry.width);
            bottom = Math.max(bottom, (entry.top ?? 0) + entry.height);
            maxDepth = Math.max(maxDepth, entry.depth);
        }
        return { left, top, right, bottom, maxDepth };
    }

    constructor() {
        super();
    }

    addSubCubeEntry(entry: CubeTemplateEntry): this {
        this._subCubeEntries.push(entry);
        return this;
    }

    setCollider(model: string): this {
        this._collider = model;
        return this;
    }

    setSnapPoints(snapPoints: Array<CellSnapPoint>): this {
        this._snapPoints = [...snapPoints];
        return this;
    }

    toTemplate(): string {
        if (this._subCubeEntries.length === 0) {
            throw new Error("must addEntry");
        }

        const modelEntries: Array<object> = this._subCubeEntries.map(
            (entry) => {
                const modelEntry = JSON.parse(
                    JSON.stringify(CUBE_SUB_TEMPLATE)
                );
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
            }
        );

        const template = this.copyAndFillBasicFields(CUBE_TEMPLATE);
        template.Models = modelEntries;

        const bb = CubeTemplate.getBoundingBox(this._subCubeEntries);

        template.SnapPoints = this._snapPoints.map(
            (snapPoint: CellSnapPoint) => {
                const templateSnapPoint = JSON.parse(
                    JSON.stringify(CUBE_SNAP_POINT)
                );
                templateSnapPoint.Y = snapPoint.left ?? 0;
                templateSnapPoint.X = snapPoint.top ?? 0;
                templateSnapPoint.Z = bb.maxDepth / 2;
                templateSnapPoint.RotationOffset = snapPoint.rotation ?? 0;
                templateSnapPoint.Tags = snapPoint.tags ?? [];
                return templateSnapPoint;
            }
        );

        if (this._collider) {
            template.Collision[0].Model = this._collider;
            template.Collision[0].Offset.Y = bb.left + (bb.right - bb.left) / 2;
            template.Collision[0].Offset.X = -(
                bb.top +
                (bb.bottom - bb.top) / 2
            );
            template.Collision[0].Scale.Y = bb.right - bb.left;
            template.Collision[0].Scale.X = bb.bottom - bb.top;
            template.Collision[0].Scale.Z = bb.maxDepth;
        } else {
            delete template.Collision;
        }

        return JSON.stringify(template, null, 4);
    }
}
