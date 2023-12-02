import {
  GameObject,
  HorizontalAlignment,
  Rotator,
  Vector,
  VerticalAlignment,
} from "@tabletop-playground/api";
import { TriggerableMulticastDelegate } from "../triggerable-multicast-delegate/triggerable-multicast-delegate";

export type LayoutObjectsSize = {
  w: number;
  h: number;
};

export class LayoutObjects {
  private _children: (GameObject | LayoutObjects)[] = [];

  private _horizontalAlignment: number = HorizontalAlignment.Center;
  private _verticalAlignment: number = VerticalAlignment.Center;
  private _childDistance: number = 0;
  private _isVertical: boolean = false;

  private _overrideHeight: number = 0;
  private _overrideWidth: number = 0;

  private _layoutCenter: Vector = new Vector(0, 0, 0);

  public readonly afterLayout = new TriggerableMulticastDelegate();

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

  add(item: GameObject | LayoutObjects): this {
    this._children.push(item);
    return this;
  }

  flip(flipH: boolean, flipV: boolean): this {
    // Children.
    if ((flipH && !this._isVertical) || (flipV && this._isVertical)) {
      this._children.reverse();
    }

    // Layout.
    if (flipH) {
      if (this._horizontalAlignment === HorizontalAlignment.Left) {
        this._horizontalAlignment = HorizontalAlignment.Right;
      } else if (this._horizontalAlignment === HorizontalAlignment.Right) {
        this._horizontalAlignment = HorizontalAlignment.Left;
      }
    }
    if (flipV) {
      if (this._verticalAlignment === VerticalAlignment.Top) {
        this._verticalAlignment = VerticalAlignment.Bottom;
      } else if (this._verticalAlignment === VerticalAlignment.Bottom) {
        this._verticalAlignment = VerticalAlignment.Top;
      }
    }

    // Recurse.
    for (const child of this._children) {
      if (child instanceof LayoutObjects) {
        child.flip(flipH, flipV);
      }
    }
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
      const childSize: LayoutObjectsSize =
        LayoutObjects._calculateChildSize(child);
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

  static _calculateChildSize(
    child: GameObject | LayoutObjects
  ): LayoutObjectsSize {
    let childSize: LayoutObjectsSize;
    if (child instanceof GameObject) {
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
    this._layoutCenter = center;

    const overrideSize = this.calculateSize();
    const childrenSize = this.calculateChildrenSize();

    // Position accounting for override size.
    let padLeft: number;
    let padTop: number;
    if (this._horizontalAlignment === HorizontalAlignment.Left) {
      padLeft = 0;
    } else if (this._horizontalAlignment === HorizontalAlignment.Right) {
      padLeft = overrideSize.w - childrenSize.w;
    } else {
      padLeft = (overrideSize.w - childrenSize.w) / 2; // center (even if "Fill")
    }
    if (this._verticalAlignment === VerticalAlignment.Top) {
      padTop = 0;
    } else if (this._verticalAlignment === VerticalAlignment.Bottom) {
      padTop = overrideSize.h - childrenSize.h;
    } else {
      padTop = (overrideSize.h - childrenSize.h) / 2; // center (even if "Fill")
    }

    let left = -overrideSize.w / 2 + padLeft;
    let top = overrideSize.h / 2 - padTop;

    for (const child of this._children) {
      const childSize: LayoutObjectsSize =
        LayoutObjects._calculateChildSize(child);

      // Apply layout in row/col.
      padLeft = 0;
      padTop = 0;
      if (this._isVertical) {
        if (this._horizontalAlignment === HorizontalAlignment.Left) {
          padLeft = 0;
        } else if (this._horizontalAlignment === HorizontalAlignment.Right) {
          padLeft = childrenSize.w - childSize.w;
        } else {
          padLeft = (childrenSize.w - childSize.w) / 2; // center (even if "Fill")
        }
      } else {
        if (this._verticalAlignment === VerticalAlignment.Top) {
          padTop = 0;
        } else if (this._verticalAlignment === VerticalAlignment.Bottom) {
          padTop = childrenSize.h - childSize.h;
        } else {
          padTop = (childrenSize.h - childSize.h) / 2; // center (even if "Fill")
        }
      }

      // Calculate child center (world).
      const childCenter = new Vector(
        top - childSize.h / 2 - padTop,
        left + childSize.w / 2 + padLeft,
        0
      )
        .rotateAngleAxis(yaw, [0, 0, 1])
        .add(center);

      // Position child.
      if (child instanceof GameObject) {
        child.setPosition(childCenter);
        child.setRotation(child.getRotation().compose([0, yaw, 0]));
        child.snapToGround();
      } else {
        child.doLayoutAtPoint(childCenter, yaw);
      }

      // Move "cursor" to next open spot top-left.
      if (this._isVertical) {
        top -= childSize.h + this._childDistance;
      } else {
        left += childSize.w + this._childDistance;
      }
    }

    this.afterLayout.trigger();

    return this;
  }

  getCenter(): Vector {
    return this._layoutCenter;
  }

  layoutLeftOf(peer: GameObject, gap: number): this {
    const peerSize = LayoutObjects._calculateChildSize(peer);
    const size = this.calculateSize();
    const center = peer
      .getPosition()
      .subtract([(peerSize.w + size.w) / 2 + gap, 0, 0]);
    this.doLayoutAtPoint(center, 0);
    return this;
  }

  layoutRightOf(peer: GameObject, gap: number): this {
    const peerSize = LayoutObjects._calculateChildSize(peer);
    const size = this.calculateSize();
    const center = peer
      .getPosition()
      .add([(peerSize.w + size.w) / 2 + gap, 0, 0]);
    this.doLayoutAtPoint(center, 0);
    return this;
  }

  layoutAbove(peer: GameObject, gap: number): this {
    const peerSize = LayoutObjects._calculateChildSize(peer);
    const size = this.calculateSize();
    const center = peer
      .getPosition()
      .add([0, (peerSize.h + size.w) / 2 + gap, 0]);
    this.doLayoutAtPoint(center, 0);
    return this;
  }

  layoutBelow(peer: GameObject, gap: number): this {
    const peerSize = LayoutObjects._calculateChildSize(peer);
    const size = this.calculateSize();
    const center = peer
      .getPosition()
      .subtract([0, (peerSize.h + size.w) / 2 + gap, 0]);
    this.doLayoutAtPoint(center, 0);
    return this;
  }
}
