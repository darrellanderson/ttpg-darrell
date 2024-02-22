import {
    Border,
    Canvas,
    HorizontalBox,
    ImageButton,
    LayoutBox,
    Player,
    PlayerPermission,
    Rotator,
    ScreenUIElement,
    Text,
    UIElement,
    Vector,
    VerticalAlignment,
    Widget,
    refPackageId,
    world,
} from "@tabletop-playground/api";
import { WINDOW_BUTTON_ASSET, WindowParams } from "./window-params";
import { TriggerableMulticastDelegate } from "../../event/triggerable-multicast-delegate";

const packageId = refPackageId;

export class PlayerWindow {
    private static readonly WORLD_SCALE_DELTA = 0.1;
    private static readonly TITLE_HEIGHT = 30;
    private static readonly WORLD_SCALE = 2;

    private readonly _params: WindowParams;
    private readonly _playerSlot: number;

    private _scale: number = 1;
    private _target: "screen" | "world" = "screen";
    private _collapsed: boolean = false;

    private _screenUi: ScreenUIElement | undefined;
    private _worldUi: UIElement | undefined;

    public readonly onStateChanged = new TriggerableMulticastDelegate<
        () => void
    >();

    public getState(): string {
        return JSON.stringify({
            scale: this._scale,
            target: this._target,
            collapsed: this._collapsed,
            attached: this._screenUi || this._worldUi ? true : false,
        });
    }

    public applyState(state: string): void {
        const parsed = JSON.parse(state);
        this._scale = parsed.scale;
        this._target = parsed.target;
        this._collapsed = parsed.collapsed;
        if (parsed.attached) {
            this.attach();
        }
    }

    private readonly _onClickClose: (
        button: ImageButton,
        player: Player
    ) => void = (): void => {
        this.detach();
        this.onStateChanged.trigger();
    };

    private readonly _onClickCollapse: (
        button: ImageButton,
        player: Player
    ) => void = (): void => {
        this.detach();
        this._collapsed = true;
        this.attach();
        this.onStateChanged.trigger();
    };

    private readonly _onClickExpand: (
        button: ImageButton,
        player: Player
    ) => void = (): void => {
        this.detach();
        this._collapsed = false;
        this.attach();
        this.onStateChanged.trigger();
    };

    private readonly _onClickGrow: (
        button: ImageButton,
        player: Player
    ) => void = (): void => {
        this.detach();
        this._scale += PlayerWindow.WORLD_SCALE_DELTA;
        this._scale = Math.min(this._scale, 3);
        this.attach();
        this.onStateChanged.trigger();
    };

    private readonly _onClickShrink: (
        button: ImageButton,
        player: Player
    ) => void = (): void => {
        this.detach();
        this._scale -= PlayerWindow.WORLD_SCALE_DELTA;
        this._scale = Math.max(this._scale, 0.3);
        this.attach();
        this.onStateChanged.trigger();
    };

    private readonly _onClickToScreen: (
        button: ImageButton,
        player: Player
    ) => void = (): void => {
        this.detach();
        this._target = "screen";
        this.attach();
        this.onStateChanged.trigger();
    };

    private readonly _onClickToWorld: (
        button: ImageButton,
        player: Player
    ) => void = (): void => {
        this.detach();
        this._target = "world";
        this.attach();
        this.onStateChanged.trigger();
    };

    constructor(params: WindowParams, playerSlot: number) {
        this._params = params;
        this._playerSlot = playerSlot;
        this._target = params.defaultTarget ?? "screen";
    }

    getPlayerSlot(): number {
        return this._playerSlot;
    }

    private getLayoutSizes(): {
        titleHeight: number;
        spacerHeight: number;
        padding: number;
        width: number;
        height: number;
    } {
        const scale: number =
            this._scale *
            (this._target === "screen" ? 1 : PlayerWindow.WORLD_SCALE);
        const titleHeight = Math.ceil(PlayerWindow.TITLE_HEIGHT * scale);
        const spacerHeight = Math.ceil(titleHeight * 0.1);
        const padding = spacerHeight * 2;
        const width = Math.ceil(this._params.size.width * scale) + padding * 2;
        const height =
            titleHeight +
            (this._collapsed
                ? 0
                : spacerHeight +
                  Math.ceil(this._params.size.height * scale + padding * 2)) +
            padding * 2; // pad top, below title, below spacer, bottom
        return { titleHeight, spacerHeight, padding, width, height };
    }

    createWidget(): Widget {
        const { titleHeight, spacerHeight, padding, width, height } =
            this.getLayoutSizes();
        const buttonSize = titleHeight - padding;
        const fontSize = titleHeight * 0.8;

        const titleBarPanel: HorizontalBox = new HorizontalBox()
            .setChildDistance(padding)
            .setVerticalAlignment(VerticalAlignment.Center);

        const title: Text = new Text()
            .setBold(true)
            .setFontSize(fontSize)
            .setText(this._params.title ?? "");
        titleBarPanel.addChild(new Widget(), 1);

        let button: ImageButton = new ImageButton()
            .setImageSize(buttonSize, buttonSize)
            .setImage(WINDOW_BUTTON_ASSET.SHRINK, packageId);
        button.onClicked.add(this._onClickShrink);
        titleBarPanel.addChild(button, 0);

        button = new ImageButton()
            .setImageSize(buttonSize, buttonSize)
            .setImage(WINDOW_BUTTON_ASSET.GROW, packageId);
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
                .setImage(image, packageId);
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
                .setImage(image, packageId);
            button.onClicked.add(onClick);
            titleBarPanel.addChild(button, 0);
        }

        if (!this._params.disableClose) {
            const image: string = WINDOW_BUTTON_ASSET.CLOSE;
            const onClick = this._onClickClose;
            const button: ImageButton = new ImageButton()
                .setImageSize(buttonSize, buttonSize)
                .setImage(image, packageId);
            button.onClicked.add(onClick);
            titleBarPanel.addChild(button, 0);
        }

        const spacer = new Border().setColor([0, 0, 0, 0]);
        const child: Widget = this._params.createWidget(
            this._scale *
                (this._target === "screen" ? 1 : PlayerWindow.WORLD_SCALE)
        );
        const window: Canvas = new Canvas()
            .addChild(new Border(), 0, 0, width, height)
            .addChild(
                title,
                padding,
                -padding * 0.5,
                width,
                titleHeight + padding * 2
            )
            .addChild(
                titleBarPanel,
                padding,
                0,
                width - padding * 2,
                titleHeight + padding * 2
            );
        if (!this._collapsed) {
            window
                .addChild(
                    spacer,
                    0,
                    titleHeight + padding * 2,
                    width,
                    spacerHeight
                )
                .addChild(
                    child,
                    padding,
                    titleHeight + spacerHeight + padding * 3,
                    width - padding * 2,
                    height - titleHeight - spacerHeight - padding * 4
                );
        }
        const windowBox = new LayoutBox()
            .setOverrideWidth(width)
            .setOverrideHeight(height)
            .setChild(window);

        return windowBox;
    }

    attach(): this {
        this.detach();

        // Screen UI does not exist for VR players.
        const player: Player | undefined = world.getPlayerBySlot(
            this._playerSlot
        );
        if (player?.isUsingVR()) {
            this._target = "world";
        }

        const { width, height } = this.getLayoutSizes();

        if (this._target === "screen") {
            const ui = new ScreenUIElement();
            this._screenUi = ui;

            ui.anchorX = this._params.screen?.anchor.x || 0.5;
            ui.anchorY = this._params.screen?.anchor.y || 0.5;

            ui.relativePositionX = true;
            ui.relativePositionY = true;
            ui.positionX = this._params.screen?.pos.u ?? 0;
            ui.positionY = this._params.screen?.pos.v ?? 0;

            ui.relativeWidth = false;
            ui.relativeHeight = false;
            ui.width = width;
            ui.height = height;

            ui.players = new PlayerPermission().setPlayerSlots([
                this._playerSlot,
            ]);
            ui.widget = this.createWidget();

            world.addScreenUI(ui);
        } else {
            const ui = new UIElement();
            this._worldUi = ui;

            ui.anchorX = this._params.world?.anchor.x ?? 0.5;
            ui.anchorY = this._params.world?.anchor.y ?? 0.5;

            if (Array.isArray(this._params.world?.pos)) {
                const [x, y, z]: [x: number, y: number, z: number] =
                    this._params.world.pos;
                ui.position = new Vector(x, y, z);
            } else if (this._params.world?.pos) {
                ui.position = this._params.world.pos;
            } else {
                ui.position = new Vector(0, 0, world.getTableHeight() + 3);
            }

            if (Array.isArray(this._params.world?.rot)) {
                const [pitch, yaw, roll]: [
                    pitch: number,
                    yaw: number,
                    roll: number,
                ] = this._params.world.rot;
                ui.rotation = new Rotator(pitch, yaw, roll);
            } else if (this._params.world?.rot) {
                ui.rotation = this._params.world.rot;
            } else {
                ui.rotation = new Rotator(0, 0, 0);
            }

            ui.scale = 1 / PlayerWindow.WORLD_SCALE;
            ui.width = width;
            ui.height = height;
            ui.useWidgetSize = false;

            ui.players = new PlayerPermission().setPlayerSlots([
                this._playerSlot,
            ]);
            ui.widget = this.createWidget();

            world.addUI(ui);
        }
        return this;
    }

    detach(): this {
        if (this._screenUi) {
            world.removeScreenUIElement(this._screenUi);
            this._screenUi = undefined;
        }
        if (this._worldUi) {
            world.removeUIElement(this._worldUi);
            this._worldUi = undefined;
        }
        return this;
    }
}
