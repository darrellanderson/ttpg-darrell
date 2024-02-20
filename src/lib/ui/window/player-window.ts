import {
    HorizontalBox,
    ImageButton,
    LayoutBox,
    Player,
    ScreenUIElement,
    Text,
    UIElement,
    Widget,
} from "@tabletop-playground/api";
import { WINDOW_BUTTON_ASSET, WindowParams } from "./window-params";

export class PlayerWindow {
    private static SCALE_DELTA = 0.1;
    private static TITLE_HEIGHT = 20;

    private readonly _params: WindowParams;
    private readonly _playerSlot: number;

    private _scale: number = 1;
    private _target: "screen" | "world" = "screen";
    private _collapsed: boolean = false;

    private _screenUi: ScreenUIElement | undefined;
    private _worldUi: UIElement | undefined;

    private readonly _onClickClose: (
        button: ImageButton,
        player: Player
    ) => void = (): void => {
        this.detach();
    };

    private readonly _onClickCollapse: (
        button: ImageButton,
        player: Player
    ) => void = (): void => {
        this.detach();
        this._collapsed = true;
        this.attach();
    };

    private readonly _onClickExpand: (
        button: ImageButton,
        player: Player
    ) => void = (): void => {
        this.detach();
        this._collapsed = false;
        this.attach();
    };

    private readonly _onClickGrow: (
        button: ImageButton,
        player: Player
    ) => void = (): void => {
        this.detach();
        this._scale += PlayerWindow.SCALE_DELTA;
        this._scale = Math.min(this._scale, 3);
        this.attach();
    };

    private readonly _onClickShrink: (
        button: ImageButton,
        player: Player
    ) => void = (): void => {
        this.detach();
        this._scale -= PlayerWindow.SCALE_DELTA;
        this._scale = Math.max(this._scale, 0.3);
        this.attach();
    };

    private readonly _onClickToScreen: (
        button: ImageButton,
        player: Player
    ) => void = (): void => {
        this.detach();
        this._target = "screen";
        this.attach();
    };

    private readonly _onClickToWorld: (
        button: ImageButton,
        player: Player
    ) => void = (): void => {
        this.detach();
        this._target = "world";
        this.attach();
    };

    constructor(params: WindowParams, playerSlot: number) {
        this._params = params;
        this._playerSlot = playerSlot;
    }

    createWidger(): Widget {
        const padding = Math.round(PlayerWindow.TITLE_HEIGHT * 0.1);
        const buttonSize = PlayerWindow.TITLE_HEIGHT - padding * 2;
        const fontSize = Math.round(buttonSize * 0.9);
        const spacing = padding * 2;

        const titleBarPanel: HorizontalBox =
            new HorizontalBox().setChildDistance(spacing);
        const titleBar: Widget = new LayoutBox()
            .setPadding(padding, padding, padding, padding)
            .setChild(titleBarPanel);

        const title: Text = new Text()
            .setFontSize(fontSize)
            .setText(this._params.title ?? "");
        titleBarPanel.addChild(title, 1);

        let button: ImageButton = new ImageButton()
            .setImageSize(buttonSize, buttonSize)
            .setImage(WINDOW_BUTTON_ASSET.SHRINK);
        button.onClicked.add(this._onClickShrink);
        titleBarPanel.addChild(button, 0);

        button = new ImageButton()
            .setImageSize(buttonSize, buttonSize)
            .setImage(WINDOW_BUTTON_ASSET.GROW);
        button.onClicked.add(this._onClickGrow);
        titleBarPanel.addChild(button, 0);

        if (!this._params.diableWarpScreenWorld) {
            const image: string =
                this._target === "screen"
                    ? WINDOW_BUTTON_ASSET.TO_WORLD
                    : WINDOW_BUTTON_ASSET.TO_SCREEN;
            const onClick =
                this._target === "screen"
                    ? this._onClickToWorld
                    : this._onClickToScreen;
            const button: ImageButton = new ImageButton()
                .setImageSize(buttonSize, buttonSize)
                .setImage(image);
            button.onClicked.add(onClick);
            titleBarPanel.addChild(button, 0);
        }

        if (!this._params.diableCollapse) {
            const image: string = this._collapsed
                ? WINDOW_BUTTON_ASSET.EXPAND
                : WINDOW_BUTTON_ASSET.COLLAPSE;
            const onClick = this._collapsed
                ? this._onClickExpand
                : this._onClickCollapse;
            const button: ImageButton = new ImageButton()
                .setImageSize(buttonSize, buttonSize)
                .setImage(image);
            button.onClicked.add(onClick);
            titleBarPanel.addChild(button, 0);
        }

        if (!this._params.disableClose) {
            const image: string = WINDOW_BUTTON_ASSET.CLOSE;
            const onClick = this._onClickClose;
            const button: ImageButton = new ImageButton()
                .setImageSize(buttonSize, buttonSize)
                .setImage(image);
            button.onClicked.add(onClick);
            titleBarPanel.addChild(button, 0);
        }

        return titleBar;
    }

    attach(): void {}

    detach(): void {
        // TODO XXX
    }
}
