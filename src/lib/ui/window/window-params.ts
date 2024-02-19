import { Rotator, Vector, Widget } from "@tabletop-playground/api";

export const WINDOW_BUTTON_ASSET = {
    CLOSE: "ui/window/close.png",
    COLLAPSE: "ui/window/collapse.png",
    EXPAND: "ui/window/expand.png",
    GROW: "ui/window/grow.png",
    SHRINK: "ui/window/shrink.png",
    TO_SCREEN: "ui/window/to-screen.png",
    TO_WORLD: "ui/window/to-window.png",
} as const;

export type WindowParams = {
    title?: string;

    disableClose?: boolean;
    diableCollapse?: boolean;
    diableWarpScreenWorld?: boolean;

    size: {
        width: number;
        height: number;
    };

    screenAnchor?: {
        u?: number;
        v?: number;
        x: number;
        y: number;
    };

    worldAnchor?: {
        u?: number;
        v?: number;
        pos: [x: number, y: number, z: number] | Vector;
        rot?: [pitch: number, yaw: number, roll: number] | Rotator;
    };

    createWidget: (scale: number) => Widget;
};
