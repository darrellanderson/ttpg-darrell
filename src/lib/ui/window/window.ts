import { WindowParams } from "./window-params";

/**
 * UI, normally presented in screen space with the option to warp to world
 * (starts in world for VR players).  Optionally allow collapse, close.
 */
export class Window {
    private readonly _params: WindowParams;

    constructor(params: WindowParams) {
        this._params = params;
    }

    attach(): this {
        // TODO XXX
        return this;
    }

    detach(): this {
        // TODO XXX
        return this;
    }
}
