import { Button, Canvas, Card, CardHolder, Color, Container, Dice, FetchOptions, FetchResponse, GameObject, MultistateObject, Player, PlayerPermission, Rotator, ScreenUIElement, SnapPoint, StaticObject, UIElement, Vector, Widget } from "@tabletop-playground/api";
//#region src/lib/adjacency/adjacency.d.ts
export type AdjacencyNodeType = string;
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
  removeNode(node: AdjacencyNodeType): this;
  get(origin: AdjacencyNodeType, maxDistance: number): ReadonlyArray<AdjacencyPathType>;
}
//#endregion
//#region src/lib/atop/atop.d.ts
export declare class Atop {
  private readonly _obj;
  private readonly _scaledExtent;
  constructor(obj: GameObject);
  isAtop(pos: Vector): boolean;
}
//#endregion
//#region src/lib/broadcast/broadcast.d.ts
export declare class Broadcast {
  static get ERROR(): Color;
  static lastMessage: string;
  static broadcastAll(message: string, color?: Color | [r: number, g: number, b: number, a: number]): void;
  static broadcastOne(player: Player, message: string, color?: Color | [r: number, g: number, b: number, a: number]): void;
  static chatAll(message: string, color?: Color | [r: number, g: number, b: number, a: number]): void;
  static chatOne(player: Player, message: string, color?: Color | [r: number, g: number, b: number, a: number]): void;
}
//#endregion
//#region src/lib/global/i-global.d.ts
export interface IGlobal {
  init(): void;
}
//#endregion
//#region src/lib/bug-workarounds/bug-card-holder-assignment/bug-card-holder-assignment.d.ts
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
export declare class BugForceTransformUpdates implements IGlobal {
  private readonly _idToRemainingPokeCount;
  readonly _maybeStartPoking: (obj: GameObject) => void;
  init(): void;
  pokeAll(): void;
  poke(obj: GameObject, dir: number): void;
}
//#endregion
//#region src/lib/bug-workarounds/bug-unique-cards/bug-unique-cards.d.ts
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
  dealToHolder(card: Card, playerSlot: number): boolean;
  fetchCard(nsid: string): Card | undefined;
  filterCards(deck: Card, filter: (nsid: string) => boolean): Card | undefined;
  isLooseCard(obj: GameObject, allowFaceDown?: boolean, rejectSnapPointTags?: Array<string>): boolean;
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
  overrideActivePlayerSlot(playerSlot: number): this;
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
export declare abstract class AbstractRightClickCard implements IGlobal {
  private readonly _cardNsidPrefix;
  private readonly _customActionNames;
  private readonly _tooltips;
  private readonly _customActionHandler;
  constructor(cardNsidPrefix: string, customActionName: string, customActionHandler: (object: GameObject, player: Player, identifier: string) => void);
  setTooltip(actionName: string, tooltip: string): this;
  addCustomActionName(customActionName: string): this;
  init(): void;
}
//#endregion
//#region src/lib/context-menu/abstract-right-click-deck/abstract-right-click-deck.d.ts
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
export declare class LeaveSeat implements IGlobal {
  static readonly CUSTOM_ACTION_NAME = "*Leave Seat";
  private static readonly _customActionHandler;
  init(): void;
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
export declare class DataStore {
  private readonly _root;
  constructor(dataStoreId: NamespaceId);
  delete(dataId: NamespaceId): void;
  set(dataId: NamespaceId, data: string): void;
  get(dataId: NamespaceId): string | undefined;
  private _getRootEntry;
  private _getChain;
  private _allocBlock;
  private _releaseBlock;
  private _addStoreToAvailable;
  private _removeStoreFromAvailable;
  private _getStore;
  private _allocStore;
  private _releaseStore;
}
//#endregion
//#region src/lib/dice-group/dice-group.d.ts
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
export declare class DiceGroupCleanup implements IGlobal {
  init(): void;
}
export declare class DiceGroup {
  static readonly DEFAULT_TIMEOUT_SECONDS = 3;
  static readonly DEFAULT_DELETE_AFTER_SECONDS = 5;
  static roll(params: DiceGroupParams): void;
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
export declare class TriggerableMulticastDelegate<T extends (...args: Array<any>) => any> {
  private readonly _listeners;
  private _triggerDepth;
  add(fn: T): void;
  remove(fn: T): void;
  clear(): void;
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
  clone(start: number, end: number): TimeSpanRecord;
  toString(): string;
}
export declare class TimeSpans<T extends TimeSpanRecord> {
  private readonly _spans;
  add(timeSpanRecord: T): this;
  getSpans(): Array<T>;
  evictOld(time: number): this;
  clampLast(time: number): this;
  split(time: number): this;
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
  parse(summary: string): Array<SpeakingRecord>;
}
//#endregion
//#region src/lib/discord/discord-web-hook/discord-web-hook.d.ts
export declare class DiscordWebHook {
  private readonly URL;
  private _id;
  private _token;
  setId(id: string): this;
  setToken(token: string): this;
  put(message: string): Promise<string>;
  get(messageId: string): Promise<string>;
  dele(messageId: string): Promise<void>;
}
//#endregion
//#region src/lib/error-handler/bugsplat-remote-reporter.d.ts
export type BugSplatRemoteReporterParams = {
  database: string;
  appName: string;
  appVersion: string;
};
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
export declare class ErrorHandler implements IGlobal {
  static readonly onError: TriggerableMulticastDelegate<(error: string, rawError?: string) => void>;
  private readonly _reverseBase64Alphabet;
  private readonly _fileToLineMapping;
  constructor();
  init(): void;
  reportError(error: string): void;
  rewriteError(error: string): string;
  parseErrorLocation(stackTraceLine: string): ErrorLocation | undefined;
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
export declare class FindTracking {
  private readonly _trackNsids;
  private readonly _nsidToObjIds;
  private readonly _onObjectCreated;
  private readonly _onObjectDestroyed;
  private readonly _onSingletonCardCreated;
  private readonly _onSingletonCardMadeDeck;
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
  reverseUI(): void;
}
//#endregion
//#region src/lib/game-object/deleted-items-container/deleted-items-container.d.ts
export declare class DeletedItemsContainer {
  static IGNORE_TAG: string;
  private static readonly _ignoreNSIDs;
  private readonly _container;
  private readonly _oneTimeSkipObjIds;
  static destroyWithoutCopying(obj: GameObject): void;
  static ignoreNSIDs(nsids: Array<string>): void;
  constructor(container: Container);
  _onObjectDestroyed(obj: GameObject): void;
}
//#endregion
//#region src/lib/game-object/garbage/garbage-container.d.ts
export declare abstract class GarbageHandler {
  abstract canRecycle(obj: GameObject, player: Player | undefined): boolean;
  abstract recycle(obj: GameObject, player: Player | undefined): boolean;
}
export declare class GarbageContainer {
  static onRecycled: TriggerableMulticastDelegate<(objId: string, objName: string, objMetadata: string, player: Player | undefined) => void>;
  private static _garbageHandlers;
  private readonly _container;
  static addHandler(garbageHandler: GarbageHandler): void;
  static clearHandlers(): void;
  static tryRecycle(obj: GameObject, player: Player | undefined): boolean;
  private static _tryRecycleObj;
  private static _tryRecycleDeck;
  constructor(container: Container);
  _recycle(player: Player | undefined): void;
}
//#endregion
//#region src/lib/game-object/garbage/simple-card-garbage-handler.d.ts
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
  static runGlobalInit(abstractGlobals: Array<IGlobal>): void;
}
//#endregion
//#region src/lib/heap/heap.d.ts
export declare class Heap<T> {
  private readonly _heap;
  size(): number;
  peekMin(): T | undefined;
  private _swap;
  add(item: T, value: number): this;
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
export declare class Hex {
  private readonly _hexLayoutType;
  private readonly _halfSize;
  private readonly _tableHeight;
  static neighbors(hex: HexType): Array<HexType>;
  constructor(layout: HexLayoutType, halfSize: number);
  static _maybeHexFromString(hex: HexType): [q: number, r: number, s: number] | undefined;
  static _hexFromString(hex: HexType): [q: number, r: number, s: number];
  static _hexToString(q: number, r: number, s: number): HexType;
  fromPosition(pos: Vector): HexType;
  toPosition(hex: HexType): Vector;
  fromCartesian(cartesian: {
    left: number;
    top: number;
  }): HexType;
  toCartesian(hex: HexType): {
    left: number;
    top: number;
  };
  corners(hex: HexType): Array<Vector>;
}
//#endregion
//#region src/lib/layout-objects/layout-objects.d.ts
export type LayoutObjectsSize = {
  w: number;
  h: number;
};
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
  calculateSize(): LayoutObjectsSize;
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
export declare abstract class NSID {
  static get(input: StaticObject): string;
  static getExtras(input: StaticObject): Array<string>;
  static getWithExtra(input: StaticObject): string;
  static getDeck(input: Card): Array<string>;
  static getDeckWithExtras(input: Card): Array<string>;
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
export declare class Perf implements IGlobal {
  private static _instance;
  private readonly _windowFrameSecs;
  private _nextWindowFrameMsecsIndex;
  private readonly _windowFps;
  private _nextWindowFpsIndex;
  private _lastFpsUpdateSecond;
  private _onTickHandler;
  static getInstance(): Perf;
  constructor(windowSize?: number);
  init(): void;
  destroy(): void;
  getReport(): PerfReport;
  getReportStr(): string;
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
export declare class Polygon {
  private readonly _polygon;
  private _boundingBox;
  static conjoin(segments: Array<PolygonLineSegment>): Array<Polygon>;
  constructor(points: Array<Vector>);
  drawDebug(): void;
  getPoints(): Array<Vector>;
  getBoundingBox(): PolygonBoundingBox;
  contains(point: Vector): boolean;
  inset(amount: number): Polygon;
}
//#endregion
//#region src/lib/setup/abstract-setup.d.ts
export type AbstractSetupParams = {
  playerSlot?: number;
  primaryColor?: Color;
  secondaryColor?: Color;
};
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
export declare class Shuffle<T> {
  shuffle(items: Array<T>): Array<T>;
  choice(items: Array<T>): T | undefined;
  choiceOrThrow(items: Array<T>): T;
}
//#endregion
//#region src/lib/spawn/spawn.d.ts
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
  validate(): this;
}
//#endregion
//#region src/lib/svg/svg-sparkline/svg-sparkline.d.ts
export declare class SvgSparkline {
  static WIDTH: number;
  static HEIGHT: number;
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
  init(): void;
  _go(rObj: GameObject, player: Player): void;
  _getHoveredAndSelectedObjs(rObj: GameObject, player: Player): {
    [key: string]: Array<GameObject>;
  };
  _applyRules(nsidToObjs: {
    [key: string]: Array<GameObject>;
  }, player: Player): void;
  _applyRule(rule: SwapSplitCombineRule, srcObjs: Array<GameObject>, player: Player): void;
}
//#endregion
//#region src/lib/timer/timer.d.ts
export type DirectionType = -1 | 1;
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
  constructor(savedDataKey: NamespaceId);
  getId(): NamespaceId;
  _saveState(): void;
  _restoreState(): void;
  nextTurn(): PlayerSlot;
  getCurrentTurn(): PlayerSlot;
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
export declare class Window {
  private readonly _windowName;
  private readonly _playerWindows;
  readonly onStateChanged: TriggerableMulticastDelegate<() => void>;
  readonly onAllClosed: TriggerableMulticastDelegate<() => void>;
  private readonly _customActionName;
  private readonly _customActionTooltip;
  private readonly _customActionHandler;
  _getState(): string | undefined;
  _applyState(state: string): void;
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
export declare class WeightedChoice<T> {
  private readonly _options;
  private readonly _totalWeight;
  constructor(options: Array<WeightedChoiceOption<T>>);
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
export declare class ConfirmButton {
  private static readonly CONFIRM_TIMEOUT_MSECS;
  private readonly _wrappedButton;
  private readonly _initialButton;
  private readonly _switcher;
  private _confirmMessage;
  private _confirmFontSize;
  private _confirmTimeoutHandle;
  constructor(wrapButton: Button);
  setConfirmFontSize(size: number): this;
  setConfirmMessage(message: string): this;
  getWidget(): Widget;
}
//#endregion
//#region src/lib/widget/d6widget/d6widget.d.ts
export declare class D6Widget {
  private readonly _imageWidget;
  private readonly _canvas;
  private readonly _layoutBox;
  constructor();
  setSize(size: number): this;
  setDiceImage(textureName: string, texturePackageId?: string): this;
  setFace(index: number): this;
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
export declare abstract class TurnEntryWart {
  abstract destroy(): void;
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