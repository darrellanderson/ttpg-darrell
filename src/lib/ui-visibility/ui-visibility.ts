import {
    GameObject,
    PlayerPermission,
    ScreenUIElement,
    UIElement,
    world,
} from "@tabletop-playground/api";

/**
 * Set or toggle per-player visibility.
 */
export class UiVisibility {
    private readonly _ui: UIElement | ScreenUIElement;
    private readonly _obj: GameObject | undefined;
    private _visibleToPlayerSlots: number[] = [];

    constructor(ui: UIElement | ScreenUIElement, obj?: GameObject) {
        // Make sure widget is ready.
        if (!ui.widget) {
            throw new Error("UiVisibility: ui.widget not set");
        }

        this._ui = ui;
        this._obj = obj;
        this._visibleToPlayerSlots = [...Array(20).keys()];

        ui.players = this.getPlayerPermission();
    }

    getPlayerPermission(): PlayerPermission {
        return new PlayerPermission().setPlayerSlots(
            this._visibleToPlayerSlots
        );
    }

    isVisibleToPlayer(playerSlot: number) {
        return this._visibleToPlayerSlots.includes(playerSlot);
    }

    setAll(): this {
        this._visibleToPlayerSlots = [...Array(20).keys()];
        this._update();
        return this;
    }

    setNone(): this {
        this._visibleToPlayerSlots = [];
        this._update();
        return this;
    }

    setOnlyThisPlayer(playerSlot: number): this {
        this._visibleToPlayerSlots = [playerSlot];
        this._update();
        return this;
    }

    togglePlayer(playerSlot: number): this {
        const index = this._visibleToPlayerSlots.indexOf(playerSlot);
        if (index >= 0) {
            this._visibleToPlayerSlots.splice(index, 1);
        } else {
            this._visibleToPlayerSlots.push(playerSlot);
        }
        this._update();
        return this;
    }

    private _update(): void {
        this._ui.widget.setVisible(this._visibleToPlayerSlots.length > 0);
        this._ui.players = this.getPlayerPermission();
        if (this._ui instanceof ScreenUIElement) {
            world.updateScreenUI(this._ui);
        } else {
            if (this._obj) {
                this._obj.updateUI(this._ui);
            } else {
                world.updateUI(this._ui);
            }
        }
    }
}
