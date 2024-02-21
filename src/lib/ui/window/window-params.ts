import { Rotator, Vector, Widget } from "@tabletop-playground/api";

export const WINDOW_BUTTON_ASSET = {
    CLOSE: "ui/window/close.jpg",
    COLLAPSE: "ui/window/collapse.jpg",
    EXPAND: "ui/window/expand.jpg",
    GROW: "ui/window/grow.jpg",
    SHRINK: "ui/window/shrink.jpg",
    TO_SCREEN: "ui/window/to-screen.jpg",
    TO_WORLD: "ui/window/to-world.jpg",
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

    defaultTarget?: "screen" | "world";

    screen?: {
        anchor: {
            x: number;
            y: number;
        };
        pos: {
            u: number;
            v: number;
        };
    };

    world?: {
        anchor: {
            x: number;
            y: number;
        };
        pos: [x: number, y: number, z: number] | Vector;
        rot?: [pitch: number, yaw: number, roll: number] | Rotator;
    };

    createWidget: (scale: number) => Widget;
};
