import { Player, globalEvents, world } from "@tabletop-playground/api";
import { TriggerableMulticastDelegate } from "../../event/triggerable-multicast-delegate/triggerable-multicast-delegate";
import { NamespaceId } from "../../namespace-id/namespace-id";
import { PlayerWindow } from "./player-window";
import { WindowParams } from "./window-params";

/**
 * UI, normally presented in screen space with the option to warp to world
 * (starts in world for VR players).  Optionally allow collapse, close.
 */
export class Window {
    private readonly _windowName: string | undefined;
    private readonly _playerWindows: Array<PlayerWindow>;

    /**
     * Called when window state changes (zoom-in, zoom-out, close, etc).
     */
    public readonly onStateChanged = new TriggerableMulticastDelegate<
        () => void
    >();

    public readonly onAllClosed = new TriggerableMulticastDelegate<
        () => void
    >();

    private readonly _customActionName: string;
    private readonly _customActionHandler = (
        clickingPlayer: Player,
        identifier: string
    ): void => {
        if (identifier === this._customActionName) {
            for (const playerWindow of this._playerWindows) {
                if (playerWindow.getPlayerSlot() === clickingPlayer.getSlot()) {
                    playerWindow.toggle();
                }
            }
        }
    };

    _getState(): string | undefined {
        const playerSlotToState: { [key: number]: string } = {};
        let hasState: boolean = false;

        for (const playerWindow of this._playerWindows) {
            const playerSlot: number = playerWindow.getPlayerSlot();
            const state: string | undefined = playerWindow._getState();
            if (state) {
                playerSlotToState[playerSlot] = state;
                hasState = true;
            }
        }
        return hasState ? JSON.stringify(playerSlotToState) : undefined;
    }

    _applyState(state: string): void {
        if (state.length === 0) {
            return;
        }
        const playerSlotToState: { [key: number]: string } = JSON.parse(state);
        for (const playerWindow of this._playerWindows) {
            const playerSlot: number = playerWindow.getPlayerSlot();
            const playerState: string | undefined =
                playerSlotToState[playerSlot];
            if (playerState) {
                playerWindow._applyState(playerState);
            }
        }
    }

    /**
     * Constructor.
     *
     * If persistenceKey is provided, the window top-level state will be saved
     * and restored.  Window contents state is NOT persisted, caller should
     * listen for state changes and persist as needed.
     *
     * @param params
     * @param playerSlots : which players should see this window
     * @param persistenceKey : optional, save window state
     */
    constructor(
        params: WindowParams,
        playerSlots: Array<number>,
        persistenceKey?: NamespaceId
    ) {
        this._windowName = params.title;
        this._customActionName = `*Toggle ${this._windowName}`;

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
                const state: string = this._getState() ?? "";
                world.setSavedData(state, persistenceKey);
            });

            // Apply any persistent data.
            const state: string = world.getSavedData(persistenceKey);
            if (state && state.length > 0) {
                this._applyState(state);
            }
        }

        // Event all windows are closed, either by players or by detach here.
        this.onStateChanged.add(() => {
            const state: string = this._getState() ?? "";
            if (state.length === 0) {
                this.onAllClosed.trigger();
            }
        });

        if (params.addToggleMenuItem) {
            this.addGlobalContextMenuToggle();
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

    destroy(): void {
        this.detach();
        world.removeCustomAction(this._customActionName);
        globalEvents.onCustomAction.remove(this._customActionHandler);
    }

    reset(playerSlots: Array<number>): this {
        for (const playerWindow of this._playerWindows) {
            if (playerSlots.includes(playerWindow.getPlayerSlot())) {
                // If open, close and re-open to recreate.
                // If closed, open and close again (same frame so not visible).
                playerWindow.toggle();
                playerWindow.toggle();
            }
        }
        return this;
    }

    addGlobalContextMenuToggle(): this {
        if (!this._windowName) {
            throw new Error("must have a window name");
        }
        const actionName: string = `*Toggle ${this._windowName}`;
        world.addCustomAction(actionName, "show/hide the window");

        globalEvents.onCustomAction.add(this._customActionHandler);

        return this;
    }
}
