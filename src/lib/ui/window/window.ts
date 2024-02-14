import { Widget } from "@tabletop-playground/api";

export type WindowWidgetGenerator = (scale: number) => Widget;
export type WindowSize = { width: number; height: number };

/**
 * UI, normally presented in screen space with the option to warp to world
 * (starts in world for VR players).  Optionally allow collapse, close.
 */
export class Window {
    private readonly _title: string;
    private readonly _widgetGenerator: WindowWidgetGenerator;

    constructor(
        title: string,
        size: WindowSize,
        widgetGenerator: WindowWidgetGenerator
    ) {
        this._title = title;
        this._widgetGenerator = widgetGenerator;
    }
}
