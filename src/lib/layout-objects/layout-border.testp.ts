import { Vector } from "@tabletop-playground/api";
import { LayoutBorder } from "./layout-border";
import { LayoutObjects } from "./layout-objects";

console.log("layout-border.testp.ts");

const layout = new LayoutObjects().setChildDistance(1);

const a = new LayoutObjects().setOverrideWidth(1).setOverrideHeight(2);
const ab = new LayoutBorder(a, 1).setOutlineWidth(1);
layout.add(ab);

const b = new LayoutObjects().setOverrideWidth(1).setOverrideHeight(2);
const bb = new LayoutBorder(b, 1).setOutlineWidth(1);
layout.add(bb);

layout.doLayoutAtPoint(new Vector(0, 0, 0), 0);

console.log(JSON.stringify(a.calculateSize()));
console.log(JSON.stringify(ab.calculateSize()));

console.log(JSON.stringify(b.calculateSize()));
console.log(JSON.stringify(bb.calculateSize()));
