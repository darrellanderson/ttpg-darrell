import {
    Button,
    Player,
    ScreenUIElement,
    UIElement,
} from "@tabletop-playground/api";
import { WindowParams } from "./window-params";
export class PlayerWindow {
    private readonly _params: WindowParams;
    private readonly _playerSlot: number;

    private _screenUi: ScreenUIElement | undefined;
    private _worldUi: UIElement | undefined;

    private readonly _onClickClose = (button: Button, player: Player): void => {
        // TODO XXX
    };
    private readonly _onClickExpand = (
        button: Button,
        player: Player
    ): void => {
        // TODO XXX
    };
    private readonly _onClickExpand = (
        button: Button,
        player: Player
    ): void => {
        // TODO XXX
    };
    private readonly _onClickGrow = (button: Button, player: Player): void => {
        // TODO XXX
    };
    private readonly _onClickShrink = (
        button: Button,
        player: Player
    ): void => {
        // TODO XXX
    };
    private readonly _onClickToScreen = (
        button: Button,
        player: Player
    ): void => {
        // TODO XXX
    };
    private readonly _onClickToWorld = (
        button: Button,
        player: Player
    ): void => {
        // TODO XXX
    };

    constructor(params: WindowParams, playerSlot: number) {
        this._params = params;
        this._playerSlot = playerSlot;
    }
}
