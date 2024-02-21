import { PlayerWindow } from "./player-window";
import { WindowParams } from "./window-params";

/**
 * UI, normally presented in screen space with the option to warp to world
 * (starts in world for VR players).  Optionally allow collapse, close.
 */
export class Window {
    private readonly _playerWindows: Array<PlayerWindow>;

    constructor(params: WindowParams, playerSlots: Array<number>) {
        this._playerWindows = playerSlots.map(
            (playerSlot) => new PlayerWindow(params, playerSlot)
        );
    }

    attach(): this {
        for (const playerWindow of this._playerWindows) {
            playerWindow.attach();
        }
        return this;
    }

    detach(): this {
        for (const playerWindow of this._playerWindows) {
            playerWindow.detach();
        }
        return this;
    }
}
