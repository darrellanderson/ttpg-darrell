import {
    Button,
    CardHolder,
    GameObject,
    globalEvents,
    Player,
    UIElement,
    WidgetSwitcher,
} from "@tabletop-playground/api";
import {
    MockButton,
    MockCardHolder,
    MockGameObject,
    MockMulticastDelegate,
    MockPlayer,
    mockWorld,
} from "ttpg-mock";
import { CardHolderPlayerName } from "./cardholder-player-name";

it("constructor", () => {
    const cardHolder: CardHolder = new MockCardHolder();
    new CardHolderPlayerName(cardHolder);
});

it("constructor (invalid)", () => {
    const bad: CardHolder = new MockGameObject() as unknown as CardHolder;
    expect(() => {
        new CardHolderPlayerName(bad);
    }).toThrow();
});

it("setColor", () => {
    const cardHolder: CardHolder = new MockCardHolder();
    const item = new CardHolderPlayerName(cardHolder);
    item.setColor([1, 1, 1, 1]);
});

it("setFont", () => {
    const cardHolder: CardHolder = new MockCardHolder();
    const item = new CardHolderPlayerName(cardHolder);
    item.setFont("my-font");
});

it("setFontSize", () => {
    const cardHolder: CardHolder = new MockCardHolder();
    const item = new CardHolderPlayerName(cardHolder);
    item.setFontSize(7);
});

it("click to take seat", () => {
    const player = new MockPlayer({ slot: 1 });
    mockWorld._reset({ players: [player] });
    const cardHolder: CardHolder = new MockCardHolder({ owningPlayerSlot: 7 });
    new CardHolderPlayerName(cardHolder);
    const uis: UIElement[] = cardHolder.getUIs();
    expect(uis.length).toEqual(1);
    const switcher = uis[0].widget;
    expect(switcher).toBeInstanceOf(WidgetSwitcher);
    if (!(switcher instanceof WidgetSwitcher)) {
        throw new Error("not WidgetSwitcher");
    }
    const button = switcher.getActiveWidget();
    if (!(button instanceof MockButton)) {
        throw new Error("not Button");
    }
    const onClicked = button.onClicked as MockMulticastDelegate<
        (button: MockButton, player: Player) => void
    >;
    expect(player.getSlot()).toEqual(1);
    onClicked._trigger(button, player);
    expect(player.getSlot()).toEqual(7);

    process.flushTicks();
    expect(player.getHandHolder()).toEqual(cardHolder);
});

it("click to take seat (invalid slot)", () => {
    const cardHolder: CardHolder = new MockCardHolder({ owningPlayerSlot: -1 });
    new CardHolderPlayerName(cardHolder);
    const uis: UIElement[] = cardHolder.getUIs();
    expect(uis.length).toEqual(1);
    const switcher = uis[0].widget;
    expect(switcher).toBeInstanceOf(WidgetSwitcher);
    if (!(switcher instanceof WidgetSwitcher)) {
        throw new Error("not WidgetSwitcher");
    }
    const button = switcher.getActiveWidget();
    if (!(button instanceof MockButton)) {
        throw new Error("not Button");
    }
    const onClicked = button.onClicked as MockMulticastDelegate<
        (button: MockButton, player: Player) => void
    >;
    const player = new MockPlayer({ slot: 1 });
    expect(() => {
        onClicked._trigger(button, player);
    }).toThrow();
});

it("onPlayerJoined", () => {
    const playerSlot = 8;
    const cardHolder: CardHolder = new MockCardHolder({
        owningPlayerSlot: playerSlot,
    });
    expect(cardHolder.getOwningPlayerSlot()).toEqual(playerSlot);
    new CardHolderPlayerName(cardHolder);
    const uis: UIElement[] = cardHolder.getUIs();
    expect(uis.length).toEqual(1);
    const switcher = uis[0].widget;
    expect(switcher).toBeInstanceOf(WidgetSwitcher);
    if (!(switcher instanceof WidgetSwitcher)) {
        throw new Error("not WidgetSwitcher");
    }
    expect(switcher.getActiveIndex()).toEqual(0);

    let onPlayerJoinedCount = 0;
    expect(globalEvents).toBeDefined();
    globalEvents.onPlayerJoined.add((player: Player) => {
        expect(player.getSlot()).toEqual(playerSlot);
        onPlayerJoinedCount++;
    });
    expect(onPlayerJoinedCount).toEqual(0);

    new MockPlayer({ slot: playerSlot }); // triggers onPlayerJoined
    expect(onPlayerJoinedCount).toEqual(1);
    process.flushTicks();
    process.flushTicks();
    expect(switcher.getActiveIndex()).toEqual(1);
});

it("destroy handling", () => {
    const cardHolder: CardHolder = new MockCardHolder({ owningPlayerSlot: 7 });
    new CardHolderPlayerName(cardHolder);
    cardHolder.destroy();
});
