import {
  Border,
  Button,
  Color,
  GameObject,
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

export class PlayerNameTakeSeat {
  public static readonly DEFAULT_FONT_SIZE = 30;

  private readonly _gameObject: GameObject;
  private readonly _nameText: Text;
  private readonly _nameBorder: Border;
  private readonly _takeSeatButton: Button;
  private readonly _widgetSwitcher: WidgetSwitcher;
  private readonly _ui: UIElement;

  public constructor(gameObject: GameObject) {
    if (!gameObject) {
      throw new Error("missing gameObject");
    }
    this._gameObject = gameObject;

    this._nameText = new Text()
      .setBold(true)
      .setJustification(TextJustification.Center)
      .setText(" Player Name ");
    this._nameBorder = new Border()
      .setColor([0, 0, 0, 0.75])
      .setChild(this._nameText);
    this._takeSeatButton = new Button().setBold(true).setText(" TAKE SEAT ");
    this._widgetSwitcher = new WidgetSwitcher()
      .addChild(this._takeSeatButton)
      .addChild(this._nameBorder);

    this._ui = new UIElement();
    this._ui.presentationStyle = UIPresentationStyle.ViewAligned;
    this._ui.useTransparency = true;
    this._ui.useWidgetSize = true;
    this._ui.widget = this._widgetSwitcher;

    this._takeSeatButton.onClicked.add((button: Button, player: Player) => {
      const thisSlot = this._gameObject.getOwningPlayerSlot();
      if (thisSlot < 0) {
        throw new Error("invalid player slot");
      }
      player.switchSlot(thisSlot);
    });

    // Listen for events (delay processing by a frame for "final" state).
    const eventHandler = () => {
      process.nextTick(() => {
        this._updatePlayerStatus();
      });
    };

    globalEvents.onPlayerJoined.add(eventHandler);
    globalEvents.onPlayerLeft.add(eventHandler);
    globalEvents.onPlayerSwitchedSlots.add(eventHandler);

    this._gameObject.onDestroyed.add(() => {
      globalEvents.onPlayerJoined.remove(eventHandler);
      globalEvents.onPlayerLeft.remove(eventHandler);
      globalEvents.onPlayerSwitchedSlots.remove(eventHandler);
    });

    this._gameObject.addUI(this._ui);
    this.setColor(gameObject.getPrimaryColor()).setFontSize(
      PlayerNameTakeSeat.DEFAULT_FONT_SIZE
    );
    this._updatePlayerStatus();
  }

  public setColor(color: Color): this {
    this._nameText.setTextColor(color);
    this._takeSeatButton.setTextColor(color);
    return this;
  }

  public setFont(fontName: string, fontPackageId?: string): this {
    this._nameText.setFont(fontName, fontPackageId);
    this._takeSeatButton.setFont(fontName, fontPackageId);
    return this;
  }

  public setFontSize(fontSize: number): this {
    this._nameText.setFontSize(fontSize);
    this._takeSeatButton.setFontSize(fontSize);

    // UI position.
    const x = (this._gameObject.getPosition().x > 0 ? 1 : -1) * 15;
    const z = fontSize / 5;
    this._ui.position = new Vector(x, 0, z);
    this._gameObject.updateUI(this._ui);
    return this;
  }

  private _updatePlayerStatus(): void {
    // Calculate widget.
    let widget: Widget = this._takeSeatButton;

    // If seated player, show name.
    const playerSlot = this._gameObject.getOwningPlayerSlot();
    for (const player of world.getAllPlayers()) {
      if (player.getSlot() === playerSlot) {
        this._nameText.setText(` ${player.getName()} `);
        widget = this._nameBorder;
        break;
      }
    }

    if (this._widgetSwitcher.getActiveWidget() !== widget) {
      this._widgetSwitcher.setActiveWidget(widget);
      this._gameObject.updateUI(this._ui);
    }
  }
}
