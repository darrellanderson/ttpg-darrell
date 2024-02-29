import { world } from "@tabletop-playground/api";
import { TriggerableMulticastDelegate } from "../../event/triggerable-multicast-delegate/triggerable-multicast-delegate";
import { NamespaceId } from "../../namespace-id/namespace-id";
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

    constructor(
        params: WindowParams,
        playerSlots: Array<number>,
        persistenceKey?: NamespaceId
    ) {
        // Create (unattached) per-player windows.
        this._playerWindows = playerSlots.map(
            (playerSlot) => new PlayerWindow(params, playerSlot)
        );

        // Listen for per-player window changes, escalate to our event.
        for (const playerWindow of this._playerWindows) {
            playerWindow.onStateChanged.add(() => {
                this.onStateChanged.trigger();
            });
        }

        if (persistenceKey) {
            // Save persistent data on state change.
            this.onStateChanged.add(() => {
                const state: string = this.getState();
                world.setSavedData(state, persistenceKey);
            });

            // Apply any persistent data.
            const state: string = world.getSavedData(persistenceKey);
            if (state && state.length > 0) {
                this.applyState(state);
            }
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
