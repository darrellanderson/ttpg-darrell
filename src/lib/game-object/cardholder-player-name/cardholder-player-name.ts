import {
    Border,
    Button,
    CardHolder,
    Color,
    Player,
    Text,
    TextJustification,
    UIElement,
    UIPresentationStyle,
    Vector,
    Widget,
    WidgetSwitcher,
    globalEvents,
    world,
} from "@tabletop-playground/api";

/**
 * Display player name above-and-behind the card holder.
 * Show a "take seat" button when no player in slot.
 */
export class CardHolderPlayerName {
    public static readonly DEFAULT_FONT_SIZE = 30;

    private readonly _cardHolder: CardHolder;
    private readonly _nameText: Text;
    private readonly _nameBorder: Border;
    private readonly _takeSeatButton: Button;
    private readonly _widgetSwitcher: WidgetSwitcher;
    private readonly _ui: UIElement;

    public constructor(cardHolder: CardHolder) {
        if (!cardHolder || !(cardHolder instanceof CardHolder)) {
            throw new Error("missing card holder");
        }
        this._cardHolder = cardHolder;

        this._nameText = new Text()
            .setBold(true)
            .setJustification(TextJustification.Center)
            .setText(" Player Name ");
        this._nameBorder = new Border()
            .setColor([0, 0, 0, 0.75])
            .setChild(this._nameText);
        this._takeSeatButton = new Button()
            .setBold(true)
            .setText(" TAKE SEAT ");
        this._widgetSwitcher = new WidgetSwitcher()
            .addChild(this._takeSeatButton)
            .addChild(this._nameBorder);

        this._ui = new UIElement();
        this._ui.presentationStyle = UIPresentationStyle.ViewAligned;
        this._ui.useTransparency = true;
        this._ui.useWidgetSize = true;
        this._ui.widget = this._widgetSwitcher;

        this._takeSeatButton.onClicked.add(
            (_button: Button, player: Player) => {
                const thisSlot = this._cardHolder.getOwningPlayerSlot();
                if (thisSlot < 0) {
                    throw new Error("invalid player slot");
                }
                player.switchSlot(thisSlot);

                // Make sure attached card holder follows.
                const delayedResetCardHolder = () => {
                    if (this._cardHolder instanceof CardHolder) {
                        player.setHandHolder(this._cardHolder);
                    }
                };
                process.nextTick(delayedResetCardHolder);
            }
        );

        // Listen for events (delay processing by a frame for "final" state).
        const eventHandler = () => {
            process.nextTick(() => {
                this._updatePlayerStatus();
            });
        };

        globalEvents.onPlayerJoined.add(eventHandler);
        globalEvents.onPlayerLeft.add(eventHandler);
        globalEvents.onPlayerSwitchedSlots.add(eventHandler);

        cardHolder.onDestroyed.add(() => {
            globalEvents.onPlayerJoined.remove(eventHandler);
            globalEvents.onPlayerLeft.remove(eventHandler);
            globalEvents.onPlayerSwitchedSlots.remove(eventHandler);
        });

        cardHolder.addUI(this._ui);
        this.setColor(cardHolder.getPrimaryColor()).setFontSizeAndPosition(
            CardHolderPlayerName.DEFAULT_FONT_SIZE
        );
        this._updatePlayerStatus();

        cardHolder.onReleased.add(() => {
            this._setPosition();
        });
    }

    public setColor(
        color: Color | [r: number, g: number, b: number, a: number]
    ): this {
        this._nameText.setTextColor(color);
        this._takeSeatButton.setTextColor(color);
        return this;
    }

    public setFont(fontName: string, fontPackageId?: string): this {
        this._nameText.setFont(fontName, fontPackageId);
        this._takeSeatButton.setFont(fontName, fontPackageId);
        return this;
    }

    public setFontSizeAndPosition(fontSize: number): this {
        this._nameText.setFontSize(fontSize);
        this._takeSeatButton.setFontSize(fontSize);

        // UI position.
        this._setPosition();
        return this;
    }

    private _setPosition(): void {
        const x = (this._cardHolder.getPosition().x >= 0 ? 1 : -1) * 30;
        const z = this._nameText.getFontSize() * 0.15;
        const worldPos: Vector = this._cardHolder.getPosition().add([x, 0, z]);
        this._ui.position = this._cardHolder.worldPositionToLocal(worldPos);
        this._cardHolder.updateUI(this._ui);
    }

    private _updatePlayerStatus(): void {
        // Calculate widget.
        let widget: Widget = this._takeSeatButton;

        // If seated player, show name.
        const playerSlot = this._cardHolder.getOwningPlayerSlot();
        for (const player of world.getAllPlayers()) {
            if (player.getSlot() === playerSlot) {
                this._nameText.setText(` ${player.getName()} `);
                widget = this._nameBorder;
                break;
            }
        }

        if (this._widgetSwitcher.getActiveWidget() !== widget) {
            this._widgetSwitcher.setActiveWidget(widget);
            this._cardHolder.updateUI(this._ui);
        }
    }

    /**
     * Update UI position for reversed card holder.
     */
    public reverseUI(): void {
        this._setPosition();
    }
}
