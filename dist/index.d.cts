import { Button, Canvas, Card, CardHolder, Color, Container, Dice, FetchOptions, FetchResponse, GameObject, MultistateObject, Player, PlayerPermission, Rotator, ScreenUIElement, SnapPoint, StaticObject, UIElement, Vector, Widget } from "@tabletop-playground/api";
//#region src/lib/adjacency/adjacency.d.ts
/**
 * Opaque node id.  Could be a hex coordinate, a wormhole class, etc.
 */
export type AdjacencyNodeType = string;
/**
 * Directed link between two nodes.
 * Paths cannot end with a transit node; they must connect two non-transit nodes.
 */
export type AdjacencyLinkType = {
  src: AdjacencyNodeType;
  dst: AdjacencyNodeType;
  distance: number;
  isTransit: boolean;
};
export type AdjacencyPathType = {
  node: AdjacencyNodeType;
  distance: number;
  path: ReadonlyArray<AdjacencyLinkType>;
};
export declare class Adjacency {
  private readonly _srcNodeOutgoingLinks;
  addLink(link: AdjacencyLinkType): this;
  hasLink(link: AdjacencyLinkType): boolean;
  /**
   * Remove all links starting OR ENDING from the given node.
   *
   * @param node
   */
  removeNode(node: AdjacencyNodeType): this;
  /**
   * Compute shortest paths to all nodes within maxDistance.
   *
   * @param origin
   * @param maxDistance
   * @returns
   */
  get(origin: AdjacencyNodeType, maxDistance: number): ReadonlyArray<AdjacencyPathType>;
}
//#endregion
//#region src/lib/atop/atop.d.ts
/**
 * Is a position within an object's XY space? (account for scale and rotaton)
 * Becomes invalid if object size/scale changes.
 */
export declare class Atop {
  private readonly _obj;
  private readonly _scaledExtent;
  constructor(obj: GameObject);
  isAtop(pos: Vector): boolean;
}
//#endregion
//#region src/lib/broadcast/broadcast.d.ts
/**
 * Send messages to one or all players.
 */
export declare class Broadcast {
  static get ERROR(): Color;
  static lastMessage: string;
  /**
   * Sends a message to all players, appears on screen and in chat.
   *
   * @param {string} message - The message to send.
   * @param {Color | [number, number, number, number]} [color] - The color of the message.
   */
  static broadcastAll(message: string, color?: Color | [r: number, g: number, b: number, a: number]): void;
  /**
   * Sends a message to one player, appears on screen and in chat.
   *
   * @param {Player} player - The player to send the message to.
   * @param {string} message - The message to send.
   * @param {Color | [number, number, number, number]} [color] - The color of the message.
   */
  static broadcastOne(player: Player, message: string, color?: Color | [r: number, g: number, b: number, a: number]): void;
  /**
   * Sends a chat message to all players.
   *
   * @param {string} message - The message to send.
   * @param {Color | [number, number, number, number]} [color] - The color of the message.
   */
  static chatAll(message: string, color?: Color | [r: number, g: number, b: number, a: number]): void;
  /**
   * Sends a chat message to one player.
   *
   * @param {Player} player - The player to send the message to.
   * @param {string} message - The message to send.
   * @param {Color | [number, number, number, number]} [color] - The color of the message.
   */
  static chatOne(player: Player, message: string, color?: Color | [r: number, g: number, b: number, a: number]): void;
}
//#endregion
//#region src/lib/global/i-global.d.ts
export interface IGlobal {
  init(): void;
}
//#endregion
//#region src/lib/bug-workarounds/bug-card-holder-assignment/bug-card-holder-assignment.d.ts
/**
 * Monitor card holder, expect it to be the primary holder for
 * the owning player slot player.
 */
export declare class BugCardHolderAssignment implements IGlobal {
  private readonly _find;
  private readonly _cardHolderNsid;
  private _intervalHandle;
  private _reportErrors;
  readonly _intervalRunnable: () => void;
  constructor(cardHolderNsid: string);
  init(): void;
  destroy(): void;
  setReportErrors(reportErrors: boolean): this;
  private _run;
}
//#endregion
//#region src/lib/bug-workarounds/bug-force-transform-updates/bug-force-transform-updates.d.ts
export declare const DELTA: number;
/**
 * Object transforms aren't getting replicated reliably.
 * When an object stops moving, force a few transform updates.
 */
export declare class BugForceTransformUpdates implements IGlobal {
  private readonly _idToRemainingPokeCount;
  readonly _maybeStartPoking: (obj: GameObject) => void;
  init(): void;
  pokeAll(): void;
  poke(obj: GameObject, dir: number): void;
}
//#endregion
//#region src/lib/bug-workarounds/bug-unique-cards/bug-unique-cards.d.ts
/**
 * Monitor all decks expecting no NSID (metadata) repeats.
 * Prune extra cards if found.
 */
export declare class BugUniqueCards implements IGlobal {
  private readonly _cardUtil;
  private _reportErrors;
  private readonly _onInsertedHandler;
  init(): void;
  setReportErrors(reportErrors: boolean): this;
  _processDeck(deck: Card): void;
}
//#endregion
//#region src/lib/card-util/card-util.d.ts
export declare class CardUtil {
  private readonly _find;
  /**
   * Deal card to the player's card holder.
   * (Card.deal may fail if holder is not attached to player.)
   *
   * @param card
   * @param playerSlot
   * @returns
   */
  dealToHolder(card: Card, playerSlot: number): boolean;
  /**
   * Find the card anywhere on the table / in-deck / in-holder.
   * Remove from deck or holder, if applicable.
   *
   * @param nsid
   * @returns
   */
  fetchCard(nsid: string): Card | undefined;
  /**
   * Extract filter-approved cards into a new deck.  Leave any remaining
   * cards in the old deck (may potentially become empty).
   *
   * @param deck
   * @param filter
   * @returns - new deck with filtered cards
   */
  filterCards(deck: Card, filter: (nsid: string) => boolean): Card | undefined;
  /**
   * Is this card a singleton (not a deck), not held by a player, etc.
   *
   * @param obj
   * @param allowFaceDown
   * @returns
   */
  isLooseCard(obj: GameObject, allowFaceDown?: boolean, rejectSnapPointTags?: Array<string>): boolean;
  /**
   * Split a deck into an array of single-card objects.
   *
   * @param deck
   * @returns
   */
  separateDeck(deck: Card): Array<Card>;
}
//#endregion
//#region src/lib/ui/window/window-params.d.ts
export declare const WINDOW_BUTTON_ASSET: {
  readonly CLOSE: "ui/window/close.png";
  readonly COLLAPSE: "ui/window/collapse.png";
  readonly EXPAND: "ui/window/expand.png";
  readonly GROW: "ui/window/grow.png";
  readonly SHRINK: "ui/window/shrink.png";
  readonly TO_SCREEN: "ui/window/to-screen.png";
  readonly TO_WORLD: "ui/window/to-world.png";
};
/**
 * Wrapper around a widget, created before attaching to a window and
 * destroyed after detaching.  The IWindowWidget is not reused, will
 * create a new one if needed.
 */
export interface IWindowWidget {
  create(params: WindowWidgetParams): Widget;
  destroy(): void;
}
export type WindowWidgetParams = {
  scale: number;
  fontSize: number;
  spacing: number;
  playerSlot: number;
  windowSize: {
    width: number;
    height: number;
  };
  close: () => void;
};
export type WindowParams = {
  title?: string;
  disableClose?: boolean;
  disableCollapse?: boolean;
  disableWarpScreenWorld?: boolean;
  size: {
    width: number;
    height: number;
  };
  defaultTarget?: "screen" | "world";
  screen?: {
    anchor: {
      u: number;
      v: number;
    };
    pos: {
      u: number;
      v: number;
    };
  };
  world?: {
    anchor: {
      u: number;
      v: number;
    };
    playerSlotToTransform: {
      [key: number]: {
        pos: [x: number, y: number, z: number] | Vector;
        rot: [pitch: number, yaw: number, roll: number] | Rotator;
      };
    };
  };
  windowWidgetGenerator: () => IWindowWidget;
  addToggleMenuItem?: boolean;
  addToggleMenuTooltip?: string;
};
//#endregion
//#region src/lib/namespace-id/namespace-id.d.ts
export type NamespaceId = `@${string}/${string}`;
//#endregion
//#region src/lib/chess-clock/chess-clock-data.d.ts
export declare class ChessClockData {
  private readonly _persistentKey;
  private readonly _playerSlotToWidgetColor;
  private readonly _playerSlotToRemainingSeconds;
  private _playerCount;
  private _playerOrder;
  private _timeBudgetSeconds;
  private _activePlayerSlot;
  private _intervalHandle;
  private _discordToken;
  private _discordSpeaking;
  static readonly INTERVAL_SECONDS = 1;
  readonly _intervalAssignTimeToActivePlayer: () => void;
  constructor(persistenceKey?: NamespaceId);
  private _load;
  private _save;
  destroy(): void;
  private readonly _onSpeakingDeltas;
  private readonly _onSpeakingError;
  connectDiscordSpeaking(discordToken: string): void;
  disconnectDiscordSpeaking(): void;
  getActivePlayerSlot(): number;
  /**
   * Override the current turn player.
   *
   * @param playerSlot
   * @returns
   */
  overrideActivePlayerSlot(playerSlot: number): this;
  /**
   * Turn change, set current player and tell speaking
   * where to refund talk-over time.
   *
   * @param playerSlot
   * @returns
   */
  setCurrentTurn(playerSlot: number): this;
  getPlayerCount(): number;
  setPlayerCount(playerCount: number): this;
  getPlayerOrder(): Array<number>;
  setPlayerOrder(playerOrder: Array<number>): this;
  getWidgetColor(playerSlot: number): Color;
  setWidgetColor(playerSlot: number, color: Color): this;
  getTimeBudgetSeconds(): number;
  setTimeBudgetSeconds(timeBudgetSeconds: number): this;
  getTimeRemainingSeconds(playerSlot: number): number;
  setTimeRemainingSeconds(playerSlot: number, seconds: number): this;
  resetTimers(): this;
  applyTimeDetlas(deltas: Map<string, number>, summary: Array<string>): this;
  broadcast(msg: string): this;
}
//#endregion
//#region src/lib/chess-clock/chess-clock-config-widget.d.ts
export declare class ChessClockConfigWidget implements IWindowWidget {
  private readonly _chessClockData;
  private readonly _onOkClicked;
  constructor(chessClockData: ChessClockData, onOkClicked: () => void);
  create(params: WindowWidgetParams): Widget;
  destroy(): void;
}
//#endregion
//#region src/lib/chess-clock/chess-clock-config-window.d.ts
export declare class ChessClockConfigWindow {
  constructor(visibleToPlayerSlot: number, chessClockData: ChessClockData, onOkClicked: () => void);
}
//#endregion
//#region src/lib/chess-clock/chess-clock-widget.d.ts
export declare class ChessClockWidget implements IWindowWidget {
  private readonly _chessClockData;
  private _buttonData;
  private _isEditing;
  private _intervalUpdateWidget;
  constructor(chessClockData: ChessClockData);
  create(params: WindowWidgetParams): Widget;
  destroy(): void;
  editStart(clickingPlayer: Player): void;
  editEnd(clickingPlayer: Player): void;
  update(): void;
}
//#endregion
//#region src/lib/chess-clock/chess-clock.d.ts
export type ChessClockParams = {
  playerSlotOrder: Array<number>;
  windowAnchor?: {
    u: number;
    v: number;
  };
  windowPosition?: {
    u: number;
    v: number;
  };
  getCurrentPlayerSlot?: () => number;
};
export declare class ChessClock {
  private static readonly KEY_CHESS_DATA;
  private static readonly KEY_WINDOW;
  private readonly _chessClockData;
  private readonly _chessClockWindow;
  private readonly _getCurrentPlayerSlot;
  constructor(params: ChessClockParams);
  getChessClockData(): ChessClockData;
  openConfigWindow(clickingPlayer: Player): void;
  destroy(): void;
}
//#endregion
//#region src/lib/color-lib/colors.data.d.ts
export type ColorsType = {
  target: string;
  slot: string;
  slotRendered: string;
  plastic: string;
  plasticRendered: string;
  widget: string;
  widgetRendered: string;
};
export declare const COLORS: Record<string, Array<ColorsType>>;
//#endregion
//#region src/lib/color-lib/color-lib.d.ts
export declare const HEX_COLOR_REGEX: RegExp;
export declare class ColorLib {
  private readonly _hexColorRegex;
  parseColor(hexColor: string): Color | undefined;
  parseColorOrThrow(hexColor: string): Color;
  getColorsByName(colorName: string, index: number): ColorsType | undefined;
  getColorsByNameOrThrow(colorName: string, index: number): ColorsType;
  getColorsByPlayerSlot(playerSlot: number): ColorsType | undefined;
  getColorsByPlayerSlotOrThrow(playerSlot: number): ColorsType;
  getColorsByTarget(target: string): ColorsType | undefined;
  getColorsByTargetOrThrow(target: string): ColorsType;
  getColorsLength(colorName: string): number | undefined;
  getColorsLengthOrThrow(colorName: string): number;
}
//#endregion
//#region src/lib/context-menu/abstract-right-click-card/abstract-right-click-card.d.ts
/**
 * Add a context menu item ONLY when the singleton card exists.
 * Remove it if the card becomes a deck.
 *
 * NOTE: the handler is a standard onCustomAction handler -- you need to verify
 * the identifier before processing!  This is to match other onCustomAction
 * handling rather than create a new signature.
 */
export declare abstract class AbstractRightClickCard implements IGlobal {
  private readonly _cardNsidPrefix;
  private readonly _customActionNames;
  private readonly _tooltips;
  private readonly _customActionHandler;
  constructor(cardNsidPrefix: string, customActionName: string, customActionHandler: (object: GameObject, player: Player, identifier: string) => void);
  /**
   * The first tooltip is
   *
   * @param tooltip
   */
  setTooltip(actionName: string, tooltip: string): this;
  addCustomActionName(customActionName: string): this;
  init(): void;
}
//#endregion
//#region src/lib/context-menu/abstract-right-click-deck/abstract-right-click-deck.d.ts
/**
 * Add context menu item on a deck ONLY when all cards match the given prefix.
 * Remove it if the deck becomes a singleton card.
 *
 * NOTE: does not remove the handler if a mismatch card is added to the deck later!
 *
 * NOTE: the handler is a standard onCustomAction handler -- you need to verify
 * the identifier before processing!  This is to match other onCustomAction
 * handling rather than create a new signature.
 */
export declare abstract class AbstractRightClickDeck implements IGlobal {
  private readonly _deckNsidPrefix;
  private readonly _customActionNames;
  private readonly _customActionHandler;
  constructor(deckNsidPrefix: string, customActionName: string, customActionHandler: (object: GameObject, player: Player, identifier: string) => void);
  addCustomActionName(customActionName: string): this;
  init(): void;
}
//#endregion
//#region src/lib/context-menu/leave-seat/leave-seat.d.ts
/**
 * Global content menu item to leave seat.  Move to an unused slot, NOT the
 * spectator slot (spectators cannot interact, preventing them from clicking
 * any "take seat" buttons).
 */
export declare class LeaveSeat implements IGlobal {
  static readonly CUSTOM_ACTION_NAME = "*Leave Seat";
  private static readonly _customActionHandler;
  init(): void;
  /**
   * Move player to an "unused" slot, meaning no existing player NOR any
   * object's owning player slot.
   *
   * @param player
   */
  static leaveSeat(player: Player): boolean;
}
//#endregion
//#region src/lib/context-menu/report-remaining/report-remaining.d.ts
export declare class ReportRemaining implements IGlobal {
  static readonly _actionName: string;
  private readonly _cardNsidPrefix;
  private readonly _customActionHandler;
  constructor(cardNsidPrefix: string);
  private _maybeAdd;
  init(): void;
}
//#endregion
//#region src/lib/data-store/data-store.d.ts
/**
 * Store arbitrarily large opaque data.
 *
 * Creates a container, stored data gets broken up into chunks and spread
 * across objects inside that container.  If data exceeds the single object
 * limits it chains to a new object.
 *
 * Different data keys can store inside a shared object, creating more
 * objects only when the existing set fills.
 *
 * This does suffer from internal fragmentation; storing many very small
 * data entries wastes space.
 */
export declare class DataStore {
  private readonly _root;
  /**
   * constructor
   *
   * @param dataStoreId - each store MUST have a different id
   */
  constructor(dataStoreId: NamespaceId);
  /**
   * Remove data.
   *
   * @param dataId
   * @returns
   */
  delete(dataId: NamespaceId): void;
  /**
   * Add or replace data.
   *
   * @param dataId
   * @param data
   * @returns
   */
  set(dataId: NamespaceId, data: string): void;
  /**
   * Get data.
   *
   * @param dataId
   * @returns
   */
  get(dataId: NamespaceId): string | undefined;
  /**
   * Get the first data block location for the data entry.
   *
   * @param dataId
   * @returns
   */
  private _getRootEntry;
  /**
   * Read all blocks starting with the given location.
   *
   * @param blockLocation
   * @param processor
   */
  private _getChain;
  /**
   * Reserve a block (index within a store file).
   * If store has no more free slots remove it from root available list.
   *
   * @returns
   */
  private _allocBlock;
  /**
   * Release a block (index within a store file).
   * If the store is no longer in use delete it.
   *
   * @param blockLocation
   */
  private _releaseBlock;
  /**
   * Add store to available with-capacity list (store has more room).
   *
   * @param obj
   */
  private _addStoreToAvailable;
  /**
   * Remove store from available with-capcity list (store is full).
   *
   * @param obj
   */
  private _removeStoreFromAvailable;
  /**
   * Get a store from the list of stores with free slots.
   *
   * @returns
   */
  private _getStore;
  /**
   * Create a new store, add to the list of stores with free slots.
   *
   * @returns
   */
  private _allocStore;
  /**
   * Remove a store from the list of stores with free slots, then
   * delete the store object.
   *
   * @param obj
   */
  private _releaseStore;
}
//#endregion
//#region src/lib/dice-group/dice-group.d.ts
/**
 * Setup for a single die.
 */
export type DiceParams = {
  sides: 4 | 6 | 8 | 10 | 12 | 20;
  id?: string;
  primaryColor?: Color | [r: number, g: number, b: number, a: number];
  secondaryColor?: Color | [r: number, g: number, b: number, a: number];
  name?: string;
  hit?: number;
  crit?: number;
  critCount?: number;
  reroll?: boolean;
};
/**
 * Setup for a group of dice.
 */
export type DiceGroupParams = {
  diceParams: Array<DiceParams>;
  player: Player;
  timeoutSeconds?: number;
  deleteAfterSeconds?: number;
  callback?: (diceResults: Array<DiceResult>, player: Player) => void;
  position?: Vector | [x: number, y: number, z: number];
  doFakeRoll?: boolean;
  extraRerolls?: number;
};
export type DiceResult = {
  diceParams: DiceParams;
  dice?: Dice;
  value: number;
  hit?: boolean;
  crit?: boolean;
  rerolledValue?: number;
};
export declare const DICE_GROUP_SAVED_DATA_KEY = "__DiceGroup_DiceId__";
/**
 * Remove any lingering DiceGroup dice.
 */
export declare class DiceGroupCleanup implements IGlobal {
  init(): void;
}
/**
 * Roll a collection of dice, listen to onRolled for overall result.
 * Can only be used once, create a new one for new rolls.
 *
 * Intended use: roll + format
 */
export declare class DiceGroup {
  static readonly DEFAULT_TIMEOUT_SECONDS = 3;
  static readonly DEFAULT_DELETE_AFTER_SECONDS = 5;
  /**
   * Create and roll dice group.
   * Do via static to prevent attempting to reuse the single-use instance.
   *
   * @param params
   */
  static roll(params: DiceGroupParams): void;
  /**
   * Format a dice result for display.
   *
   * @param diceResult
   * @returns
   */
  static format(diceResult: DiceResult): string;
  private readonly _diceParamsArray;
  private readonly _player;
  private readonly _callback;
  private readonly _deleteAfterSeconds;
  private readonly _timeoutSeconds;
  private readonly _position;
  private readonly _diceObjIdToDiceResult;
  private readonly _activeDice;
  private readonly _extraRerolls;
  private _timeoutHandle;
  private readonly _onDiceRolledHandler;
  _applyExtraRerolls(): void;
  private readonly _onTimeoutHandler;
  private readonly _onDeleteDiceHandler;
  private constructor();
  fakeRoll(): void;
  roll(): void;
  _sendResult(): void;
  static _setFakeValue(diceResult: DiceResult): void;
  static _createDice(diceParams: DiceParams, position: Vector | [x: number, y: number, z: number]): Dice;
}
//#endregion
//#region src/lib/event/triggerable-multicast-delegate/triggerable-multicast-delegate.d.ts
/**
 * Lookalike for TTPG's MulticastDelegate, but with a trigger method.
 */
export declare class TriggerableMulticastDelegate<T extends (...args: Array<any>) => any> {
  private readonly _listeners;
  private _triggerDepth;
  /**
   * Add a function to the trigger set.
   *
   * @param fn
   */
  add(fn: T): void;
  /**
   * Remove a function from the trigger set.
   *
   * @param fn
   */
  remove(fn: T): void;
  /**
   * Clear the trigger set.
   */
  clear(): void;
  /**
   * Call every function in the trigger set.
   *
   * Call every function even if one throws, send gathered errors at end directly to error handler;
   * does not throw/stop processing.
   *
   * @param args
   */
  trigger(...args: Parameters<T>): void;
}
//#endregion
//#region src/lib/discord/discord-speaking-bot-client/discord-speaking-bot-client.d.ts
export declare class DiscordSpeakingBotClient {
  readonly onSpeakingDeltas: TriggerableMulticastDelegate<(deltas: Map<string, number>, summary: Array<string>) => void>;
  readonly onSpeakingError: TriggerableMulticastDelegate<(reason: string) => void>;
  private readonly _speakingAssign;
  private readonly _speakingParser;
  private readonly _webHook;
  private readonly _speakerToPlayer;
  private _verbose;
  private _messageId;
  private _intervalHandle;
  private _lastSeconds;
  private _lastSpeaker;
  static _parseBase64Data(base64data: string): {
    webhookId: string;
    webhookToken: string;
    messgeId: string;
  };
  constructor();
  setVerbose(verbose: boolean): this;
  setCurrentTurn(playerName: string | undefined): this;
  connect(base64data: string): this;
  disconnect(): this;
  _readAndProcessWebHook(): void;
}
//#endregion
//#region src/lib/discord/discord-speaking-bot-client/speaker-to-player.d.ts
export declare class SpeakerToPlayer {
  private _speakers;
  private _speakerToPlayer;
  constructor();
  invalidate(): void;
  getPlayerName(speakerName: string): string | undefined;
}
//#endregion
//#region src/lib/time-span/time-span.d.ts
export declare class TimeSpanRecord {
  readonly start: number;
  readonly end: number;
  constructor(start: number, end: number);
  /**
   * Create an identical copy with different start and end values.
   *
   * @param start
   * @param end
   * @returns
   */
  clone(start: number, end: number): TimeSpanRecord;
  toString(): string;
}
/**
 * Collect non-overlapping time spans.
 * Split will break spans into two at the given time.
 */
export declare class TimeSpans<T extends TimeSpanRecord> {
  private readonly _spans;
  /**
   * Add a new record.
   *
   * @param timeSpanRecord
   * @returns
   */
  add(timeSpanRecord: T): this;
  getSpans(): Array<T>;
  /**
   * Remove spans ending before the given time.
   *
   * @param time
   * @returns
   */
  evictOld(time: number): this;
  /**
   * "Rewrite" the end time of the last span.
   * Used to mark the end of a time span that previously had no end.
   *
   * @param time
   * @returns
   */
  clampLast(time: number): this;
  /**
   * Split any span that contains the given time into two at that time.
   *
   * @param time
   * @returns
   */
  split(time: number): this;
  /**
   * Get all spans that fully overlap the given time span.
   *
   * @param start
   * @param end
   * @returns
   */
  overlaps(start: number, end: number): Array<T>;
}
//#endregion
//#region src/lib/discord/discord-speaking-bot-client/speaking-assign.d.ts
export declare class SpeakingAssignRecord extends TimeSpanRecord {
  readonly defaultUser: string | undefined;
  readonly speakers: Array<string>;
  constructor(startSeconds: number, endSeconds: number, defaultUser: string | undefined);
  clone(start: number, end: number): TimeSpanRecord;
  toString(): string;
}
/**
 * Spans get assigned a default user (the current turn, may be undefined).
 * Speaking events carve up and add speakers to spans.
 */
export declare class SpeakingAssign {
  private readonly _spans;
  constructor();
  getSpans(): Array<SpeakingAssignRecord>;
  addChangeTurn(name: string | undefined, seconds: number): this;
  _addSpeaking(name: string, startSeconds: number, endSeconds: number): Array<SpeakingAssignRecord>;
  summarizeSpeakingOverlaps(name: string, startSeconds: number, endSeconds: number): {
    summary: Array<string>;
    deltas: Map<string, number>;
  };
}
//#endregion
//#region src/lib/discord/discord-speaking-bot-client/speaking-parser.d.ts
export type SpeakingRecord = {
  userId: string;
  startSeconds: number;
  endSeconds: number;
};
export declare class SpeakingParser {
  /**
   * Extract speaking records from summary.
   * Lines are "timestamp userId duration", userId does not have spaces.
   *
   * @param summary
   * @returns
   */
  parse(summary: string): Array<SpeakingRecord>;
}
//#endregion
//#region src/lib/discord/discord-web-hook/discord-web-hook.d.ts
/**
 * Create, read, and delete discord messages using a webhook.
 * Only needs the "fetch" API, suitable for use in Tabletop Playground.
 */
export declare class DiscordWebHook {
  private readonly URL;
  private _id;
  private _token;
  setId(id: string): this;
  setToken(token: string): this;
  /**
   * Post a message to the webhook channel.
   *
   * @param message
   * @returns messsageId
   */
  put(message: string): Promise<string>;
  /**
   * Read the content of a webhook-posted message.
   *
   * @param messageId
   * @returns message content
   */
  get(messageId: string): Promise<string>;
  /**
   * Delete a message posted by the webhook.
   *
   * @param messageId
   * @returns void
   */
  dele(messageId: string): Promise<void>;
}
//#endregion
//#region src/lib/error-handler/bugsplat-remote-reporter.d.ts
export type BugSplatRemoteReporterParams = {
  database: string;
  appName: string;
  appVersion: string;
};
/**
 * Report errors or other messages to a remote service.
 */
export declare class BugSplatRemoteReporter implements IGlobal {
  private static __isEnabled;
  private readonly _database;
  private readonly _appName;
  private readonly _appVersion;
  private readonly _seen;
  static setEnabled(isEnabled: boolean): void;
  constructor(params: BugSplatRemoteReporterParams);
  init(): void;
  onError(error: string): void;
  createURL(): string;
  createFetchOptions(error: string): FetchOptions;
  sendError(error: string): Promise<FetchResponse>;
}
//#endregion
//#region src/lib/error-handler/error-batcher.d.ts
export declare abstract class ErrorBatcher {
  /**
   * Get error as string including stack trace (not just name/message).
   *
   * @param error
   * @returns {string}
   */
  static errorToString(error: Error): string;
  static runMaybeThrowAtEnd(runnables: Array<(x: void) => unknown>): void;
  static runGatherErrors(runnables: Array<(x: void) => unknown>): Array<Error>;
}
//#endregion
//#region src/lib/error-handler/error-handler.d.ts
export type ErrorLocation = {
  method?: string;
  file: string;
  jsLine: number;
  jsColumn: number;
  tsLine?: number;
};
/**
 * Report stack traces with filenames relative to the Script directory,
 * use source mappings to report both js and transpiled ts line numbers.
 *
 * Add `"sourceMap": true` to the compilerOptions of your tsconfig.json.
 *
 * Install the error handler via `new ErrorHandler().init()`.
 */
export declare class ErrorHandler implements IGlobal {
  static readonly onError: TriggerableMulticastDelegate<(error: string, rawError?: string) => void>;
  private readonly _reverseBase64Alphabet;
  private readonly _fileToLineMapping;
  constructor();
  init(): void;
  reportError(error: string): void;
  rewriteError(error: string): string;
  /**
   * Parse error location from a single line of a stack trace.
   *
   * @param stackTraceLine
   * @returns error location
   */
  parseErrorLocation(stackTraceLine: string): ErrorLocation | undefined;
  /**
   * Get the "{x}.js.map" file contents as a string.
   *
   * @param jsFile
   * @returns
   */
  getMap(jsFile: string): string | undefined;
  getLineMapping(jsFile: string): Array<number> | undefined;
  parseSourceMappings(mappingsEncoded: string): Array<number>;
  _parseSextets(segment: string): Array<number>;
  _splitVlqs(sextets: Array<number>): Array<Array<number>>;
  parseSourceMappingSegment(segment: string): Array<number>;
}
//#endregion
//#region src/lib/event/on-card-became-singleton-or-deck/on-card-became-singleton-or-deck.d.ts
export declare class OnCardBecameSingletonOrDeck implements IGlobal {
  static readonly onSingletonCardCreated: TriggerableMulticastDelegate<(card: Card, player?: Player) => void>;
  static readonly onSingletonCardMadeDeck: TriggerableMulticastDelegate<(card: Card, oldNsid: string, player?: Player) => void>;
  private static readonly _onInsertedHandler;
  static _onRemovedHandler: (deck: Card, _removedCard: Card, _position: number, player?: Player) => void;
  static _onCreatedHandler: (obj: GameObject) => void;
  /**
   * Remove and (re)install handlers.  Safe to call multiple times.
   */
  init(): void;
  static _reset(): void;
}
//#endregion
//#region src/lib/event/throttle-click-handler/throttle-click-handler.d.ts
export declare class ThrottleClickHandler<T> {
  static readonly THROTTLE_MSECS = 300;
  private readonly _playerSlotToLastClickMsecs;
  private readonly _clickHandler;
  private readonly _throttledHandler;
  constructor(clickHandler: (button: T, player: Player) => void);
  get(): (button: T, player: Player) => void;
}
//#endregion
//#region src/lib/facing/facing.d.ts
export declare class Facing {
  static isFaceUp(obj: GameObject): boolean;
}
//#endregion
//#region src/lib/find/find-tracking.d.ts
/**
 * Find, but only for pre-tracked nsids.
 *
 * Monitors object (and card singleton) creation and destruction to keep an
 * up-to-date set.
 *
 * Unlike find this can track multiple objects with the same nsid.
 */
export declare class FindTracking {
  private readonly _trackNsids;
  private readonly _nsidToObjIds;
  private readonly _onObjectCreated;
  private readonly _onObjectDestroyed;
  private readonly _onSingletonCardCreated;
  private readonly _onSingletonCardMadeDeck;
  /**
   * Rebuild the entire tracking map from scratch.
   * Similar cost to reseeding a single nsid (full scan anyhow).
   */
  _seedNsidToObjIds(): void;
  constructor();
  destroy(): void;
  trackNsid(nsid: string): void;
  trackNsids(nsids: Array<string>): void;
  find(nsid: string): Array<GameObject>;
  findCards(nsid: string): Array<Card>;
  findCard(nsid: string): Card | undefined;
}
//#endregion
//#region src/lib/find/find.d.ts
/**
 * Find things in the game world.  Generally speaking finds the first matching
 * candidate; expecting objects to be unique.
 */
export declare class Find {
  private static __ignoreCardHolderNsids;
  private _cardHolders;
  private readonly _nsidAndSlotToGameObject;
  private readonly _snapPointTagAndSlotToSnapPoint;
  private readonly _playerSlotToCardHolder;
  static ignoreOwnedCardHolderNsid(nsid: string): void;
  getOwnedCardHolders(): Array<CardHolder>;
  closestOwnedCardHolderOwner(pos: Vector | [x: number, y: number, z: number]): number;
  findCard(nsid: string, playerSlot?: number, skipContained?: boolean): Card | undefined;
  findCardHolder(nsid: string, playerSlot?: number, skipContained?: boolean): CardHolder | undefined;
  findCardHolderBySlot(playerSlot: number, skipContained?: boolean): CardHolder | undefined;
  findContainer(nsid: string, playerSlot?: number, skipContained?: boolean): Container | undefined;
  findDeckOrDiscard(deckSnapPointTag: string, discardSnapPointTag?: string, shuffleDiscard?: boolean, playerSlot?: number): Card | undefined;
  findDice(nsid: string, playerSlot?: number, skipContained?: boolean): Dice | undefined;
  findGameObject(nsid: string, playerSlot?: number, skipContained?: boolean): GameObject | undefined;
  findMultistateObject(nsid: string, playerSlot?: number, skipContained?: boolean): MultistateObject | undefined;
  findSnapPointByTag(tag: string, playerSlot?: number): SnapPoint | undefined;
}
//#endregion
//#region src/lib/game-object/cardholder-player-name/cardholder-player-name.d.ts
/**
 * Display player name above-and-behind the card holder.
 * Show a "take seat" button when no player in slot.
 */
export declare class CardHolderPlayerName {
  static readonly DEFAULT_FONT_SIZE = 30;
  private readonly _cardHolder;
  private readonly _nameText;
  private readonly _nameBorder;
  private readonly _takeSeatButton;
  private readonly _widgetSwitcher;
  private readonly _ui;
  constructor(cardHolder: CardHolder);
  setColor(color: Color | [r: number, g: number, b: number, a: number]): this;
  setFont(fontName: string, fontPackageId?: string): this;
  setFontSizeAndPosition(fontSize: number): this;
  private _setPosition;
  private _updatePlayerStatus;
  /**
   * Update UI position for reversed card holder.
   */
  reverseUI(): void;
}
//#endregion
//#region src/lib/game-object/deleted-items-container/deleted-items-container.d.ts
/**
 * Add the obj version of this to a container to make a copy of deleted objects.
 */
export declare class DeletedItemsContainer {
  static IGNORE_TAG: string;
  private static readonly _ignoreNSIDs;
  private readonly _container;
  private readonly _oneTimeSkipObjIds;
  /**
   * Destroy the object without adding to a deleted items container.
   *
   * @param obj
   */
  static destroyWithoutCopying(obj: GameObject): void;
  /**
   * Never copy these deleted items.
   *
   * @param nsids
   */
  static ignoreNSIDs(nsids: Array<string>): void;
  constructor(container: Container);
  _onObjectDestroyed(obj: GameObject): void;
}
//#endregion
//#region src/lib/game-object/garbage/garbage-container.d.ts
/**
 * Possibly return the given object to its designated "thrown in the garbage" location.
 */
export declare abstract class GarbageHandler {
  /**
   * Can recycle this object?
   *
   * @param obj
   */
  abstract canRecycle(obj: GameObject, player: Player | undefined): boolean;
  /**
   * Recycle the object.
   *
   * @param obj
   * @returns true if recycled
   */
  abstract recycle(obj: GameObject, player: Player | undefined): boolean;
}
/**
 * Attempt to recycle deposited objects, break up decks into individual cards.
 */
export declare class GarbageContainer {
  static onRecycled: TriggerableMulticastDelegate<(objId: string, objName: string, objMetadata: string, player: Player | undefined) => void>;
  private static _garbageHandlers;
  private readonly _container;
  /**
   * Register a new recycler.
   *
   * @param garbageHandler
   */
  static addHandler(garbageHandler: GarbageHandler): void;
  /**
   * Clear all recycle handlers (for tests).
   */
  static clearHandlers(): void;
  static tryRecycle(obj: GameObject, player: Player | undefined): boolean;
  private static _tryRecycleObj;
  private static _tryRecycleDeck;
  constructor(container: Container);
  _recycle(player: Player | undefined): void;
}
//#endregion
//#region src/lib/game-object/garbage/simple-card-garbage-handler.d.ts
/**
 * Recycle cards to a specific snap point on a mat.
 * Add to any deck already there, or start a new deck.
 * Optionally shuffle after discard.
 */
export declare class SimpleCardGarbageHandler implements GarbageHandler {
  private readonly _find;
  private _cardNsidPrefix;
  private _snapPointTag;
  private _faceUp;
  private _shuffleAfterDiscard;
  setCardNsidPrefix(cardNsidPrefix: string): this;
  setSnapPointTag(tag: string): this;
  setFaceUp(value: boolean): this;
  setShuffleAfterDiscard(shuffle: boolean): this;
  canRecycle(obj: GameObject, _player: Player | undefined): boolean;
  recycle(obj: GameObject, _player: Player | undefined): boolean;
}
//#endregion
//#region src/lib/game-object/garbage/simple-to-container-handler.d.ts
/**
 * Recycle object(s) to a container, optionally matching owning slot.
 */
export declare class SimpleToContainerHandler implements GarbageHandler {
  private readonly _recycleObjectNsids;
  private readonly _find;
  private _requirePlayerSlot;
  private _containerNsid;
  addRecycleObjectNsid(nsid: string): this;
  setContainerNsid(nsid: string): this;
  setRequireOwningPlayerSlot(value: boolean): this;
  canRecycle(obj: GameObject, _player: Player | undefined): boolean;
  recycle(obj: GameObject, _player: Player | undefined): boolean;
}
//#endregion
//#region src/lib/game-object/garbage/simple-to-snap-point-handler.d.ts
/**
 * Recycle an object to a specific snap point with the matching tag.
 * Requires snap point not already occupied.
 * Expects snap point is unique; does not look beyond first match.
 */
export declare class SimpleToSnapPointHandler implements GarbageHandler {
  private readonly _recycleObjectNsids;
  private readonly _find;
  private _snapPointTag;
  private _preSnapRotation;
  addRecycleObjectNsid(nsid: string): this;
  setSnapPointTag(tag: string): this;
  setPreSnapRotation(rot: Rotator | [pitch: number, yaw: number, roll: number]): this;
  canRecycle(obj: GameObject, _player: Player | undefined): boolean;
  recycle(obj: GameObject, _player: Player | undefined): boolean;
}
//#endregion
//#region src/lib/global/global-init.d.ts
export declare abstract class GlobalInit {
  /**
   * Run all the init functions (even if one throws).
   * Batch together all errors for one throw at the end.
   *
   * @param abstractGlobals
   */
  static runGlobalInit(abstractGlobals: Array<IGlobal>): void;
}
//#endregion
//#region src/lib/heap/heap.d.ts
/**
 * Collection of template type objects with associated number values.
 * Efficient add, peek/remove min.
 * @template T
 */
export declare class Heap<T> {
  private readonly _heap;
  /**
   * Get the size of the heap.
   * @returns {number} The size of the heap.
   */
  size(): number;
  /**
   * Peek at the minimum item in the heap without removing it.
   * @returns {T | undefined} The minimum item or undefined if the heap is empty.
   */
  peekMin(): T | undefined;
  /**
   * Swap two items in the heap.
   * @private
   * @param {number} a - The index of the first item.
   * @param {number} b - The index of the second item.
   * @throws {Error} If either index is out of bounds.
   */
  private _swap;
  /**
   * Add an item to the heap.
   * @param {T} item - The item to add.
   * @param {number} value - The value associated with the item.
   * @returns {Heap} The heap instance.
   * @throws {Error} If the item cannot be added.
   */
  add(item: T, value: number): this;
  /**
   * Remove the minimum item from the heap.
   * @returns {T | undefined} The removed item or undefined if the heap is empty.
   * @throws {Error} If the item cannot be removed.
   */
  removeMin(): T | undefined;
}
//#endregion
//#region src/lib/hex/hex.d.ts
export type HexType = `<${number},${number},${number}>`;
export type HexLayoutType = {
  f0: number;
  f1: number;
  f2: number;
  f3: number;
  b0: number;
  b1: number;
  b2: number;
  b3: number;
  startAngle: number;
};
export declare const HEX_LAYOUT_FLAT: HexLayoutType;
export declare const HEX_LAYOUT_POINTY: HexLayoutType;
/**
 * Heavily distilled hex math based on RedBlobGames excellent hex docs.
 * "Hex" values are strings for easy use as keys and comparison.
 */
export declare class Hex {
  private readonly _hexLayoutType;
  private readonly _halfSize;
  private readonly _tableHeight;
  /**
   * Get adjacent hexes.
   * First is "above", winding counterclockwise.
   *
   * @param {string} hex - Hex as "<q,r,s>" string
   * @return {Array} list of hex strings
   */
  static neighbors(hex: HexType): Array<HexType>;
  /**
   * Hex is a static-only class, do not instantiate it.
   */
  constructor(layout: HexLayoutType, halfSize: number);
  static _maybeHexFromString(hex: HexType): [q: number, r: number, s: number] | undefined;
  static _hexFromString(hex: HexType): [q: number, r: number, s: number];
  static _hexToString(q: number, r: number, s: number): HexType;
  /**
   * Get hex at position.
   *
   * @param {Vector} pos - Cartesian position on XY surface
   * @param {number} pos.x
   * @param {number} pos.y
   * @param {number} pos.z
   * @returns {string} hex as "<q,r,s>" string
   */
  fromPosition(pos: Vector): HexType;
  /**
   * Get position from hex.
   *
   * @param {string} hex - Hex as "<q,r,s>" string
   * @returns {Vector} position
   */
  toPosition(hex: HexType): Vector;
  fromCartesian(cartesian: {
    left: number;
    top: number;
  }): HexType;
  toCartesian(hex: HexType): {
    left: number;
    top: number;
  };
  /**
   * Get positions of hex corners.
   * First at "top right", winding counterclockwise.
   *
   * @param {string} hex - Hex as "<q,r,s>" string
   * @return {Array} list of position Vectors
   */
  corners(hex: HexType): Array<Vector>;
}
//#endregion
//#region src/lib/layout-objects/layout-objects.d.ts
export type LayoutObjectsSize = {
  w: number;
  h: number;
};
/**
 * Position objects, intended for initial table setup.
 */
export declare class LayoutObjects {
  private _children;
  private _horizontalAlignment;
  private _verticalAlignment;
  private _childDistance;
  private _isVertical;
  private _overrideHeight;
  private _overrideWidth;
  private _layoutCenter;
  readonly afterLayout: TriggerableMulticastDelegate<(...args: Array<any>) => any>;
  constructor();
  setChildDistance(value: number): this;
  setHorizontalAlignment(value: number): this;
  setVerticalAlignment(value: number): this;
  setIsVertical(value: boolean): this;
  setOverrideHeight(value: number): this;
  setOverrideWidth(value: number): this;
  add(item: GameObject | LayoutObjects): this;
  addAfterLayout(f: () => void): this;
  flip(flipH: boolean, flipV: boolean): this;
  /**
   * Get size of self, applying any overrides.
   *
   * @returns {LayoutObjectsSize}
   */
  calculateSize(): LayoutObjectsSize;
  /**
   * Get size from laying out children (ignore override on self).
   *
   * @returns {LayoutObjectsSize}
   */
  calculateChildrenSize(): LayoutObjectsSize;
  static _calculateChildSize(child: GameObject | LayoutObjects): LayoutObjectsSize;
  doLayoutAtPoint(center: Vector, yaw: number): this;
  getCenter(): Vector;
  layoutLeftOf(peer: GameObject, gap: number): this;
  layoutRightOf(peer: GameObject, gap: number): this;
  layoutAbove(peer: GameObject, gap: number): this;
  layoutBelow(peer: GameObject, gap: number): this;
}
//#endregion
//#region src/lib/layout-objects/layout-border.d.ts
export declare class LayoutBorder extends LayoutObjects {
  private _color;
  private _outlineWidth;
  private _tag;
  constructor(layoutObjects: LayoutObjects, padding: number);
  setColor(color: Color): LayoutBorder;
  setOutlineWidth(width: number): LayoutBorder;
  setTag(tag: string): LayoutBorder;
  _addBorder(): void;
}
//#endregion
//#region src/lib/locale/locale.d.ts
export declare const locale: {
  (key: string, replacement?: {
    [key: string]: string | number;
  }): string;
  inject(dict: {
    [key: string]: string;
  }): void;
};
//#endregion
//#region src/lib/nsid/nsid.d.ts
export type ParsedNSID = {
  nsid: string;
  typeParts: Array<string>;
  sourceParts: Array<string>;
  nameParts: Array<string>;
  extras: Array<string> | undefined;
};
export declare const DECK_NSID = "deck:?/?";
/**
 * Object metadata field uses a simple "type:source/name|extra" string.
 *
 * Each component is a dot (".") delimited series of strings.
 *
 * TYPE delineates the hierarchy to the specific object type.  Entries should
 * start generic and get more specific, for instance "card.action" is a card
 * from the action deck.  The TYPE field should be sufficient to locate where
 * the item belongs, in some cases augment with owning player slot.
 *
 * SOURCE is the produce/release with the item.  For instance, "base" could
 * mean the base game, or use an official expansion name.  Recommend homebrew
 * always start with "homebrew.{x}" where {x} is the identifier (to avoid
 * confusion with canon content sources).
 *
 * NAME is the item name.  It may include dot-delimited discriminators for
 * different versions of the same item (e.g. "direct_hit.1" vs "direct_hit.2").
 *
 * EXTRA should be avoided, there may be rare cases wanting fruther metadata.
 *
 * @see https://github.com/TI4-Online/TI4-TTPG/wiki/NSID-Namespace
 */
export declare abstract class NSID {
  /**
   * Create NSID from a metadata string or object.  A deck with multiple cards
   * gets a special "deck" NSID, consumers should call `stack` to get by card.
   *
   * This get strips off any extra metadata (after the "|") from the string.
   *
   * @param input
   * @returns NSID string
   */
  static get(input: StaticObject): string;
  static getExtras(input: StaticObject): Array<string>;
  static getWithExtra(input: StaticObject): string;
  /**
   * Get NSIDs for each card in a deck.
   *
   * @param input deck
   * @returns NSID array, per-card values
   */
  static getDeck(input: Card): Array<string>;
  static getDeckWithExtras(input: Card): Array<string>;
  /**
   * Parse this NSID into components (and sub-components, if dot delimited).
   *
   * @returns parsed
   */
  static parse(nsid: string): ParsedNSID | undefined;
}
//#endregion
//#region src/lib/perf/perf.d.ts
export type PerfReport = {
  median: number;
  mean: number;
  scrubbed: number;
  stdDev: number;
  fps: number;
};
/**
 * Singleton class for frames per second performance tracking.
 */
export declare class Perf implements IGlobal {
  private static _instance;
  private readonly _windowFrameSecs;
  private _nextWindowFrameMsecsIndex;
  private readonly _windowFps;
  private _nextWindowFpsIndex;
  private _lastFpsUpdateSecond;
  private _onTickHandler;
  /**
   * Returns the singleton instance of the Perf class.
   * @returns {Perf} The singleton instance.
   */
  static getInstance(): Perf;
  constructor(windowSize?: number);
  init(): void;
  destroy(): void;
  /**
   * Returns a performance report based on the current data.
   * @returns {PerfReport} The performance report.
   */
  getReport(): PerfReport;
  /**
   * Returns a string representation of the current performance report.
   * @returns {string} The string representation of the performance report.
   */
  getReportStr(): string;
  /**
   * Get per-second FPS for the last minute, in time order.
   *
   * @returns
   */
  getFpsHistory(): Array<number>;
}
//#endregion
//#region src/lib/polygon/polygon.d.ts
export type PolygonBoundingBox = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};
export type PolygonLineSegment = {
  a: Vector;
  b: Vector;
};
/**
 * Manage a polygon in the XY plane.
 */
export declare class Polygon {
  private readonly _polygon;
  private _boundingBox;
  /**
   * Join two-point segments sharing the tail of one with the head of another.
   * Useful for "faction borders" connecting a set of line segments.
   *
   * @param segments
   * @returns
   */
  static conjoin(segments: Array<PolygonLineSegment>): Array<Polygon>;
  constructor(points: Array<Vector>);
  /**
   * Briefly draw the polygon assuming world space coordinates.
   */
  drawDebug(): void;
  /**
   * Get polygon vertices.
   *
   * @returns {Array.<Vector>} List of vertices.
   */
  getPoints(): Array<Vector>;
  /**
   * Get polygon bounding box.
   *
   * @returns {Object} Dictionary from { left, top, right, bottom } to numbers.
   */
  getBoundingBox(): PolygonBoundingBox;
  /**
   * Is the point within the polygon's XY frame?
   *
   * @param {Vector} point
   * @returns {boolean} True if point inside polygon
   */
  contains(point: Vector): boolean;
  /**
   * Create a new polygon with an inset version of this one.
   *
   * @param {number} amount
   * @returns {Polygon} Inset polygon
   */
  inset(amount: number): Polygon;
}
//#endregion
//#region src/lib/setup/abstract-setup.d.ts
export type AbstractSetupParams = {
  playerSlot?: number;
  primaryColor?: Color;
  secondaryColor?: Color;
};
/**
 * Store owner information.
 */
export declare abstract class AbstractSetup {
  private readonly _playerSlot;
  private readonly _primaryColor;
  private readonly _secondaryColor;
  constructor(params?: AbstractSetupParams);
  getPlayerSlot(): number;
  getPrimaryColor(): Color;
  getSecondaryColor(): Color;
}
//#endregion
//#region src/lib/shuffle/shuffle.d.ts
/**
 * Shuffle an array of objects.  Original is not modified,
 * returns shuffled.
 */
export declare class Shuffle<T> {
  shuffle(items: Array<T>): Array<T>;
  choice(items: Array<T>): T | undefined;
  choiceOrThrow(items: Array<T>): T;
}
//#endregion
//#region src/lib/spawn/spawn.d.ts
/**
 * Registry for NSID to template id.
 */
export declare class Spawn {
  private _nsidToTemplateId;
  spawn(nsid: string, position?: Vector | [x: number, y: number, z: number], rotation?: Rotator | [pitch: number, yaw: number, roll: number]): GameObject | undefined;
  spawnOrThrow(nsid: string, position?: Vector | [x: number, y: number, z: number], rotation?: Rotator | [pitch: number, yaw: number, roll: number]): GameObject;
  spawnMergeDecksWithNsidPrefixOrThrow(nsidPrefix: string, position?: Vector | [x: number, y: number, z: number], rotation?: Rotator | [pitch: number, yaw: number, roll: number]): Card;
  spawnMergeDecks(nsids: Array<string>, position?: Vector | [x: number, y: number, z: number], rotation?: Rotator | [pitch: number, yaw: number, roll: number]): Card | undefined;
  spawnMergeDecksOrThrow(nsids: Array<string>, position?: Vector | [x: number, y: number, z: number], rotation?: Rotator | [pitch: number, yaw: number, roll: number]): Card;
  inject(dict: {
    [key: string]: string;
  }): this;
  has(nsid: string): boolean;
  clear(): this;
  getAllNsids(): Array<string>;
  getTemplateIdOrThrow(nsid: string): string;
  /**
   * Make sure all registered templates exist.
   */
  validate(): this;
}
//#endregion
//#region src/lib/svg/svg-sparkline/svg-sparkline.d.ts
export declare class SvgSparkline {
  static WIDTH: number;
  static HEIGHT: number;
  /**
   * Create a sparkline from non-negative numbers.
   *
   * @param values
   * @returns
   */
  static svg(values: Array<number>): string;
  static url(values: Array<number>): string;
}
//#endregion
//#region src/lib/swap-split-combine/swap-split-combine.d.ts
export type SwapSplitCombineRule = {
  src: {
    nsids: Array<string>;
    count: number;
  };
  dst: {
    nsid: string;
    count: number;
  };
  requireFaceUp?: boolean;
  requireFaceDown?: boolean;
  repeat: boolean;
};
/**
 * Replace one or more objects with others.  Applies the first matching rule.
 *
 * Useful to replace currency items with upper/lower versions.
 */
export declare class SwapSplitCombine implements IGlobal {
  private readonly _rules;
  private readonly _spawn;
  private readonly _nsids;
  private readonly _playerSlotToInProgressObjIdSet;
  private readonly _overrideCreate;
  private readonly _overrideDestroy;
  private readonly _overideSupplyCount;
  private readonly _primaryActionHandler;
  private readonly _objectCreatedHandler;
  constructor(rules: Array<SwapSplitCombineRule>, spawn: Spawn);
  addOverrideCreate(nsid: string, create: (player: Player) => GameObject | undefined): this;
  addOverrideDestroy(nsid: string, destroy: (obj: GameObject, player: Player) => void): this;
  addOverrideSupplyCount(nsid: string, supplyCount: (player: Player) => number): this;
  /**
   * Add "r" handler to relevant objects.
   */
  init(): void;
  _go(rObj: GameObject, player: Player): void;
  _getHoveredAndSelectedObjs(rObj: GameObject, player: Player): {
    [key: string]: Array<GameObject>;
  };
  /**
   * Apply the first matching rule.
   *
   * @param nsidToObjs
   * @param player
   */
  _applyRules(nsidToObjs: {
    [key: string]: Array<GameObject>;
  }, player: Player): void;
  _applyRule(rule: SwapSplitCombineRule, srcObjs: Array<GameObject>, player: Player): void;
}
//#endregion
//#region src/lib/timer/timer.d.ts
export type DirectionType = -1 | 1;
/**
 * Timer state, used to recreate the timer in the streamer overlay.
 */
export type TimerExportType = {
  anchorTimestamp: number;
  anchorValue: number;
  direction: DirectionType;
  active: boolean;
};
export declare class TimerBreakdown {
  private _sign;
  private _hours;
  private _minutes;
  private _seconds;
  constructor(overallSeconds: number);
  decrHours(): this;
  decrMinutes(): this;
  decrSeconds(): this;
  getHours(): number;
  getMinutes(): number;
  getSeconds(): number;
  getOverallSeconds(): number;
  incrHours(): this;
  incrMinutes(): this;
  incrSeconds(): this;
  toTimeString(): string;
}
/**
 * Timer, counts up or down.
 */
export declare class Timer {
  readonly onTimerExpired: TriggerableMulticastDelegate<() => void>;
  readonly onTimerTick: TriggerableMulticastDelegate<() => void>;
  private readonly _nameSpaceId;
  private _anchorTimestamp;
  private _anchorValue;
  private _direction;
  private _active;
  private _intervalHandle;
  _saveState(): void;
  _loadState(): void;
  constructor(nameSpaceId: NamespaceId);
  export(): TimerExportType;
  getDirection(): DirectionType;
  /**
   * Get absolute seconds, does not account for countdown.
   *
   * @returns number
   */
  getSeconds(): number;
  getTimeString(): string;
  start(value: number, direction: DirectionType): this;
  stop(): this;
  toggle(): this;
}
//#endregion
//#region src/lib/timer/edit-timer.d.ts
export declare class EditTimer {
  private readonly _timer;
  private _scale;
  constructor(timer: Timer);
  createWidget(onClose: () => void): Widget;
}
//#endregion
//#region src/lib/turn-order/turn-order.d.ts
export type Direction = "forward" | "reverse" | "snake";
export type PlayerSlot = number;
/**
 * Specify turn order with direction (forward, reverse, snake).
 * Provides a central, persistent state for passed and eliminiated players.
 */
export declare class TurnOrder {
  static readonly onTurnStateChanged: TriggerableMulticastDelegate<(turnOrder: TurnOrder) => void>;
  private static readonly _idToTurnOrder;
  private readonly _savedDataKey;
  private readonly _away;
  private readonly _passed;
  private readonly _eliminated;
  private _order;
  private _direction;
  private _currentTurn;
  private _snake;
  private _snakeNeedsAnotherTurn;
  static getInstance(savedDataKey: NamespaceId): TurnOrder;
  /**
   * Constructor.  Does NOT register with shared instance memory; ALWAYS
   * use getInstance if you want to find/create a shared instance.
   *
   * @param savedDataKey
   */
  constructor(savedDataKey: NamespaceId);
  getId(): NamespaceId;
  _saveState(): void;
  _restoreState(): void;
  nextTurn(): PlayerSlot;
  getCurrentTurn(): PlayerSlot;
  /**
   * Set current turn.
   *
   * Do not require it be in the current turn order: perhaps the caller is
   * about to chnage the order to match, or has some other wacky use in mind.
   *
   * @param playerSlot
   * @returns
   */
  setCurrentTurn(playerSlot: PlayerSlot): this;
  getTurnOrder(): Array<PlayerSlot>;
  setTurnOrder(order: Array<PlayerSlot>, direction: Direction, currentTurn: PlayerSlot): this;
  getDirection(): Direction;
  setDirection(direction: Direction): this;
  getAway(playerSlot: PlayerSlot): boolean;
  setAway(playerSlot: PlayerSlot, value: boolean): this;
  getEliminated(playerSlot: PlayerSlot): boolean;
  setEliminated(playerSlot: PlayerSlot, value: boolean): this;
  getPassed(playerSlot: PlayerSlot): boolean;
  setPassed(playerSlot: PlayerSlot, value: boolean): this;
}
//#endregion
//#region src/lib/ui/ui-visibility/ui-visibility.d.ts
/**
 * Set or toggle per-player visibility.
 */
export declare class UiVisibility {
  private readonly _ui;
  private readonly _obj;
  private _visibleToPlayerSlots;
  constructor(ui: UIElement | ScreenUIElement, obj?: GameObject);
  getPlayerPermission(): PlayerPermission;
  isVisibleToPlayer(playerSlot: number): boolean;
  setAll(): this;
  setNone(): this;
  setOnlyThisPlayer(playerSlot: number): this;
  togglePlayer(playerSlot: number): this;
  private _update;
}
//#endregion
//#region src/lib/ui/window/player-window.d.ts
/**
 * Window shown to a single player.  Player can grow/shrink, collapse, or warp
 * between screen space and world space (VR players only get world).
 */
export declare class PlayerWindow {
  private static readonly WORLD_SCALE_DELTA;
  private static readonly TITLE_HEIGHT;
  private static readonly TITLE_FONT_SIZE;
  private static readonly WORLD_SCALE;
  private static readonly PLAYER_SLOT_TO_SCALE_KEY;
  private readonly _params;
  private readonly _playerSlot;
  private _windowWidget;
  private _scale;
  private _target;
  private _collapsed;
  private _screenUi;
  private _worldUi;
  readonly onStateChanged: TriggerableMulticastDelegate<() => void>;
  static _saveScale(playerSlot: number, scale: number): void;
  static _loadScale(playerSlot: number): number;
  private readonly _onClickClose;
  private readonly _onClickCollapse;
  private readonly _onClickExpand;
  private readonly _onClickGrow;
  private readonly _onClickShrink;
  private readonly _onClickToScreen;
  private readonly _onClickToWorld;
  constructor(params: WindowParams, playerSlot: number);
  _getState(): string | undefined;
  _applyState(state: string): void;
  getPlayerSlot(): number;
  private _getLayoutSizes;
  _createWidget(): Widget;
  attach(): this;
  detach(): this;
  isAttached(): boolean;
  toggle(): this;
}
//#endregion
//#region src/lib/ui/window/window.d.ts
/**
 * UI, normally presented in screen space with the option to warp to world
 * (starts in world for VR players).  Optionally allow collapse, close.
 */
export declare class Window {
  private readonly _windowName;
  private readonly _playerWindows;
  /**
   * Called when window state changes (zoom-in, zoom-out, close, etc).
   */
  readonly onStateChanged: TriggerableMulticastDelegate<() => void>;
  readonly onAllClosed: TriggerableMulticastDelegate<() => void>;
  private readonly _customActionName;
  private readonly _customActionTooltip;
  private readonly _customActionHandler;
  _getState(): string | undefined;
  _applyState(state: string): void;
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
  constructor(params: WindowParams, playerSlots: Array<number>, persistenceKey?: NamespaceId);
  attach(): this;
  detach(): this;
  destroy(): void;
  isAttachedForPlayer(playerSlot: number): boolean;
  toggleForPlayer(playerSlot: number): this;
  addGlobalContextMenuToggle(): this;
}
//#endregion
//#region src/lib/weighted-choice/weighted-choice.d.ts
export type WeightedChoiceOption<T> = {
  weight: number;
  value: T;
};
/**
 * Class representing a weighted choice utility.
 * @class
 */
export declare class WeightedChoice<T> {
  private readonly _options;
  private readonly _totalWeight;
  /**
   * Constructs a new WeightedChoice instance.
   *
   * @param {Array<WeightedChoiceOption<T>>} options - The options to choose from.
   * @throws {Error} If any option weight is negative.
   */
  constructor(options: Array<WeightedChoiceOption<T>>);
  /**
   * Returns a randomly chosen option, with the likelihood of each option
   * being chosen proportional to its weight.
   *
   * @returns {T} The chosen option.
   * @throws {Error} If the method somehow fails to choose an option.
   */
  choice(): T;
}
//#endregion
//#region src/lib/whisper-reporter/whisper-reporter-locale.data.d.ts
export declare const WhisperReporterLocaleData: {
  [key: string]: string;
};
//#endregion
//#region src/lib/whisper-reporter/whisper-reporter.d.ts
export declare class WhisperReporter implements IGlobal {
  private readonly _onWhisper;
  init(): void;
}
//#endregion
//#region src/lib/widget/confirm-button/confirm-button.d.ts
/**
 * Two-stage button with a confirmation message requiring
 * an additional click.
 *
 * MUTATES THE GIVEN BUTTON, rewriting the button text to
 * the confirm message.
 */
export declare class ConfirmButton {
  private static readonly CONFIRM_TIMEOUT_MSECS;
  private readonly _wrappedButton;
  private readonly _initialButton;
  private readonly _switcher;
  private _confirmMessage;
  private _confirmFontSize;
  private _confirmTimeoutHandle;
  /**
   * Convert the given button into a two-stage button.
   *
   * @param wrapButton
   */
  constructor(wrapButton: Button);
  setConfirmFontSize(size: number): this;
  setConfirmMessage(message: string): this;
  /**
   * Overall widget for the two-stage button.
   *
   * @returns {Widget}
   */
  getWidget(): Widget;
}
//#endregion
//#region src/lib/widget/d6widget/d6widget.d.ts
/**
 * Show a single D6 face as a square widget.
 *
 * Do not extend a widget class, the class shell can be lost when retrieving
 * via getChild, etc.  Use an explicit getWidget method for the widget.
 */
export declare class D6Widget {
  private readonly _imageWidget;
  private readonly _canvas;
  private readonly _layoutBox;
  /**
   * Constructor.
   */
  constructor();
  /**
   * Set the widget / single-face image size.
   *
   * @param size
   * @returns self, for chaining
   */
  setSize(size: number): this;
  /**
   * Set the 3x3 dice face sheet:
   *
   * [ - 1 - ]
   * [ 2 3 6 ]
   * [ 5 4 - ]
   *
   * @param textureName
   * @param texturePackageId
   * @returns self, for chaining
   */
  setDiceImage(textureName: string, texturePackageId?: string): this;
  /**
   * Set which face is visible in the widget.
   *
   * @param index
   * @returns self, for chaining
   */
  setFace(index: number): this;
  /**
   * Get a widget suitable for UI.
   *
   * @returns Widget
   */
  getWidget(): Widget;
}
//#endregion
//#region src/lib/widget/end-turn-button/end-turn-button.d.ts
export type EndTurnButtonParams = {
  scale?: number;
  sound?: string;
  soundPackageId?: string;
  volume?: number;
};
/**
 * Display an "end turn" button on the current-active-player's screen.
 * Optionally play a sound when it becomes a player's turn.
 */
export declare class EndTurnButton {
  static readonly WIDTH = 180;
  static readonly HEIGHT = 60;
  static readonly FONT_SIZE = 18;
  static readonly BORDER_SIZE = 2;
  static readonly OFFSET_TOP = 50;
  private readonly _turnOrder;
  private readonly _params;
  private readonly _sound;
  private readonly _button;
  private readonly _border;
  private readonly _widget;
  private readonly _screenUI;
  private readonly _uiVisibility;
  private readonly _doUpdate;
  private readonly _onEndTurnClicked;
  constructor(turnOrder: TurnOrder, params: EndTurnButtonParams);
  destroy(): void;
  update(): void;
  getWidget(): Widget;
  attachToScreen(): this;
  detach(): this;
}
//#endregion
//#region src/lib/widget/end-turn-button/end-turn-locale.data.d.ts
export declare const EndTurnLocaleData: {
  [key: string]: string;
};
//#endregion
//#region src/lib/widget/hot-seat-button/hot-seat-button.d.ts
export type HotSeatButtonParams = {
  scale?: number;
};
/**
 * "End turn" button that sets no active player (hiding card holders, etc),
 * and becomes "Start turn" for the next player to seat them.
 */
export declare class HotSeatButton {
  static readonly WIDTH = 180;
  static readonly HEIGHT = 60;
  static readonly FONT_SIZE = 18;
  static readonly BORDER_SIZE = 2;
  static readonly OFFSET_TOP = 50;
  private readonly _turnOrder;
  private readonly _button;
  private readonly _border;
  private readonly _widget;
  private readonly _screenUI;
  private readonly _doUpdate;
  private readonly _onEndTurnClicked;
  constructor(turnOrder: TurnOrder, params: HotSeatButtonParams);
  destroy(): void;
  getWidget(): Widget;
  attachToScreen(): this;
  detach(): this;
}
//#endregion
//#region src/lib/widget/hot-seat-button/hot-seat-locale.data.d.ts
export declare const HotSeatLocaleData: {
  [key: string]: string;
};
//#endregion
//#region src/lib/widget/perf-widget/perf-widget-locale.data.d.ts
export declare const PerfWidgetLocaleData: {
  [key: string]: string;
};
//#endregion
//#region src/lib/widget/perf-widget/perf-widget.d.ts
export declare class PerfWidget {
  private readonly _perf;
  private readonly _webBrowser;
  private readonly _fpsText;
  private readonly _screenUI;
  private readonly _uiVisibility;
  private readonly _refresh;
  private readonly _refreshHandle;
  private readonly _toggleVisibilityActionName;
  private readonly _onCustomActionHandler;
  constructor();
  destroy(): void;
  refresh(): this;
  getWidget(): Widget;
  toggleVisibility(playerSlot: number): this;
  attachToScreen(): this;
  detach(): this;
}
//#endregion
//#region src/lib/widget/turn-order-widget/turn-entry-widget.d.ts
/**
 * A single widget in the TurnOrderWidget's vertical stack.
 */
export declare class TurnEntryWidget {
  private readonly _params;
  private readonly _nameWidth;
  private readonly _widget;
  private readonly _contentButton;
  private readonly _canvas;
  private readonly _bgBorder;
  private readonly _nameText;
  private readonly _passedLine;
  private readonly _warts;
  private readonly _nameCenter;
  static computeFontSize(boxHeight: number): number;
  static truncateLongText(boxWidth: number, text: string): string;
  static getFgBgColors(turnOrder: TurnOrder, playerSlot: number): {
    fgColor: Color;
    bgColor: Color;
  };
  constructor(params: TurnOrderWidgetParams);
  destroy(): void;
  getWidget(): Widget;
  getCanvas(): Canvas;
  update(turnOrder: TurnOrder, playerSlot: number): void;
}
//#endregion
//#region src/lib/widget/turn-order-widget/turn-entry-wart.d.ts
export type TurnEntryWartGenerator = (widget: TurnEntryWidget, params: TurnOrderWidgetParams) => TurnEntryWart;
/**
 * Augment a TurnEntryWidget.  May update its own widgets independently of
 * changes to turn order (e.g. change score value when score changes).
 */
export declare abstract class TurnEntryWart {
  /**
   * TurnEntryWidget retired, remove any event handlers, etc.
   */
  abstract destroy(): void;
  /**
   * Update the turn entry widget.
   */
  abstract update(playerSlot: number, fgColor: Color, bgColor: Color): void;
}
//#endregion
//#region src/lib/widget/turn-order-widget/turn-order-widget-params.d.ts
export declare const TurnOrderWidgetDefaults: {
  readonly DEFAULT_ENTRY_WIDTH: 150;
  readonly DEFAULT_ENTRY_HEIGHT: 25;
  readonly DEFAULT_RESERVE_SLOTS: 8;
};
export type TurnOrderWidgetParams = {
  entryWidth?: number;
  entryHeight?: number;
  margins?: {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
  };
  nameBox?: {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
  };
  wartGenerators?: Array<TurnEntryWartGenerator>;
  reserveSlots?: number;
  togglePassed?: boolean;
  toggleEliminated?: boolean;
  customActions?: Array<{
    name: string;
    tooltip?: string;
    identifier?: string;
  }>;
  onCustomAction?: (clickingPlayer: Player, identifier: string, targetPlayerSlot: number) => void;
};
//#endregion
//#region src/lib/widget/turn-order-widget/turn-clicked-widget.d.ts
/**
 * "Popup" with options when clicking on a TurnEntryWidget.
 */
export declare class TurnClickedWidget {
  private readonly _turnOrder;
  private readonly _params;
  private readonly _targetPlayerSlot;
  private readonly _targetPlayerName;
  private readonly _targetPlayerIndex;
  private _screenUI;
  constructor(turnOrder: TurnOrder, params: TurnOrderWidgetParams, playerSlot: number);
  _createSetTurnButton(): Button;
  _createTogglePassedButton(): Button;
  _createToggleEliminatedButton(): Button;
  _createCancelButton(): Button;
  getWidget(): Widget;
  attachToScreen(visibleToPlayer: Player): this;
  detach(): this;
}
//#endregion
//#region src/lib/widget/turn-order-widget/turn-order-locale.data.d.ts
export declare const TurnOrderLocaleData: {
  [key: string]: string;
};
//#endregion
//#region src/lib/widget/turn-order-widget/turn-order-widget.d.ts
/**
 * Display turn order, update when turn order changes.
 */
export declare class TurnOrderWidget {
  private readonly _params;
  private readonly _turnOrder;
  private readonly _panel;
  private readonly _screenUI;
  private readonly _uiVisibility;
  private _turnEntryWidgets;
  private readonly _intervalId;
  private readonly _doUpdate;
  private readonly _toggleVisibilityActionName;
  private readonly _onCustomActionHandler;
  constructor(turnOrder: TurnOrder, params: TurnOrderWidgetParams);
  destroy(): void;
  getWidget(): Widget;
  update(): this;
  attachToScreen(): this;
  detach(): this;
  isVisibleTo(playerSlot: number): boolean;
  toggleVisibility(playerSlot: number): this;
}
//#endregion
//#region src/locale.data.d.ts
export declare const GlobalLocaleData: {
  readonly "button.cancel": "Cancel";
  readonly "button.ok": "OK";
};
//#endregion