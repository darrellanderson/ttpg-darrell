import {
  HorizontalAlignment,
  Rotator,
  StaticObject,
  Vector,
  VerticalAlignment,
} from "@tabletop-playground/api";

export type LayoutObjectsSize = {
  w: number;
  h: number;
};

export class LayoutObjects {
  private _children: (StaticObject | LayoutObjects)[] = [];

  private _horizontalAlignment: number = HorizontalAlignment.Center;
  private _verticalAlignment: number = VerticalAlignment.Center;
  private _childDistance: number = 0;
  private _isVertical: boolean = false;

  private _overrideHeight: number = 0;
  private _overrideWidth: number = 0;

  constructor() {}

  setChildDistanace(value: number): this {
    this._childDistance = value;
    return this;
  }

  setHorizontalAlignment(value: number): this {
    this._horizontalAlignment = value;
    return this;
  }

  setVerticalAlignment(value: number): this {
    this._verticalAlignment = value;
    return this;
  }

  setIsVertical(value: boolean): this {
    this._isVertical = value;
    return this;
  }

  setOverrideHeight(value: number): this {
    this._overrideHeight = value;
    return this;
  }

  setOverrideWidth(value: number): this {
    this._overrideWidth = value;
    return this;
  }

  // ----------------------------------

  add(item: StaticObject | LayoutObjects): this {
    this._children.push(item);
    return this;
  }

  /**
   * Get size of self, applying any overrides.
   *
   * @returns {LayoutObjectsSize}
   */
  calculateSize(): LayoutObjectsSize {
    let size = this.calculateChildrenSize();
    if (this._overrideHeight > 0) {
      size.h = this._overrideHeight;
    }
    if (this._overrideWidth > 0) {
      size.w = this._overrideWidth;
    }
    return size;
  }

  /**
   * Get size from laying out children (ignore override on self).
   *
   * @returns {LayoutObjectsSize}
   */
  calculateChildrenSize(): LayoutObjectsSize {
    const size: LayoutObjectsSize = { w: 0, h: 0 };

    // Account for child distance.
    const spacing: number =
      Math.max(this._children.length - 1, 0) * this._childDistance;
    if (this._isVertical) {
      size.h = spacing;
    } else {
      size.w = spacing;
    }

    // Apply each child.
    for (const child of this._children) {
      const childSize: LayoutObjectsSize = this._calculateChildSize(child);
      if (this._isVertical) {
        size.w = Math.max(size.w, childSize.w);
        size.h += childSize.h;
      } else {
        size.h = Math.max(size.h, childSize.h);
        size.w += childSize.w;
      }
    }

    return size;
  }

  _calculateChildSize(child: StaticObject | LayoutObjects): LayoutObjectsSize {
    let childSize: LayoutObjectsSize;
    if (child instanceof StaticObject) {
      const currentRotation = true;
      const includeGeometry = false;
      const extent: Vector = child.getExtent(currentRotation, includeGeometry);
      childSize = { w: extent.y * 2, h: extent.x * 2 };
    } else {
      childSize = child.calculateSize();
    }
    return childSize;
  }

  doLayoutAtPoint(center: Vector, yaw: number): this {
    const size = this.calculateSize();
    const childrenSize = this.calculateChildrenSize();

    let padLeft: number;
    if (this._horizontalAlignment === HorizontalAlignment.Left) {
      padLeft = 0;
    } else if (this._horizontalAlignment === HorizontalAlignment.Right) {
      padLeft = size.w - childrenSize.w;
    } else {
      padLeft = (size.w - childrenSize.w) / 2; // center (even if "Fill")
    }

    let padTop: number;
    if (this._verticalAlignment === VerticalAlignment.Top) {
      padTop = 0;
    } else if (this._verticalAlignment === VerticalAlignment.Bottom) {
      padTop = size.w - childrenSize.w;
    } else {
      padTop = (size.w - childrenSize.w) / 2; // center (even if "Fill")
    }

    let left = -size.w / 2 + padLeft;
    let top = -size.h / 2 + padTop;

    for (const child of this._children) {
      const childSize: LayoutObjectsSize = this._calculateChildSize(child);

      // Calculate child center (world).
      const childCenter = new Vector(
        top + childSize.h / 2,
        left + childSize.w / 2,
        0
      )
        .rotateAngleAxis(yaw, [0, 0, 1])
        .add(center);

      // Position child.
      if (child instanceof StaticObject) {
        child.setPosition(childCenter);
        child.setRotation(child.getRotation().compose([0, yaw, 0]));
      } else {
        child.doLayoutAtPoint(childCenter, yaw);
      }

      // Move "cursor" to next open spot top-left.
      if (this._isVertical) {
        top += childSize.h + this._childDistance;
      } else {
        left += childSize.w + this._childDistance;
      }
    }

    return this;
  }
}
