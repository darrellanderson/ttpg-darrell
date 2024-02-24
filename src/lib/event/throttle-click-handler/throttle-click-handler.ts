import { Player } from "@tabletop-playground/api";

export class ThrottleClickHandler<T> {
    public static readonly THROTTLE_MSECS = 300;

    private readonly _playerSlotToLastClickMsecs: { [key: number]: number } =
        {};
    private readonly _clickHandler: (button: T, player: Player) => void;

    private readonly _throttledHandler = (button: T, player: Player): void => {
        const playerSlot: number = player.getSlot();
        const lastClickMsecs: number =
            this._playerSlotToLastClickMsecs[playerSlot] ?? 0;

        // Throttle if same player clicked again too soon.
        const nowMsecs = Date.now();
        if (nowMsecs < lastClickMsecs + ThrottleClickHandler.THROTTLE_MSECS) {
            return;
        }
        this._playerSlotToLastClickMsecs[playerSlot] = nowMsecs;

        this._clickHandler(button, player);
    };

    constructor(clickHandler: (button: T, player: Player) => void) {
        this._clickHandler = clickHandler;
    }

    get(): (button: T, player: Player) => void {
        return this._throttledHandler;
    }
}
