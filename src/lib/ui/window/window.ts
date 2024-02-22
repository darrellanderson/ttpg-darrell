import { TriggerableMulticastDelegate } from "../../event/triggerable-multicast-delegate";
import { PlayerWindow } from "./player-window";
import { WindowParams } from "./window-params";

/**
 * UI, normally presented in screen space with the option to warp to world
 * (starts in world for VR players).  Optionally allow collapse, close.
 */
export class Window {
    private readonly _playerWindows: Array<PlayerWindow>;

    /**
     * Called when window state changes (zoom-in, zoom-out, close, etc).
     */
    public readonly onStateChanged = new TriggerableMulticastDelegate<
        () => void
    >();

    public getState(): string {
        const playerSlotToState: { [key: number]: string } = {};
        for (const playerWindow of this._playerWindows) {
            const playerSlot: number = playerWindow.getPlayerSlot();
            const state: string = playerWindow.getState();
            playerSlotToState[playerSlot] = state;
        }
        return JSON.stringify(playerSlotToState);
    }

    public applyState(state: string): void {
        if (state.length === 0) {
            return;
        }
        const playerSlotToState: { [key: number]: string } = JSON.parse(state);
        for (const playerWindow of this._playerWindows) {
            const playerSlot: number = playerWindow.getPlayerSlot();
            const state: string | undefined = playerSlotToState[playerSlot];
            if (state) {
                playerWindow.applyState(state);
            }
        }
    }

    constructor(params: WindowParams, playerSlots: Array<number>) {
        this._playerWindows = playerSlots.map(
            (playerSlot) => new PlayerWindow(params, playerSlot)
        );
        for (const playerWindow of this._playerWindows) {
            playerWindow.onStateChanged.add(() => {
                this.onStateChanged.trigger();
            });
        }
    }

    attach(): this {
        for (const playerWindow of this._playerWindows) {
            playerWindow.attach();
        }
        this.onStateChanged.trigger();
        return this;
    }

    detach(): this {
        for (const playerWindow of this._playerWindows) {
            playerWindow.detach();
        }
        this.onStateChanged.trigger();
        return this;
    }
}
