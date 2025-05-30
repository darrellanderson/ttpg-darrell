import { Rotator, Vector, Widget } from "@tabletop-playground/api";

export const WINDOW_BUTTON_ASSET = {
    CLOSE: "ui/window/close.png",
    COLLAPSE: "ui/window/collapse.png",
    EXPAND: "ui/window/expand.png",
    GROW: "ui/window/grow.png",
    SHRINK: "ui/window/shrink.png",
    TO_SCREEN: "ui/window/to-screen.png",
    TO_WORLD: "ui/window/to-world.png",
} as const;

/**
 * Wrapper around a widget, created before attaching to a window and
 * destroyed after detaching.  The IWindowWidget is not reused, will
 * create a new one if needed.
 */
export interface IWindowWidget {
    create(params: WindowWidgetParams): Widget;
    destroy(): void;
}

export type WindowWidgetParams = {
    scale: number;
    fontSize: number; // suggested
    spacing: number; // suggested
    playerSlot: number;
    windowSize: {
        width: number;
        height: number;
    };
    close: () => void;
};

export type WindowParams = {
    title?: string;

    disableClose?: boolean;
    disableCollapse?: boolean;
    disableWarpScreenWorld?: boolean;

    size: {
        width: number;
        height: number;
    };

    defaultTarget?: "screen" | "world";

    screen?: {
        anchor: {
            u: number;
            v: number;
        };
        pos: {
            u: number;
            v: number;
        };
    };

    world?: {
        anchor: {
            u: number;
            v: number;
        };
        playerSlotToTransform: {
            [key: number]: {
                pos: [x: number, y: number, z: number] | Vector;
                rot: [pitch: number, yaw: number, roll: number] | Rotator;
            };
        };
    };

    windowWidgetGenerator: () => IWindowWidget;

    // Show a global context menu item to show/hide per-player windows.
    addToggleMenuItem?: boolean;
    addToggleMenuTooltip?: string;
};
