Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let _tabletop_playground_api = require("@tabletop-playground/api");
let js_base64 = require("js-base64");
let fastest_levenshtein = require("fastest-levenshtein");
let zod = require("zod");
//#region src/lib/heap/heap.ts
/**
* Collection of template type objects with associated number values.
* Efficient add, peek/remove min.
* @template T
*/
var Heap = class {
	constructor() {
		this._heap = [];
	}
	/**
	* Get the size of the heap.
	* @returns {number} The size of the heap.
	*/
	size() {
		return this._heap.length;
	}
	/**
	* Peek at the minimum item in the heap without removing it.
	* @returns {T | undefined} The minimum item or undefined if the heap is empty.
	*/
	peekMin() {
		var _this$_heap$;
		return (_this$_heap$ = this._heap[0]) === null || _this$_heap$ === void 0 ? void 0 : _this$_heap$.item;
	}
	/**
	* Swap two items in the heap.
	* @private
	* @param {number} a - The index of the first item.
	* @param {number} b - The index of the second item.
	* @throws {Error} If either index is out of bounds.
	*/
	_swap(a, b) {
		const aHeapEntry = this._heap[a];
		const bHeapEntry = this._heap[b];
		if (aHeapEntry === void 0 || bHeapEntry === void 0) throw new Error("missing entry");
		this._heap[a] = bHeapEntry;
		this._heap[b] = aHeapEntry;
	}
	/**
	* Add an item to the heap.
	* @param {T} item - The item to add.
	* @param {number} value - The value associated with the item.
	* @returns {Heap} The heap instance.
	* @throws {Error} If the item cannot be added.
	*/
	add(item, value) {
		this._heap.push({
			item,
			value
		});
		let currentIndex = this._heap.length - 1;
		while (currentIndex > 0) {
			const upIndex = Math.floor(currentIndex / 2);
			const currentHeapEntry = this._heap[currentIndex];
			const upHeapEntry = this._heap[upIndex];
			if (!currentHeapEntry || !upHeapEntry) throw new Error("missing entry");
			if (currentHeapEntry.value > upHeapEntry.value) break;
			this._swap(currentIndex, upIndex);
			currentIndex = upIndex;
		}
		return this;
	}
	/**
	* Remove the minimum item from the heap.
	* @returns {T | undefined} The removed item or undefined if the heap is empty.
	* @throws {Error} If the item cannot be removed.
	*/
	removeMin() {
		const firstHeapEntry = this._heap[0];
		if (!firstHeapEntry) return;
		const lastHeapEntry = this._heap.pop();
		if (!lastHeapEntry) throw new Error("no last heap entry");
		if (this._heap.length === 0) return firstHeapEntry.item;
		this._heap[0] = lastHeapEntry;
		let currentHeapEntry;
		let leftHeapEntry;
		let rightHeapEntry;
		let currentIndex = 0;
		do {
			const leftIndex = currentIndex * 2 + 1;
			const rightIndex = currentIndex * 2 + 2;
			currentHeapEntry = this._heap[currentIndex];
			leftHeapEntry = this._heap[leftIndex];
			rightHeapEntry = this._heap[rightIndex];
			if (!currentHeapEntry) throw new Error("no current heap entry");
			if (!leftHeapEntry && !rightHeapEntry) break;
			if (leftHeapEntry && !rightHeapEntry) {
				if ((currentHeapEntry === null || currentHeapEntry === void 0 ? void 0 : currentHeapEntry.value) >= leftHeapEntry.value) {
					this._swap(currentIndex, leftIndex);
					currentIndex = leftIndex;
				}
				break;
			}
			if (leftHeapEntry && rightHeapEntry) {
				const left = leftHeapEntry.value;
				const right = rightHeapEntry.value;
				const current = currentHeapEntry.value;
				if (left <= right) {
					if (current > left) {
						this._swap(currentIndex, leftIndex);
						currentIndex = leftIndex;
					} else break;
				} else if (current > right) {
					this._swap(currentIndex, rightIndex);
					currentIndex = rightIndex;
				} else break;
			}
		} while (leftHeapEntry && rightHeapEntry);
		return firstHeapEntry.item;
	}
};
//#endregion
//#region src/lib/adjacency/adjacency.ts
var Adjacency = class {
	constructor() {
		this._srcNodeOutgoingLinks = /* @__PURE__ */ new Map();
	}
	addLink(link) {
		let outgoingLinks = this._srcNodeOutgoingLinks.get(link.src);
		if (!outgoingLinks) {
			outgoingLinks = /* @__PURE__ */ new Set();
			this._srcNodeOutgoingLinks.set(link.src, outgoingLinks);
		}
		link = Object.freeze(link);
		outgoingLinks.add(link);
		return this;
	}
	hasLink(link) {
		const outgoingLinks = this._srcNodeOutgoingLinks.get(link.src);
		if (outgoingLinks) {
			for (const outgoingLink of outgoingLinks) if (outgoingLink.src === link.src && outgoingLink.dst === link.dst && outgoingLink.distance === link.distance && outgoingLink.isTransit === link.isTransit) return true;
		}
		return false;
	}
	/**
	* Remove all links starting OR ENDING from the given node.
	*
	* @param node
	*/
	removeNode(node) {
		this._srcNodeOutgoingLinks.delete(node);
		for (const outgoingLinks of this._srcNodeOutgoingLinks.values()) {
			const dele = /* @__PURE__ */ new Set();
			for (const link of outgoingLinks) if (link.dst === node) dele.add(link);
			for (const link of dele) outgoingLinks.delete(link);
		}
		return this;
	}
	/**
	* Compute shortest paths to all nodes within maxDistance.
	*
	* @param origin
	* @param maxDistance
	* @returns
	*/
	get(origin, maxDistance) {
		const nodeToAdjacencyPath = /* @__PURE__ */ new Map();
		const toExplore = /* @__PURE__ */ new Set();
		const explored = /* @__PURE__ */ new Set();
		toExplore.add(origin);
		const heap = new Heap().add(origin, 0);
		nodeToAdjacencyPath.set(origin, {
			node: origin,
			distance: 0,
			path: []
		});
		let closestNode;
		while (toExplore.size > 0 && (closestNode = heap.removeMin())) {
			const closest = nodeToAdjacencyPath.get(closestNode);
			if (closest && !explored.has(closest.node)) {
				toExplore.delete(closest.node);
				explored.add(closest.node);
				const outgoingLinks = this._srcNodeOutgoingLinks.get(closest.node);
				if (outgoingLinks) for (const outgoingLink of outgoingLinks) {
					const dst = outgoingLink.dst;
					if (!explored.has(dst)) {
						const distance = closest.distance + outgoingLink.distance;
						const path = [...closest.path, outgoingLink];
						if (distance <= maxDistance) {
							toExplore.add(dst);
							heap.add(dst, distance);
							nodeToAdjacencyPath.set(dst, {
								node: dst,
								distance,
								path
							});
						}
					}
				}
			}
		}
		const result = [...nodeToAdjacencyPath.values()].filter((adjacencyPathType) => {
			const lastLink = adjacencyPathType.path[adjacencyPathType.path.length - 1];
			return lastLink !== void 0 && !lastLink.isTransit;
		}).map((adjacencyPathType) => {
			return Object.freeze(adjacencyPathType);
		});
		result.sort((a, b) => {
			if (a.distance < b.distance) return -1;
			else if (a.distance > b.distance) return 1;
			if (a.node < b.node) return -1;
			else if (a.node > b.node) return 1;
			return 0;
		});
		return result;
	}
};
//#endregion
//#region src/lib/atop/atop.ts
/**
* Is a position within an object's XY space? (account for scale and rotaton)
* Becomes invalid if object size/scale changes.
*/
var Atop = class {
	constructor(obj) {
		this._obj = obj;
		this._scaledExtent = obj.getExtent(false, false);
		const scale = obj.getScale();
		if (scale.x !== 0 && scale.y !== 0) {
			this._scaledExtent.x /= scale.x;
			this._scaledExtent.y /= scale.y;
		}
	}
	isAtop(pos) {
		const local = this._obj.worldPositionToLocal(pos);
		return Math.abs(local.x) <= this._scaledExtent.x && Math.abs(local.y) <= this._scaledExtent.y;
	}
};
//#endregion
//#region src/lib/broadcast/broadcast.ts
/**
* Send messages to one or all players.
*/
var Broadcast = class Broadcast {
	static get ERROR() {
		return new _tabletop_playground_api.Color(1, 0, 0, 1);
	}
	static #_ = this.lastMessage = "";
	/**
	* Sends a message to all players, appears on screen and in chat.
	*
	* @param {string} message - The message to send.
	* @param {Color | [number, number, number, number]} [color] - The color of the message.
	*/
	static broadcastAll(message, color) {
		if (_tabletop_playground_api.GameWorld.getExecutionReason() !== "unittest") console.log(`Broadcast.broadcastAll: ${message}`);
		for (const player of _tabletop_playground_api.world.getAllPlayers()) {
			player.showMessage(message);
			player.sendChatMessage(message, color ?? [
				1,
				1,
				1,
				1
			]);
		}
		Broadcast.lastMessage = message;
	}
	/**
	* Sends a message to one player, appears on screen and in chat.
	*
	* @param {Player} player - The player to send the message to.
	* @param {string} message - The message to send.
	* @param {Color | [number, number, number, number]} [color] - The color of the message.
	*/
	static broadcastOne(player, message, color) {
		if (_tabletop_playground_api.GameWorld.getExecutionReason() !== "unittest") console.log(`Broadcast.broadcastOne: ${message}`);
		player.showMessage(message);
		player.sendChatMessage(message, color ?? [
			1,
			1,
			1,
			1
		]);
		Broadcast.lastMessage = message;
	}
	/**
	* Sends a chat message to all players.
	*
	* @param {string} message - The message to send.
	* @param {Color | [number, number, number, number]} [color] - The color of the message.
	*/
	static chatAll(message, color) {
		if (_tabletop_playground_api.GameWorld.getExecutionReason() !== "unittest") console.log(`Broadcast.chatAll: ${message}`);
		for (const player of _tabletop_playground_api.world.getAllPlayers()) player.sendChatMessage(message, color ?? [
			1,
			1,
			1,
			1
		]);
		Broadcast.lastMessage = message;
	}
	/**
	* Sends a chat message to one player.
	*
	* @param {Player} player - The player to send the message to.
	* @param {string} message - The message to send.
	* @param {Color | [number, number, number, number]} [color] - The color of the message.
	*/
	static chatOne(player, message, color) {
		if (_tabletop_playground_api.GameWorld.getExecutionReason() !== "unittest") console.log(`Broadcast.chatOne (${player.getName()}): ${message}`);
		player.sendChatMessage(message, color ?? [
			1,
			1,
			1,
			1
		]);
		Broadcast.lastMessage = message;
	}
};
//#endregion
//#region src/lib/nsid/nsid.ts
const DECK_NSID = "deck:?/?";
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
var NSID = class NSID {
	/**
	* Create NSID from a metadata string or object.  A deck with multiple cards
	* gets a special "deck" NSID, consumers should call `stack` to get by card.
	*
	* This get strips off any extra metadata (after the "|") from the string.
	*
	* @param input
	* @returns NSID string
	*/
	static get(input) {
		let metadata = NSID.getWithExtra(input);
		const extraStartIndex = metadata.indexOf("|");
		if (extraStartIndex > -1) metadata = metadata.substring(0, extraStartIndex);
		return metadata;
	}
	static getExtras(input) {
		const metadata = NSID.getWithExtra(input);
		const extraStartIndex = metadata.indexOf("|");
		let extra = "";
		if (extraStartIndex > -1) extra = metadata.substring(extraStartIndex + 1);
		return extra.split("|");
	}
	static getWithExtra(input) {
		let metadata = input.getTemplateMetadata();
		if (input instanceof _tabletop_playground_api.Card) {
			if (input.getStackSize() === 1) {
				const cardMetadata = input.getCardDetails().metadata;
				if (cardMetadata.length > 0) metadata = cardMetadata;
			} else metadata = DECK_NSID;
		}
		return metadata;
	}
	/**
	* Get NSIDs for each card in a deck.
	*
	* @param input deck
	* @returns NSID array, per-card values
	*/
	static getDeck(input) {
		return this.getDeckWithExtras(input).map((nsid) => {
			const extraStartIndex = nsid.indexOf("|");
			if (extraStartIndex > -1) return nsid.substring(0, extraStartIndex);
			return nsid;
		});
	}
	static getDeckWithExtras(input) {
		return input.getAllCardDetails().map((cardDetails) => {
			return cardDetails.metadata;
		});
	}
	/**
	* Parse this NSID into components (and sub-components, if dot delimited).
	*
	* @returns parsed
	*/
	static parse(nsid) {
		var _m$;
		const m = nsid.match(/^([^:]+):([^/]+)\/([^|]+)\|?(.*)$/);
		const type = (m === null || m === void 0 ? void 0 : m[1]) ?? "";
		const source = (m === null || m === void 0 ? void 0 : m[2]) ?? "";
		const name = (m === null || m === void 0 ? void 0 : m[3]) ?? "";
		const extra = (m === null || m === void 0 ? void 0 : m[4]) ?? "";
		if (!m) return;
		return {
			nsid,
			typeParts: type.split("."),
			sourceParts: source.split("."),
			nameParts: name.split("."),
			extras: extra.length > 0 ? (_m$ = m[4]) === null || _m$ === void 0 ? void 0 : _m$.split("|") : void 0
		};
	}
};
//#endregion
//#region src/lib/find/find.ts
/**
* Find things in the game world.  Generally speaking finds the first matching
* candidate; expecting objects to be unique.
*/
var Find = class Find {
	constructor() {
		this._cardHolders = [];
		this._nsidAndSlotToGameObject = {};
		this._snapPointTagAndSlotToSnapPoint = {};
		this._playerSlotToCardHolder = {};
	}
	static #_ = this.__ignoreCardHolderNsids = /* @__PURE__ */ new Set();
	static ignoreOwnedCardHolderNsid(nsid) {
		Find.__ignoreCardHolderNsids.add(nsid);
	}
	getOwnedCardHolders() {
		for (const cardHolder of this._cardHolders) if (!cardHolder.isValid()) {
			this._cardHolders = [];
			break;
		}
		if (this._cardHolders.length === 0) for (const obj of _tabletop_playground_api.world.getAllObjects(true)) {
			if (!(obj instanceof _tabletop_playground_api.CardHolder)) continue;
			const nsid = NSID.get(obj);
			if (Find.__ignoreCardHolderNsids.has(nsid)) continue;
			this._cardHolders.push(obj);
		}
		return this._cardHolders;
	}
	closestOwnedCardHolderOwner(pos) {
		let closestOwner = -1;
		let closestDistance = Number.MAX_VALUE;
		for (const cardHolder of this.getOwnedCardHolders()) {
			if (!cardHolder.isValid()) continue;
			const owner = cardHolder.getOwningPlayerSlot();
			if (owner === -1) continue;
			const distance = cardHolder.getPosition().subtract(pos).magnitudeSquared();
			if (distance < closestDistance) {
				closestOwner = owner;
				closestDistance = distance;
			}
		}
		return closestOwner;
	}
	findCard(nsid, playerSlot, skipContained = false) {
		const card = this.findGameObject(nsid, playerSlot, skipContained);
		if (card && !(card instanceof _tabletop_playground_api.Card)) throw new Error(`findCard: "${nsid}" not a Card`);
		return card;
	}
	findCardHolder(nsid, playerSlot, skipContained = false) {
		const card = this.findGameObject(nsid, playerSlot, skipContained);
		if (card && !(card instanceof _tabletop_playground_api.CardHolder)) throw new Error(`findCardHolder: "${nsid}" not a CardHolder`);
		return card;
	}
	findCardHolderBySlot(playerSlot, skipContained = false) {
		const cardHolder = this._playerSlotToCardHolder[playerSlot];
		if (cardHolder === null || cardHolder === void 0 ? void 0 : cardHolder.isValid()) return cardHolder;
		for (const obj of _tabletop_playground_api.world.getAllObjects(skipContained)) {
			if (!(obj instanceof _tabletop_playground_api.CardHolder)) continue;
			if (obj.getOwningPlayerSlot() !== playerSlot) continue;
			this._playerSlotToCardHolder[playerSlot] = obj;
			return obj;
		}
	}
	findContainer(nsid, playerSlot, skipContained = false) {
		const container = this.findGameObject(nsid, playerSlot, skipContained);
		if (container && !(container instanceof _tabletop_playground_api.Container)) throw new Error(`findContainer: "${nsid}" not a Container`);
		return container;
	}
	findDeckOrDiscard(deckSnapPointTag, discardSnapPointTag, shuffleDiscard, playerSlot) {
		const deckSnapPoint = this.findSnapPointByTag(deckSnapPointTag, playerSlot);
		if (!deckSnapPoint) return;
		const deck = deckSnapPoint.getSnappedObject();
		if (deck && deck instanceof _tabletop_playground_api.Card && deck.isValid()) return deck;
		if (!discardSnapPointTag) return;
		const discardSnapPoint = this.findSnapPointByTag(discardSnapPointTag, playerSlot);
		if (!discardSnapPoint) return;
		const discard = discardSnapPoint.getSnappedObject();
		if (!discard || !(discard instanceof _tabletop_playground_api.Card) || !discard.isValid()) return;
		if (shuffleDiscard) discard.shuffle();
		const above = deckSnapPoint.getGlobalPosition().add([
			0,
			0,
			10
		]);
		discard.setPosition(above);
		discard.setRotation([
			0,
			0,
			0
		]);
		discard.snapToGround();
		discard.snap();
		return discard;
	}
	findDice(nsid, playerSlot, skipContained = false) {
		const dice = this.findGameObject(nsid, playerSlot, skipContained);
		if (dice && !(dice instanceof _tabletop_playground_api.Dice)) throw new Error(`findDice: "${nsid}" not a Dice`);
		return dice;
	}
	findGameObject(nsid, playerSlot, skipContained = false) {
		const key = `${nsid}@${playerSlot ?? ""}`;
		const gameObject = this._nsidAndSlotToGameObject[key];
		if (gameObject && gameObject.isValid() && (playerSlot === void 0 || gameObject.getOwningPlayerSlot() === playerSlot)) return gameObject;
		for (const obj of _tabletop_playground_api.world.getAllObjects(skipContained)) {
			if (NSID.get(obj) !== nsid) continue;
			if (playerSlot !== void 0 && obj.getOwningPlayerSlot() !== playerSlot) continue;
			this._nsidAndSlotToGameObject[key] = obj;
			return obj;
		}
	}
	findMultistateObject(nsid, playerSlot, skipContained = false) {
		const multistateObject = this.findGameObject(nsid, playerSlot, skipContained);
		if (multistateObject && !(multistateObject instanceof _tabletop_playground_api.MultistateObject)) throw new Error(`findMultistateObject: "${nsid}" not a MultistateObject`);
		return multistateObject;
	}
	findSnapPointByTag(tag, playerSlot) {
		const key = `${tag}@${playerSlot ?? ""}`;
		const cachedSnapPoint = this._snapPointTagAndSlotToSnapPoint[key];
		const parent = cachedSnapPoint === null || cachedSnapPoint === void 0 ? void 0 : cachedSnapPoint.getParentObject();
		if (cachedSnapPoint && (!parent || parent.isValid())) return cachedSnapPoint;
		for (const obj of _tabletop_playground_api.world.getAllTables()) for (const snapPoint of obj.getAllSnapPoints()) if (snapPoint.getTags().includes(tag)) {
			this._snapPointTagAndSlotToSnapPoint[key] = snapPoint;
			return snapPoint;
		}
		for (const obj of _tabletop_playground_api.world.getAllObjects(true)) {
			if (playerSlot !== void 0 && obj.getOwningPlayerSlot() !== playerSlot) continue;
			for (const snapPoint of obj.getAllSnapPoints()) if (snapPoint.getTags().includes(tag)) {
				this._snapPointTagAndSlotToSnapPoint[key] = snapPoint;
				return snapPoint;
			}
		}
	}
};
//#endregion
//#region src/lib/error-handler/error-batcher.ts
var ErrorBatcher = class ErrorBatcher {
	/**
	* Get error as string including stack trace (not just name/message).
	*
	* @param error
	* @returns {string}
	*/
	static errorToString(error) {
		const entry = [];
		if (error.stack && error.stack.length > 0) entry.push(error.stack);
		return entry.join("\n");
	}
	static runMaybeThrowAtEnd(runnables) {
		const errors = ErrorBatcher.runGatherErrors(runnables);
		if (errors.length > 0) {
			const message = `ErrorBatcher (${errors.length}):`;
			const stack = errors.map((error) => ErrorBatcher.errorToString(error)).join("\n");
			const error = new Error(message);
			error.stack = stack;
			throw error;
		}
	}
	static runGatherErrors(runnables) {
		const errors = [];
		for (const runnable of runnables) try {
			runnable.apply(null, []);
		} catch (errorUnknownType) {
			if (errorUnknownType instanceof Error) errors.push(errorUnknownType);
		}
		return errors;
	}
};
//#endregion
//#region src/lib/event/triggerable-multicast-delegate/triggerable-multicast-delegate.ts
/**
* Lookalike for TTPG's MulticastDelegate, but with a trigger method.
*/
var TriggerableMulticastDelegate = class {
	constructor() {
		this._listeners = [];
		this._triggerDepth = 0;
	}
	/**
	* Add a function to the trigger set.
	*
	* @param fn
	*/
	add(fn) {
		this._listeners.push(fn);
	}
	/**
	* Remove a function from the trigger set.
	*
	* @param fn
	*/
	remove(fn) {
		for (let i = this._listeners.length - 1; i >= 0; i--) if (this._listeners[i] === fn) this._listeners.splice(i, 1);
	}
	/**
	* Clear the trigger set.
	*/
	clear() {
		this._listeners.splice(0);
	}
	/**
	* Call every function in the trigger set.
	*
	* Call every function even if one throws, send gathered errors at end directly to error handler;
	* does not throw/stop processing.
	*
	* @param args
	*/
	trigger(...args) {
		if (this._triggerDepth > 3) throw new Error("Maximum trigger depth exceeded");
		this._triggerDepth++;
		try {
			const runnables = [];
			for (const fn of this._listeners) runnables.push(() => {
				fn(...args);
			});
			ErrorBatcher.runMaybeThrowAtEnd(runnables);
		} catch (errorUnknownType) {
			if (errorUnknownType instanceof Error && errorUnknownType.stack && globalThis.$uncaughtException) globalThis.$uncaughtException(errorUnknownType.stack);
		} finally {
			this._triggerDepth--;
		}
	}
};
//#endregion
//#region src/lib/error-handler/error-handler.ts
const BIT_MASK = {
	LEAST_FOUR_BITS: 15,
	LEAST_FIVE_BITS: 31,
	CONTINUATION_BIT: 32,
	SIGN_BIT: 1
};
/**
* Report stack traces with filenames relative to the Script directory,
* use source mappings to report both js and transpiled ts line numbers.
*
* Add `"sourceMap": true` to the compilerOptions of your tsconfig.json.
*
* Install the error handler via `new ErrorHandler().init()`.
*/
var ErrorHandler = class ErrorHandler {
	static #_ = this.onError = new TriggerableMulticastDelegate();
	constructor() {
		this._fileToLineMapping = {};
		const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		this._reverseBase64Alphabet = new Map(base64Alphabet.split("").map((c, i) => [c, i]));
	}
	init() {
		globalThis.$uncaughtException = (error) => {
			const rewrittenError = this.rewriteError(error);
			this.reportError(rewrittenError);
			ErrorHandler.onError.trigger(rewrittenError, error);
		};
	}
	reportError(error) {
		const msg = [];
		msg.push("----------");
		msg.push(error);
		msg.push("----------");
		console.log(msg.join("\n"));
	}
	rewriteError(error) {
		const rewrite = [];
		for (const errorLine of error.split("\n")) {
			const errorLocation = this.parseErrorLocation(errorLine);
			if (errorLocation) {
				let line = `  at ${errorLocation.method} ${errorLocation.file}:${errorLocation.jsLine}`;
				if (errorLocation.tsLine !== void 0) line += ` <= .ts:${errorLocation.tsLine}`;
				rewrite.push(line);
			} else rewrite.push(errorLine);
		}
		return rewrite.join("\n");
	}
	/**
	* Parse error location from a single line of a stack trace.
	*
	* @param stackTraceLine
	* @returns error location
	*/
	parseErrorLocation(stackTraceLine) {
		let errorLocation;
		const re1 = /at file:\/\/.*Scripts\/(.*\.js):([0-9]*):([0-9]*)/;
		const re2 = /at (.*) \(file:\/\/.*Scripts\/(.*\.js):([0-9]*):([0-9]*)\)/;
		let m;
		let method;
		let file;
		let jsLine;
		let jsColumn;
		m = stackTraceLine.match(re1);
		if (m) {
			file = m[1];
			jsLine = m[2];
			jsColumn = m[3];
		} else {
			m = stackTraceLine.match(re2);
			if (m) {
				method = m[1];
				file = m[2];
				jsLine = m[3];
				jsColumn = m[4];
			}
		}
		if (method === void 0 && file !== void 0 && jsLine !== void 0 && jsColumn !== void 0) errorLocation = {
			file,
			jsLine: Number.parseInt(jsLine),
			jsColumn: Number.parseInt(jsColumn)
		};
		else if (method !== void 0 && file !== void 0 && jsLine !== void 0 && jsColumn !== void 0) errorLocation = {
			method,
			file,
			jsLine: Number.parseInt(jsLine),
			jsColumn: Number.parseInt(jsColumn)
		};
		if (errorLocation) {
			const lineMapping = this.getLineMapping(errorLocation.file);
			if (lineMapping) errorLocation.tsLine = lineMapping[errorLocation.jsLine];
		}
		return errorLocation;
	}
	/**
	* Get the "{x}.js.map" file contents as a string.
	*
	* @param jsFile
	* @returns
	*/
	getMap(jsFile) {
		for (const pkg of _tabletop_playground_api.world.getAllowedPackages()) {
			const mapFile = jsFile + ".map";
			if (pkg.getScriptFiles().includes(jsFile) && pkg.getScriptFiles().includes(mapFile)) {
				const map = _tabletop_playground_api.world.importText(mapFile, pkg.getUniqueId());
				if (map && map.length > 0) return map;
			}
		}
	}
	getLineMapping(jsFile) {
		if (jsFile === "") return;
		let lineMapping = this._fileToLineMapping[jsFile];
		if (lineMapping) {
			if (lineMapping.length === 0) return;
			return lineMapping;
		}
		this._fileToLineMapping[jsFile] = [];
		const json = this.getMap(jsFile);
		if (!json) return;
		let map;
		try {
			map = JSON.parse(json);
		} catch (_e) {
			console.log(`ErrorHandler.getLineMapping: JSON.parse failed for "${jsFile}"`);
			return;
		}
		if (typeof map.mappings !== "string") {
			console.log(`ErrorHandler.getLineMapping: bad mappings entry for "${jsFile}"`);
			return;
		}
		lineMapping = this.parseSourceMappings(map.mappings);
		this._fileToLineMapping[jsFile] = lineMapping;
		return lineMapping;
	}
	parseSourceMappings(mappingsEncoded) {
		const lineMapping = [];
		let lastTsLine = 0;
		const mappings = mappingsEncoded.split(";");
		for (const mapping of mappings) {
			const firstSegment = mapping.split(",")[0];
			if (firstSegment !== void 0) {
				let tsLine = this.parseSourceMappingSegment(firstSegment)[2];
				if (tsLine === void 0) tsLine = 0;
				if (tsLine > 0) {
					tsLine += lastTsLine;
					lastTsLine = tsLine;
				}
				lineMapping.push(tsLine);
			}
		}
		return lineMapping;
	}
	_parseSextets(segment) {
		return segment.split("").map((c) => {
			const sextet = this._reverseBase64Alphabet.get(c);
			if (sextet === void 0) throw new Error(`${segment} is not a valid base64 encoded VLQ`);
			return sextet;
		});
	}
	_splitVlqs(sextets) {
		const vlqs = [];
		let vlq = [];
		for (const sextet of sextets) {
			vlq.push(sextet);
			if ((sextet & BIT_MASK.CONTINUATION_BIT) === 0) {
				vlqs.push(vlq);
				vlq = [];
			}
		}
		if (vlq.length > 0) throw new Error(`Malformed VLQ sequence [${sextets.join(", ")}]: The last VLQ never ended.`);
		return vlqs;
	}
	parseSourceMappingSegment(segment) {
		const sextets = this._parseSextets(segment);
		const vlqs = this._splitVlqs(sextets);
		const result = [];
		for (const vlq of vlqs) {
			let x = 0;
			let isNegative = false;
			vlq.reverse().forEach((sextet, index) => {
				if (index === vlq.length - 1) {
					isNegative = (sextet & BIT_MASK.SIGN_BIT) === 1;
					sextet >>>= 1;
					x <<= 4;
					x |= sextet & BIT_MASK.LEAST_FOUR_BITS;
				} else {
					x <<= 5;
					x |= sextet & BIT_MASK.LEAST_FIVE_BITS;
				}
			});
			result.push(isNegative ? -x : x);
		}
		return result;
	}
};
if (_tabletop_playground_api.GameWorld.getExecutionReason() === "unittest") afterEach(() => {
	ErrorHandler.onError.clear();
});
//#endregion
//#region src/lib/bug-workarounds/bug-card-holder-assignment/bug-card-holder-assignment.ts
/**
* Monitor card holder, expect it to be the primary holder for
* the owning player slot player.
*/
var BugCardHolderAssignment = class {
	constructor(cardHolderNsid) {
		this._find = new Find();
		this._reportErrors = false;
		this._intervalRunnable = () => {
			this._run();
		};
		this._cardHolderNsid = cardHolderNsid;
	}
	init() {
		this._intervalHandle = setInterval(this._intervalRunnable, 5e3);
	}
	destroy() {
		if (this._intervalHandle !== void 0) {
			clearInterval(this._intervalHandle);
			this._intervalHandle = void 0;
		}
	}
	setReportErrors(reportErrors) {
		this._reportErrors = reportErrors;
		return this;
	}
	_run() {
		for (const player of _tabletop_playground_api.world.getAllPlayers()) {
			const playerSlot = player.getSlot();
			const cardHolder = this._find.findCardHolder(this._cardHolderNsid, playerSlot, true);
			if (cardHolder && player.getHandHolder() !== cardHolder) {
				player.setHandHolder(cardHolder);
				const msg = `BugCardHolderAssignment: re-attached for slot ${playerSlot}`;
				console.log(msg);
				if (this._reportErrors) ErrorHandler.onError.trigger(msg);
			}
		}
	}
};
//#endregion
//#region src/lib/bug-workarounds/bug-force-transform-updates/bug-force-transform-updates.ts
const DELTA = .021;
/**
* Object transforms aren't getting replicated reliably.
* When an object stops moving, force a few transform updates.
*/
var BugForceTransformUpdates = class {
	constructor() {
		this._idToRemainingPokeCount = /* @__PURE__ */ new Map();
		this._maybeStartPoking = (obj) => {
			const id = obj.getId();
			if (this._idToRemainingPokeCount.get(id) === void 0) this._idToRemainingPokeCount.set(id, 3);
		};
	}
	init() {
		const linkObj = (obj) => {
			obj.onMovementStopped.add(this._maybeStartPoking);
			obj.onSnapped.add(this._maybeStartPoking);
		};
		for (const obj of _tabletop_playground_api.world.getAllObjects()) linkObj(obj);
		_tabletop_playground_api.globalEvents.onObjectCreated.add(linkObj);
		setInterval(() => {
			this.pokeAll();
		}, 100);
	}
	pokeAll() {
		for (const [id, count] of this._idToRemainingPokeCount) {
			const obj = _tabletop_playground_api.world.getObjectById(id);
			if (!obj || !obj.isValid() || count < -1 || obj.isHeld()) this._idToRemainingPokeCount.delete(id);
			else if (count >= 0) {
				this._idToRemainingPokeCount.set(id, count - 1);
				const dir = count % 2 === 1 ? 1 : -1;
				this.poke(obj, dir);
			}
		}
	}
	poke(obj, dir) {
		const pos = obj.getPosition();
		const rot = obj.getRotation();
		pos.x += dir * DELTA;
		rot.yaw += dir * DELTA;
		obj.setPosition(pos);
		obj.setRotation(rot);
	}
};
//#endregion
//#region src/lib/card-util/card-util.ts
var CardUtil = class {
	constructor() {
		this._find = new Find();
	}
	/**
	* Deal card to the player's card holder.
	* (Card.deal may fail if holder is not attached to player.)
	*
	* @param card
	* @param playerSlot
	* @returns
	*/
	dealToHolder(card, playerSlot) {
		let holder;
		const player = _tabletop_playground_api.world.getPlayerBySlot(playerSlot);
		holder = player === null || player === void 0 ? void 0 : player.getHandHolder();
		if (!holder) holder = this._find.findCardHolderBySlot(playerSlot, true);
		card.setRotation([
			0,
			0,
			180
		]);
		return (holder === null || holder === void 0 ? void 0 : holder.insert(card, holder.getNumCards())) ?? false;
	}
	/**
	* Find the card anywhere on the table / in-deck / in-holder.
	* Remove from deck or holder, if applicable.
	*
	* @param nsid
	* @returns
	*/
	fetchCard(nsid) {
		let card;
		for (const obj of _tabletop_playground_api.world.getAllObjects(false)) {
			if (!(obj instanceof _tabletop_playground_api.Card)) continue;
			if (obj.getStackSize() === 1) {
				if (NSID.get(obj) === nsid) {
					card = obj;
					break;
				}
				continue;
			}
			const offset = NSID.getDeck(obj).indexOf(nsid);
			if (offset < 0) continue;
			card = obj.takeCards(1, true, offset, false);
			if (card) break;
		}
		const container = card === null || card === void 0 ? void 0 : card.getContainer();
		if (card && container) container.remove(card);
		const cardHolder = card === null || card === void 0 ? void 0 : card.getHolder();
		if (card && cardHolder) {
			const index = cardHolder.getCards().indexOf(card);
			if (index >= 0) cardHolder.removeAt(index);
		}
		if (card === null || card === void 0 ? void 0 : card.isHeld()) card.release();
		return card;
	}
	/**
	* Extract filter-approved cards into a new deck.  Leave any remaining
	* cards in the old deck (may potentially become empty).
	*
	* @param deck
	* @param filter
	* @returns - new deck with filtered cards
	*/
	filterCards(deck, filter) {
		let result;
		const nsids = NSID.getDeck(deck);
		for (let i = nsids.length - 1; i >= 0; i--) {
			const nsid = nsids[i];
			if (nsid && filter(nsid)) {
				let card;
				if (deck.getStackSize() === 1) card = deck;
				else {
					const numCards = 1;
					const fromFront = true;
					const offset = i;
					card = deck.takeCards(numCards, fromFront, offset, false);
				}
				if (card) {
					if (result) result.addCards(card, true, 0, false, false);
					else result = card;
				}
			}
		}
		return result;
	}
	/**
	* Is this card a singleton (not a deck), not held by a player, etc.
	*
	* @param obj
	* @param allowFaceDown
	* @returns
	*/
	isLooseCard(obj, allowFaceDown, rejectSnapPointTags) {
		if (rejectSnapPointTags) {
			const snapPoint = obj.getSnappedToPoint();
			if (snapPoint) {
				const tags = snapPoint.getTags();
				for (const tag of tags) if (rejectSnapPointTags.includes(tag)) return false;
			}
		}
		return obj instanceof _tabletop_playground_api.Card && (allowFaceDown || obj.isFaceUp()) && obj.getStackSize() === 1 && !obj.getContainer() && !obj.isHeld() && !obj.isInHolder() && obj.isValid();
	}
	/**
	* Split a deck into an array of single-card objects.
	*
	* @param deck
	* @returns
	*/
	separateDeck(deck) {
		const cards = [];
		while (deck.getStackSize() > 1) {
			const card = deck.takeCards(1, true, 0, false);
			if (card) cards.push(card);
		}
		cards.push(deck);
		return cards;
	}
};
//#endregion
//#region src/lib/game-object/deleted-items-container/deleted-items-container.ts
/**
* Add the obj version of this to a container to make a copy of deleted objects.
*/
var DeletedItemsContainer = class DeletedItemsContainer {
	static #_ = this.IGNORE_TAG = "_deleted_items_ignore_";
	static #_2 = this._ignoreNSIDs = /* @__PURE__ */ new Set();
	/**
	* Destroy the object without adding to a deleted items container.
	*
	* @param obj
	*/
	static destroyWithoutCopying(obj) {
		const tags = obj.getTags();
		tags.push(this.IGNORE_TAG);
		obj.setTags(tags);
		obj.destroy();
	}
	/**
	* Never copy these deleted items.
	*
	* @param nsids
	*/
	static ignoreNSIDs(nsids) {
		for (const nsid of nsids) DeletedItemsContainer._ignoreNSIDs.add(nsid);
	}
	constructor(container) {
		this._oneTimeSkipObjIds = /* @__PURE__ */ new Set();
		if (!container || !(container instanceof _tabletop_playground_api.Container)) throw new Error("missing/bad container");
		this._container = container;
		const onDestroyed = (obj) => {
			this._onObjectDestroyed(obj);
		};
		_tabletop_playground_api.globalEvents.onObjectDestroyed.add(onDestroyed);
		container.onDestroyed.add(() => {
			_tabletop_playground_api.globalEvents.onObjectDestroyed.remove(onDestroyed);
		});
		const onInserted = (card, insertedCard) => {
			const id = insertedCard.getId();
			this._oneTimeSkipObjIds.add(id);
		};
		const onCreated = (obj) => {
			if (obj instanceof _tabletop_playground_api.Card) obj.onInserted.add(onInserted);
		};
		for (const obj of _tabletop_playground_api.world.getAllObjects(false)) onCreated(obj);
		_tabletop_playground_api.globalEvents.onObjectCreated.add(onCreated);
		container.onDestroyed.add(() => {
			_tabletop_playground_api.globalEvents.onObjectCreated.remove(onCreated);
		});
	}
	_onObjectDestroyed(obj) {
		const id = obj.getId();
		if (this._oneTimeSkipObjIds.has(id)) {
			this._oneTimeSkipObjIds.delete(id);
			return;
		}
		const nsid = NSID.get(obj);
		if (DeletedItemsContainer._ignoreNSIDs.has(nsid)) return;
		if (obj.getTags().includes(DeletedItemsContainer.IGNORE_TAG)) return;
		if (obj.getTemplateId() === this._container.getTemplateId()) return;
		const json = obj.toJSONString();
		if (json.length > 0) {
			const clone = _tabletop_playground_api.world.createObjectFromJSON(json, [
				0,
				0,
				0
			]);
			if (clone) this._container.addObjects([clone]);
		}
	}
};
//#endregion
//#region src/lib/bug-workarounds/bug-unique-cards/bug-unique-cards.ts
/**
* Monitor all decks expecting no NSID (metadata) repeats.
* Prune extra cards if found.
*/
var BugUniqueCards = class {
	constructor() {
		this._cardUtil = new CardUtil();
		this._reportErrors = false;
		this._onInsertedHandler = (deck) => {
			process.nextTick(() => {
				this._processDeck(deck);
			});
		};
	}
	init() {
		for (const obj of _tabletop_playground_api.world.getAllObjects(false)) if (obj instanceof _tabletop_playground_api.Card) obj.onInserted.add(this._onInsertedHandler);
		_tabletop_playground_api.globalEvents.onObjectCreated.add((obj) => {
			if (obj instanceof _tabletop_playground_api.Card) obj.onInserted.add(this._onInsertedHandler);
		});
	}
	setReportErrors(reportErrors) {
		this._reportErrors = reportErrors;
		return this;
	}
	_processDeck(deck) {
		const seen = /* @__PURE__ */ new Set();
		const removed = this._cardUtil.filterCards(deck, (nsid) => {
			if (nsid.length > 0 && seen.has(nsid)) return true;
			seen.add(nsid);
			return false;
		});
		if (removed) {
			const removeCount = removed.getStackSize();
			const removeNsids = NSID.getDeck(removed);
			const residueCount = deck.getStackSize();
			DeletedItemsContainer.destroyWithoutCopying(removed);
			const msg = `BugUniqueCards: removed ${removeCount} duplicates, ${residueCount} remain [first dup: "${removeNsids[0]}"]`;
			console.log(msg);
			if (this._reportErrors) ErrorHandler.onError.trigger(msg);
		}
	}
};
//#endregion
//#region src/lib/chess-clock/chess-clock-config-widget.ts
var ChessClockConfigWidget = class {
	constructor(chessClockData, onOkClicked) {
		this._chessClockData = chessClockData;
		this._onOkClicked = onOkClicked;
		if (chessClockData.getPlayerOrder().length === 0) throw new Error("No players in chess clock data.");
	}
	create(params) {
		const panel = new _tabletop_playground_api.VerticalBox().setChildDistance(params.spacing * 3);
		panel.addChild(new _tabletop_playground_api.Text().setFontSize(params.fontSize * .6).setAutoWrap(true).setText("Create a countdown timer for each player, click a player name to override the active player. Click edit to adjust remaining time manually."));
		panel.addChild(new _tabletop_playground_api.Text().setFontSize(params.fontSize * .6).setAutoWrap(true).setText("The optional discord bot token enables monitoring active speakers, applying time to them instead of the current player."));
		const timeBudgetLabel = new _tabletop_playground_api.Text().setFontSize(params.fontSize).setText("Time Budget (minutes):");
		const timeBudget = new _tabletop_playground_api.Slider().setMinValue(1).setMaxValue(60).setValue(20).setStepSize(1).setFontSize(params.fontSize).setTextBoxWidth(params.fontSize * 4);
		const timeBudgetRow = new _tabletop_playground_api.HorizontalBox().setChildDistance(params.spacing).addChild(timeBudgetLabel, 0).addChild(timeBudget, 1);
		panel.addChild(timeBudgetRow);
		const discordKeyLabel = new _tabletop_playground_api.Text().setFontSize(params.fontSize).setText("Bot token:");
		const discordKey = new _tabletop_playground_api.TextBox().setFontSize(params.fontSize).setMaxLength(1023);
		const discordKeyRow = new _tabletop_playground_api.HorizontalBox().setChildDistance(params.spacing).addChild(discordKeyLabel, 0).addChild(discordKey, 1);
		panel.addChild(discordKeyRow);
		panel.addChild(new _tabletop_playground_api.LayoutBox(), 1);
		const cancelButton = new _tabletop_playground_api.Button().setFontSize(params.fontSize).setText("CANCEL");
		const okButton = new _tabletop_playground_api.Button().setFontSize(params.fontSize).setText("OK");
		const buttonRow = new _tabletop_playground_api.HorizontalBox().setChildDistance(params.spacing).addChild(cancelButton, 1).addChild(okButton, 1);
		panel.addChild(buttonRow);
		cancelButton.onClicked.add(() => {
			params.close();
		});
		okButton.onClicked.add(() => {
			params.close();
			const timeBudgetMinutes = timeBudget.getValue();
			const discordToken = discordKey.getText();
			this._chessClockData.setTimeBudgetSeconds(timeBudgetMinutes * 60);
			if (discordToken && discordToken.length > 0) this._chessClockData.connectDiscordSpeaking(discordToken);
			if (this._onOkClicked) this._onOkClicked();
		});
		return panel;
	}
	destroy() {}
};
//#endregion
//#region src/lib/ui/window/window-params.ts
const WINDOW_BUTTON_ASSET = {
	CLOSE: "ui/window/close.png",
	COLLAPSE: "ui/window/collapse.png",
	EXPAND: "ui/window/expand.png",
	GROW: "ui/window/grow.png",
	SHRINK: "ui/window/shrink.png",
	TO_SCREEN: "ui/window/to-screen.png",
	TO_WORLD: "ui/window/to-world.png"
};
//#endregion
//#region src/lib/event/throttle-click-handler/throttle-click-handler.ts
var ThrottleClickHandler = class ThrottleClickHandler {
	static #_ = this.THROTTLE_MSECS = 300;
	constructor(clickHandler) {
		this._playerSlotToLastClickMsecs = {};
		this._throttledHandler = (button, player) => {
			const playerSlot = player.getSlot();
			const lastClickMsecs = this._playerSlotToLastClickMsecs[playerSlot] ?? 0;
			const nowMsecs = Date.now();
			if (nowMsecs < lastClickMsecs + ThrottleClickHandler.THROTTLE_MSECS) return;
			this._playerSlotToLastClickMsecs[playerSlot] = nowMsecs;
			this._clickHandler(button, player);
		};
		this._clickHandler = clickHandler;
	}
	get() {
		return this._throttledHandler;
	}
};
//#endregion
//#region src/lib/ui/window/player-window.ts
const packageId = _tabletop_playground_api.refPackageId;
/**
* Window shown to a single player.  Player can grow/shrink, collapse, or warp
* between screen space and world space (VR players only get world).
*/
var PlayerWindow = class PlayerWindow {
	static #_ = this.WORLD_SCALE_DELTA = .1;
	static #_2 = this.TITLE_HEIGHT = 30;
	static #_3 = this.TITLE_FONT_SIZE = 24;
	static #_4 = this.WORLD_SCALE = 2;
	static #_5 = this.PLAYER_SLOT_TO_SCALE_KEY = "pwScale";
	static _saveScale(playerSlot, scale) {
		let json = _tabletop_playground_api.world.getSavedData(PlayerWindow.PLAYER_SLOT_TO_SCALE_KEY);
		if (!json || json.length === 0) json = "{}";
		const playerSlotToScale = JSON.parse(json);
		playerSlotToScale[playerSlot] = scale;
		json = JSON.stringify(playerSlotToScale);
		_tabletop_playground_api.world.setSavedData(json, PlayerWindow.PLAYER_SLOT_TO_SCALE_KEY);
	}
	static _loadScale(playerSlot) {
		let json = _tabletop_playground_api.world.getSavedData(PlayerWindow.PLAYER_SLOT_TO_SCALE_KEY);
		if (!json || json.length === 0) json = "{}";
		return JSON.parse(json)[playerSlot] ?? 1;
	}
	constructor(params, playerSlot) {
		this._scale = 1;
		this._target = "screen";
		this._collapsed = false;
		this.onStateChanged = new TriggerableMulticastDelegate();
		this._onClickClose = new ThrottleClickHandler(() => {
			this.detach();
			this.onStateChanged.trigger();
		}).get();
		this._onClickCollapse = new ThrottleClickHandler(() => {
			this.detach();
			this._collapsed = true;
			this.attach();
			this.onStateChanged.trigger();
		}).get();
		this._onClickExpand = new ThrottleClickHandler(() => {
			this.detach();
			this._collapsed = false;
			this.attach();
			this.onStateChanged.trigger();
		}).get();
		this._onClickGrow = new ThrottleClickHandler(() => {
			this.detach();
			this._scale += PlayerWindow.WORLD_SCALE_DELTA;
			this._scale = Math.min(this._scale, 3);
			PlayerWindow._saveScale(this._playerSlot, this._scale);
			this.attach();
			this.onStateChanged.trigger();
		}).get();
		this._onClickShrink = new ThrottleClickHandler(() => {
			this.detach();
			this._scale -= PlayerWindow.WORLD_SCALE_DELTA;
			this._scale = Math.max(this._scale, .3);
			PlayerWindow._saveScale(this._playerSlot, this._scale);
			this.attach();
			this.onStateChanged.trigger();
		}).get();
		this._onClickToScreen = new ThrottleClickHandler(() => {
			this.detach();
			this._target = "screen";
			this.attach();
			this.onStateChanged.trigger();
		}).get();
		this._onClickToWorld = new ThrottleClickHandler(() => {
			this.detach();
			this._target = "world";
			this.attach();
			this.onStateChanged.trigger();
		}).get();
		this._params = params;
		this._playerSlot = playerSlot;
		this._windowWidget = params.windowWidgetGenerator();
		this._target = params.defaultTarget ?? "screen";
		this._scale = PlayerWindow._loadScale(playerSlot);
	}
	_getState() {
		if (!this._screenUi && !this._worldUi) return;
		return JSON.stringify({
			s: this._scale,
			t: this._target === "screen" ? "s" : "w",
			c: this._collapsed,
			a: true
		});
	}
	_applyState(state) {
		if (state.length === 0) return;
		const parsed = JSON.parse(state);
		this._scale = Math.floor(parsed.s * 1e3) / 1e3;
		this._target = parsed.t === "s" ? "screen" : "world";
		this._collapsed = parsed.c;
		if (parsed.a) this.attach();
	}
	getPlayerSlot() {
		return this._playerSlot;
	}
	_getLayoutSizes() {
		const scale = this._scale * (this._target === "screen" ? 1 : PlayerWindow.WORLD_SCALE);
		const titleHeight = Math.ceil(PlayerWindow.TITLE_HEIGHT * scale);
		const titleFontSize = PlayerWindow.TITLE_FONT_SIZE * scale;
		const spacerHeight = Math.ceil(titleHeight * .1);
		const padding = spacerHeight * 2;
		return {
			titleHeight,
			titleFontSize,
			spacerHeight,
			padding,
			width: Math.ceil(this._params.size.width * scale) + padding * 2,
			height: titleHeight + (this._collapsed ? 0 : spacerHeight + Math.ceil(this._params.size.height * scale + padding * 2)) + padding * 2
		};
	}
	_createWidget() {
		const { titleHeight, titleFontSize, spacerHeight, padding, width, height } = this._getLayoutSizes();
		const buttonSize = titleHeight - padding;
		const titleBarPanel = new _tabletop_playground_api.HorizontalBox().setChildDistance(padding).setVerticalAlignment(_tabletop_playground_api.VerticalAlignment.Center);
		const title = new _tabletop_playground_api.Text().setBold(true).setFontSize(titleFontSize).setText(this._params.title ?? "");
		titleBarPanel.addChild(new _tabletop_playground_api.Widget(), 1);
		let button = new _tabletop_playground_api.ImageButton().setImageSize(buttonSize, buttonSize).setImage(WINDOW_BUTTON_ASSET.SHRINK, packageId);
		button.onClicked.add(this._onClickShrink);
		titleBarPanel.addChild(button, 0);
		button = new _tabletop_playground_api.ImageButton().setImageSize(buttonSize, buttonSize).setImage(WINDOW_BUTTON_ASSET.GROW, packageId);
		button.onClicked.add(this._onClickGrow);
		titleBarPanel.addChild(button, 0);
		if (!this._params.disableWarpScreenWorld) {
			const image = this._target === "screen" ? WINDOW_BUTTON_ASSET.TO_WORLD : WINDOW_BUTTON_ASSET.TO_SCREEN;
			const onClick = this._target === "screen" ? this._onClickToWorld : this._onClickToScreen;
			const button2 = new _tabletop_playground_api.ImageButton().setImageSize(buttonSize, buttonSize).setImage(image, packageId);
			button2.onClicked.add(onClick);
			titleBarPanel.addChild(button2, 0);
		}
		if (!this._params.disableCollapse) {
			const image = this._collapsed ? WINDOW_BUTTON_ASSET.EXPAND : WINDOW_BUTTON_ASSET.COLLAPSE;
			const onClick = this._collapsed ? this._onClickExpand : this._onClickCollapse;
			const button2 = new _tabletop_playground_api.ImageButton().setImageSize(buttonSize, buttonSize).setImage(image, packageId);
			button2.onClicked.add(onClick);
			titleBarPanel.addChild(button2, 0);
		}
		if (!this._params.disableClose) {
			const image = WINDOW_BUTTON_ASSET.CLOSE;
			const onClick = this._onClickClose;
			const button2 = new _tabletop_playground_api.ImageButton().setImageSize(buttonSize, buttonSize).setImage(image, packageId);
			button2.onClicked.add(onClick);
			titleBarPanel.addChild(button2, 0);
		}
		if (!this._windowWidget) throw new Error("Window widget not created");
		const spacer = new _tabletop_playground_api.Border().setColor([
			0,
			0,
			0,
			1
		]);
		const scale = this._scale * (this._target === "screen" ? 1 : PlayerWindow.WORLD_SCALE);
		const child = this._windowWidget.create({
			scale,
			fontSize: titleFontSize,
			spacing: padding,
			playerSlot: this._playerSlot,
			windowSize: {
				width: this._params.size.width * scale,
				height: this._params.size.height * scale
			},
			close: () => {
				this.detach();
				this.onStateChanged.trigger();
			}
		});
		const window = new _tabletop_playground_api.Canvas().addChild(new _tabletop_playground_api.Border(), 0, 0, width, height).addChild(title, padding, -padding * .1, width, titleHeight + padding * 2).addChild(titleBarPanel, padding, 0, width - padding * 2, titleHeight + padding * 2);
		if (!this._collapsed) window.addChild(spacer, 0, titleHeight + padding * 2, width, spacerHeight).addChild(child, padding, titleHeight + spacerHeight + padding * 3, width - padding * 2, height - titleHeight - spacerHeight - padding * 4);
		return window;
	}
	attach() {
		this.detach();
		if (this._windowWidget) throw new Error("Window widget already exists");
		this._windowWidget = this._params.windowWidgetGenerator();
		const player = _tabletop_playground_api.world.getPlayerBySlot(this._playerSlot);
		if (player === null || player === void 0 ? void 0 : player.isUsingVR()) this._target = "world";
		const { width, height } = this._getLayoutSizes();
		if (this._target === "screen") {
			var _this$_params$screen, _this$_params$screen2, _this$_params$screen3, _this$_params$screen4;
			const ui = new _tabletop_playground_api.ScreenUIElement();
			this._screenUi = ui;
			ui.anchorX = ((_this$_params$screen = this._params.screen) === null || _this$_params$screen === void 0 ? void 0 : _this$_params$screen.anchor.u) ?? .5;
			ui.anchorY = ((_this$_params$screen2 = this._params.screen) === null || _this$_params$screen2 === void 0 ? void 0 : _this$_params$screen2.anchor.v) ?? .5;
			ui.relativePositionX = true;
			ui.relativePositionY = true;
			ui.positionX = ((_this$_params$screen3 = this._params.screen) === null || _this$_params$screen3 === void 0 ? void 0 : _this$_params$screen3.pos.u) ?? 0;
			ui.positionY = ((_this$_params$screen4 = this._params.screen) === null || _this$_params$screen4 === void 0 ? void 0 : _this$_params$screen4.pos.v) ?? 0;
			ui.relativeWidth = false;
			ui.relativeHeight = false;
			ui.width = width + 4;
			ui.height = height + 4;
			ui.players = new _tabletop_playground_api.PlayerPermission().setPlayerSlots([this._playerSlot]);
			ui.widget = new _tabletop_playground_api.Border().setColor([
				0,
				0,
				0,
				1
			]).setChild(this._createWidget());
			_tabletop_playground_api.world.addScreenUI(ui);
		} else {
			var _this$_params$world, _this$_params$world2, _this$_params$world3, _this$_params$world4;
			const ui = new _tabletop_playground_api.UIElement();
			this._worldUi = ui;
			const rawPos = (_this$_params$world = this._params.world) === null || _this$_params$world === void 0 || (_this$_params$world = _this$_params$world.playerSlotToTransform[this._playerSlot]) === null || _this$_params$world === void 0 ? void 0 : _this$_params$world.pos;
			const rawRot = (_this$_params$world2 = this._params.world) === null || _this$_params$world2 === void 0 || (_this$_params$world2 = _this$_params$world2.playerSlotToTransform[this._playerSlot]) === null || _this$_params$world2 === void 0 ? void 0 : _this$_params$world2.rot;
			if (Array.isArray(rawPos)) {
				const [x, y, z] = rawPos;
				ui.position = new _tabletop_playground_api.Vector(x, y, z);
			} else if (rawPos) ui.position = rawPos;
			else ui.position = new _tabletop_playground_api.Vector(0, 0, _tabletop_playground_api.world.getTableHeight() + 3);
			if (Array.isArray(rawRot)) {
				const [pitch, yaw, roll] = rawRot;
				ui.rotation = new _tabletop_playground_api.Rotator(pitch, yaw, roll);
			} else if (rawRot) ui.rotation = rawRot;
			else ui.rotation = new _tabletop_playground_api.Rotator(0, 0, 0);
			ui.anchorX = ((_this$_params$world3 = this._params.world) === null || _this$_params$world3 === void 0 ? void 0 : _this$_params$world3.anchor.u) ?? .5;
			ui.anchorY = ((_this$_params$world4 = this._params.world) === null || _this$_params$world4 === void 0 ? void 0 : _this$_params$world4.anchor.v) ?? .5;
			ui.scale = 1 / PlayerWindow.WORLD_SCALE;
			ui.width = width;
			ui.height = height;
			ui.useWidgetSize = false;
			ui.players = new _tabletop_playground_api.PlayerPermission().setPlayerSlots([this._playerSlot]);
			ui.widget = this._createWidget();
			_tabletop_playground_api.world.addUI(ui);
		}
		return this;
	}
	detach() {
		if (this._screenUi) {
			_tabletop_playground_api.world.removeScreenUIElement(this._screenUi);
			this._screenUi = void 0;
		}
		if (this._worldUi) {
			_tabletop_playground_api.world.removeUIElement(this._worldUi);
			this._worldUi = void 0;
		}
		if (this._windowWidget) {
			this._windowWidget.destroy();
			this._windowWidget = void 0;
		}
		return this;
	}
	isAttached() {
		return this._screenUi !== void 0 || this._worldUi !== void 0;
	}
	toggle() {
		if (this.isAttached()) this.detach();
		else this.attach();
		return this;
	}
};
//#endregion
//#region src/lib/ui/window/window.ts
/**
* UI, normally presented in screen space with the option to warp to world
* (starts in world for VR players).  Optionally allow collapse, close.
*/
var Window = class {
	_getState() {
		const playerSlotToState = {};
		let hasState = false;
		for (const playerWindow of this._playerWindows) {
			const playerSlot = playerWindow.getPlayerSlot();
			const state = playerWindow._getState();
			if (state) {
				playerSlotToState[playerSlot] = state;
				hasState = true;
			}
		}
		return hasState ? JSON.stringify(playerSlotToState) : void 0;
	}
	_applyState(state) {
		if (state.length === 0) return;
		const playerSlotToState = JSON.parse(state);
		for (const playerWindow of this._playerWindows) {
			const playerState = playerSlotToState[playerWindow.getPlayerSlot()];
			if (playerState) playerWindow._applyState(playerState);
		}
	}
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
	constructor(params, playerSlots, persistenceKey) {
		this.onStateChanged = new TriggerableMulticastDelegate();
		this.onAllClosed = new TriggerableMulticastDelegate();
		this._customActionHandler = (clickingPlayer, identifier) => {
			if (identifier === this._customActionName) {
				for (const playerWindow of this._playerWindows) if (playerWindow.getPlayerSlot() === clickingPlayer.getSlot()) playerWindow.toggle();
			}
		};
		this._windowName = params.title;
		this._customActionName = params.addToggleMenuItem ? `*Toggle ${this._windowName}` : void 0;
		this._customActionTooltip = params.addToggleMenuTooltip;
		this._playerWindows = playerSlots.map((playerSlot) => new PlayerWindow(params, playerSlot));
		for (const playerWindow of this._playerWindows) playerWindow.onStateChanged.add(() => {
			this.onStateChanged.trigger();
		});
		if (persistenceKey) {
			this.onStateChanged.add(() => {
				const state = this._getState() ?? "";
				_tabletop_playground_api.world.setSavedData(state, persistenceKey);
			});
			const state = _tabletop_playground_api.world.getSavedData(persistenceKey);
			if (state && state.length > 0) this._applyState(state);
		}
		this.onStateChanged.add(() => {
			if ((this._getState() ?? "").length === 0) this.onAllClosed.trigger();
		});
		if (params.addToggleMenuItem) this.addGlobalContextMenuToggle();
	}
	attach() {
		for (const playerWindow of this._playerWindows) playerWindow.attach();
		this.onStateChanged.trigger();
		return this;
	}
	detach() {
		for (const playerWindow of this._playerWindows) playerWindow.detach();
		this.onStateChanged.trigger();
		return this;
	}
	destroy() {
		this.detach();
		if (this._customActionName) {
			_tabletop_playground_api.world.removeCustomAction(this._customActionName);
			_tabletop_playground_api.globalEvents.onCustomAction.remove(this._customActionHandler);
		}
	}
	isAttachedForPlayer(playerSlot) {
		for (const playerWindow of this._playerWindows) if (playerWindow.getPlayerSlot() === playerSlot) return playerWindow.isAttached();
		return false;
	}
	toggleForPlayer(playerSlot) {
		for (const playerWindow of this._playerWindows) if (playerWindow.getPlayerSlot() === playerSlot) playerWindow.toggle();
		return this;
	}
	addGlobalContextMenuToggle() {
		if (!this._windowName) throw new Error("must have a window name");
		const actionName = `*Toggle ${this._windowName}`;
		_tabletop_playground_api.world.addCustomAction(actionName, this._customActionTooltip ?? "show/hide the window");
		_tabletop_playground_api.globalEvents.onCustomAction.add(this._customActionHandler);
		return this;
	}
};
//#endregion
//#region src/lib/chess-clock/chess-clock-config-window.ts
var ChessClockConfigWindow = class {
	constructor(visibleToPlayerSlot, chessClockData, onOkClicked) {
		if (chessClockData.getPlayerOrder().length === 0) throw new Error("No players in chess clock data.");
		new Window({
			title: "Chess Clock Config",
			size: {
				width: 750,
				height: 400
			},
			screen: {
				anchor: {
					u: .5,
					v: .5
				},
				pos: {
					u: .5,
					v: .5
				}
			},
			windowWidgetGenerator: () => {
				return new ChessClockConfigWidget(chessClockData, onOkClicked);
			},
			disableWarpScreenWorld: true
		}, [visibleToPlayerSlot], void 0).attach();
	}
};
//#endregion
//#region src/lib/discord/discord-web-hook/discord-web-hook.ts
/**
* Create, read, and delete discord messages using a webhook.
* Only needs the "fetch" API, suitable for use in Tabletop Playground.
*/
var DiscordWebHook = class {
	constructor() {
		this.URL = "https://discord.com/api/webhooks";
		this._id = "";
		this._token = "";
	}
	setId(id) {
		this._id = id;
		return this;
	}
	setToken(token) {
		this._token = token;
		return this;
	}
	/**
	* Post a message to the webhook channel.
	*
	* @param message
	* @returns messsageId
	*/
	put(message) {
		return new Promise((resolve, reject) => {
			(0, _tabletop_playground_api.fetch)(`${this.URL}/${this._id}/${this._token}?wait=true`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: message })
			}).then((response) => {
				if (!response.ok) {
					reject(/* @__PURE__ */ new Error(`HTTP error: ${response.status}`));
					return;
				}
				const text = response.text();
				resolve(JSON.parse(text).id ?? "");
			}, reject);
		});
	}
	/**
	* Read the content of a webhook-posted message.
	*
	* @param messageId
	* @returns message content
	*/
	get(messageId) {
		return new Promise((resolve, reject) => {
			(0, _tabletop_playground_api.fetch)(`${this.URL}/${this._id}/${this._token}/messages/${messageId}`).then((response) => {
				if (!response.ok) {
					reject(`HTTP error: ${response.status}`);
					return;
				}
				const text = response.text();
				resolve(JSON.parse(text).content ?? "");
			}, reject);
		});
	}
	/**
	* Delete a message posted by the webhook.
	*
	* @param messageId
	* @returns void
	*/
	dele(messageId) {
		return new Promise((resolve, reject) => {
			(0, _tabletop_playground_api.fetch)(`${this.URL}/${this._id}/${this._token}/messages/${messageId}`, { method: "DELETE" }).then((response) => {
				if (!response.ok) {
					reject(/* @__PURE__ */ new Error(`HTTP error: ${response.status}`));
					return;
				}
				resolve();
			}, reject);
		});
	}
};
//#endregion
//#region src/lib/time-span/time-span.ts
var TimeSpanRecord = class TimeSpanRecord {
	constructor(start, end) {
		this.start = start;
		this.end = end;
	}
	/**
	* Create an identical copy with different start and end values.
	*
	* @param start
	* @param end
	* @returns
	*/
	clone(start, end) {
		return new TimeSpanRecord(start, end);
	}
	toString() {
		return `[${this.start}:${this.end}]`;
	}
};
/**
* Collect non-overlapping time spans.
* Split will break spans into two at the given time.
*/
var TimeSpans = class {
	constructor() {
		this._spans = [];
	}
	/**
	* Add a new record.
	*
	* @param timeSpanRecord
	* @returns
	*/
	add(timeSpanRecord) {
		this._spans.push(timeSpanRecord);
		return this;
	}
	getSpans() {
		return this._spans;
	}
	/**
	* Remove spans ending before the given time.
	*
	* @param time
	* @returns
	*/
	evictOld(time) {
		for (let index = 0; index < this._spans.length; index++) {
			const span = this._spans[index];
			if (span && span.end < time) this._spans.splice(index, 1);
		}
		return this;
	}
	/**
	* "Rewrite" the end time of the last span.
	* Used to mark the end of a time span that previously had no end.
	*
	* @param time
	* @returns
	*/
	clampLast(time) {
		const last = this._spans.pop();
		if (last !== void 0) {
			const clone = last.clone(last.start, time);
			this._spans.push(clone);
		}
		return this;
	}
	/**
	* Split any span that contains the given time into two at that time.
	*
	* @param time
	* @returns
	*/
	split(time) {
		for (let index = 0; index < this._spans.length; index++) {
			const span = this._spans[index];
			if (span && span.start < time && time < span.end) {
				const a = span.clone(span.start, time);
				const b = span.clone(time, span.end);
				this._spans.splice(index, 1, a, b);
			}
		}
		return this;
	}
	/**
	* Get all spans that fully overlap the given time span.
	*
	* @param start
	* @param end
	* @returns
	*/
	overlaps(start, end) {
		const result = [];
		for (const span of this._spans) if (span.start >= start && span.end <= end) result.push(span);
		return result;
	}
};
//#endregion
//#region src/lib/discord/discord-speaking-bot-client/speaking-assign.ts
var SpeakingAssignRecord = class SpeakingAssignRecord extends TimeSpanRecord {
	constructor(startSeconds, endSeconds, defaultUser) {
		super(startSeconds, endSeconds);
		this.speakers = [];
		this.defaultUser = defaultUser;
	}
	clone(start, end) {
		const clone = new SpeakingAssignRecord(start, end, this.defaultUser);
		clone.speakers.push(...this.speakers);
		return clone;
	}
	toString() {
		return `[${this.start}:${this.end}] ${this.defaultUser} {${this.speakers.join(",")}}`;
	}
};
/**
* Spans get assigned a default user (the current turn, may be undefined).
* Speaking events carve up and add speakers to spans.
*/
var SpeakingAssign = class {
	constructor() {
		this._spans = new TimeSpans();
		this._spans.add(new SpeakingAssignRecord(0, Infinity, void 0));
	}
	getSpans() {
		return this._spans.getSpans();
	}
	addChangeTurn(name, seconds) {
		this._spans.clampLast(seconds);
		this._spans.add(new SpeakingAssignRecord(seconds, Infinity, name));
		return this;
	}
	_addSpeaking(name, startSeconds, endSeconds) {
		const result = [];
		this._spans.split(startSeconds);
		this._spans.split(endSeconds);
		const overlaps = this._spans.overlaps(startSeconds, endSeconds);
		for (const overlap of overlaps) {
			if (overlap.defaultUser === name) continue;
			if (overlap.speakers.includes(name)) continue;
			overlap.speakers.push(name);
			result.push(overlap);
		}
		return result;
	}
	summarizeSpeakingOverlaps(name, startSeconds, endSeconds) {
		const summary = [];
		const deltas = /* @__PURE__ */ new Map();
		const seconds = endSeconds - startSeconds;
		summary.push(`${name} spoke ${seconds.toFixed(1)} seconds`);
		const records = this._addSpeaking(name, startSeconds, endSeconds);
		for (const record of records) {
			if (!record.defaultUser) continue;
			const offsetStart = record.start - startSeconds;
			const offsetEnd = record.end - startSeconds;
			const prefix = `[${offsetStart.toFixed(1)}:${offsetEnd.toFixed(1)}]`;
			const duration = record.end - record.start;
			const speakerCount = record.speakers.length;
			if (speakerCount === 1) {
				summary.push(`${prefix} during ${record.defaultUser}'s turn, reassigning time`);
				const src = record.defaultUser;
				const srcTime = deltas.get(src) ?? 0;
				const dst = name;
				const dstTime = deltas.get(dst) ?? 0;
				deltas.set(src, srcTime - duration);
				deltas.set(dst, dstTime + duration);
			}
			if (speakerCount > 1) {
				const others = record.speakers.filter((s) => s !== name).join(", ");
				summary.push(`${prefix} over ${others}; splitting cost with them`);
				const oldShare = duration / (speakerCount - 1);
				const newShare = duration / speakerCount;
				for (const speaker of record.speakers) {
					let delta = deltas.get(speaker) ?? 0;
					if (speaker !== name) delta -= oldShare;
					delta += newShare;
					deltas.set(speaker, delta);
				}
			}
		}
		return {
			summary,
			deltas
		};
	}
};
//#endregion
//#region src/lib/discord/discord-speaking-bot-client/speaking-parser.ts
var SpeakingParser = class {
	/**
	* Extract speaking records from summary.
	* Lines are "timestamp userId duration", userId does not have spaces.
	*
	* @param summary
	* @returns
	*/
	parse(summary) {
		const records = [];
		const lines = summary.split("\n");
		for (const line of lines) {
			const parts = line.split(" ");
			if (parts.length !== 3) continue;
			try {
				const endSeconds = parseFloat(parts[0] ?? "0");
				const userId = parts[1] ?? "";
				const startSeconds = endSeconds - parseFloat(parts[2] ?? "0");
				records.push({
					userId,
					startSeconds,
					endSeconds
				});
			} catch (_e) {}
		}
		return records;
	}
};
//#endregion
//#region src/lib/discord/discord-speaking-bot-client/speaker-to-player.ts
var SpeakerToPlayer = class {
	constructor() {
		this._speakers = /* @__PURE__ */ new Set();
		_tabletop_playground_api.globalEvents.onPlayerJoined.add(() => {
			this.invalidate();
		});
	}
	invalidate() {
		this._speakerToPlayer = void 0;
	}
	getPlayerName(speakerName) {
		if (!this._speakers.has(speakerName)) {
			this._speakers.add(speakerName);
			this.invalidate();
		}
		if (!this._speakerToPlayer) {
			this._speakerToPlayer = /* @__PURE__ */ new Map();
			const playerNames = _tabletop_playground_api.world.getAllPlayers().map((player) => player.getName());
			const speakerNames = Array.from(this._speakers);
			for (const speakerName2 of speakerNames) {
				const bestPlayer = (0, fastest_levenshtein.closest)(speakerName2, playerNames);
				if (!bestPlayer) continue;
				const bestSpeaker = (0, fastest_levenshtein.closest)(bestPlayer, speakerNames);
				if (!bestSpeaker) continue;
				if (speakerName2 === bestSpeaker) this._speakerToPlayer.set(speakerName2, bestPlayer);
			}
		}
		return this._speakerToPlayer.get(speakerName);
	}
};
//#endregion
//#region src/lib/discord/discord-speaking-bot-client/discord-speaking-bot-client.ts
var DiscordSpeakingBotClient = class DiscordSpeakingBotClient {
	static _parseBase64Data(base64data) {
		const json = js_base64.Base64.decode(base64data);
		const data = JSON.parse(json);
		const webhookId = data.i;
		const webhookToken = data.t;
		const messgeId = data.m;
		if (!webhookId || !webhookToken || !messgeId) throw new Error("Invalid base64 data");
		return {
			webhookId,
			webhookToken,
			messgeId
		};
	}
	constructor() {
		this.onSpeakingDeltas = new TriggerableMulticastDelegate();
		this.onSpeakingError = new TriggerableMulticastDelegate();
		this._speakingAssign = new SpeakingAssign();
		this._speakingParser = new SpeakingParser();
		this._speakerToPlayer = new SpeakerToPlayer();
		this._verbose = false;
		this._lastSeconds = 0;
		this._lastSpeaker = "";
		this._webHook = new DiscordWebHook();
	}
	setVerbose(verbose) {
		this._verbose = verbose;
		return this;
	}
	setCurrentTurn(playerName) {
		const seconds = Date.now() / 1e3;
		this._speakingAssign.addChangeTurn(playerName, seconds);
		return this;
	}
	connect(base64data) {
		if (this._verbose) console.log("DiscordSpeakingBotClient.connect");
		const { webhookId, webhookToken, messgeId } = DiscordSpeakingBotClient._parseBase64Data(base64data);
		this._webHook.setId(webhookId).setToken(webhookToken);
		this._messageId = messgeId;
		if (this._intervalHandle) {
			clearInterval(this._intervalHandle);
			this._intervalHandle = void 0;
		}
		this._intervalHandle = setInterval(() => {
			this._readAndProcessWebHook();
		}, 5e3);
		return this;
	}
	disconnect() {
		if (this._verbose) console.log("DiscordSpeakingBotClient.disconnect");
		if (this._intervalHandle) {
			clearInterval(this._intervalHandle);
			this._intervalHandle = void 0;
		}
		return this;
	}
	_readAndProcessWebHook() {
		if (this._verbose) console.log("DiscordSpeakingBotClient._readAndProcessWebHook");
		if (!this._messageId) {
			if (this._verbose) console.log("DiscordSpeakingBotClient._readAndProcessWebHook: no message id");
			return;
		}
		const reject = (reason) => {
			const msg = "DiscordSpeakingBotClient._readAndProcessWebHook: reject " + reason;
			console.log(msg);
			this.onSpeakingError.trigger(reason);
		};
		this._webHook.get(this._messageId).then((message) => {
			if (this._verbose) {
				console.log("DiscordSpeakingBotClient._readAndProcessWebHook: read message");
				console.log(`MESSAGE: """\n${message}\n"""`);
			}
			if (message.startsWith("Waiting for data")) return;
			const speakers = this._speakingParser.parse(message);
			for (const speaker of speakers) {
				if (speaker.endSeconds < this._lastSeconds) continue;
				if (speaker.endSeconds === this._lastSeconds && speaker.userId === this._lastSpeaker) continue;
				this._lastSeconds = speaker.endSeconds;
				this._lastSpeaker = speaker.userId;
				const playerName = this._speakerToPlayer.getPlayerName(speaker.userId) ?? speaker.userId;
				const data = this._speakingAssign.summarizeSpeakingOverlaps(playerName, speaker.startSeconds, speaker.endSeconds);
				if (data.deltas.size === 0) continue;
				if (this._verbose) console.log(`DiscordSpeakingBotClient: [\n${data.summary.join("\n")}\n]`);
				this.onSpeakingDeltas.trigger(data.deltas, data.summary);
			}
		}, reject);
	}
};
//#endregion
//#region src/lib/chess-clock/chess-clock-data.ts
var ChessClockData = class ChessClockData {
	static #_ = this.INTERVAL_SECONDS = 1;
	constructor(persistenceKey) {
		this._playerSlotToWidgetColor = /* @__PURE__ */ new Map();
		this._playerSlotToRemainingSeconds = /* @__PURE__ */ new Map();
		this._playerCount = -1;
		this._playerOrder = [];
		this._timeBudgetSeconds = 0;
		this._activePlayerSlot = -1;
		this._intervalHandle = void 0;
		this._discordToken = void 0;
		this._discordSpeaking = void 0;
		this._intervalAssignTimeToActivePlayer = () => {
			const activePlayerSlot = this._activePlayerSlot;
			if (activePlayerSlot === -1) return;
			const remainingTime = this._playerSlotToRemainingSeconds.get(activePlayerSlot) ?? this._timeBudgetSeconds;
			this._playerSlotToRemainingSeconds.set(activePlayerSlot, remainingTime - ChessClockData.INTERVAL_SECONDS);
		};
		this._onSpeakingDeltas = (deltas, summary) => {
			this.applyTimeDetlas(deltas, summary);
		};
		this._onSpeakingError = (reason) => {
			this.broadcast("onSpeakingError, disconnecting from Discord: " + reason);
			this.disconnectDiscordSpeaking();
		};
		this._persistentKey = persistenceKey;
		this._intervalHandle = setInterval(this._intervalAssignTimeToActivePlayer, ChessClockData.INTERVAL_SECONDS * 1e3);
		this._load();
		if (this._discordToken) this.connectDiscordSpeaking(this._discordToken);
	}
	_load() {
		if (!this._persistentKey) return;
		const json = _tabletop_playground_api.world.getSavedData(this._persistentKey);
		if (!json || json.length === 0) return;
		const data = JSON.parse(json);
		if (data.rs) for (const [playerSlot, remainingSeconds] of data.rs) this._playerSlotToRemainingSeconds.set(playerSlot, remainingSeconds);
		if (data.tb) this._timeBudgetSeconds = data.tb;
		if (data.ap !== void 0) this._activePlayerSlot = data.ap;
		if (data.dt && data.dt.length > 0) this._discordToken = data.dt;
	}
	_save() {
		if (!this._persistentKey) return;
		const data = {
			rs: Array.from(this._playerSlotToRemainingSeconds.entries()),
			tb: this._timeBudgetSeconds,
			ap: this._activePlayerSlot,
			dt: this._discordToken ?? ""
		};
		const json = JSON.stringify(data);
		_tabletop_playground_api.world.setSavedData(json, this._persistentKey);
	}
	destroy() {
		if (this._intervalHandle !== void 0) {
			clearInterval(this._intervalHandle);
			this._intervalHandle = void 0;
		}
		if (this._discordSpeaking) {
			this._discordSpeaking.disconnect();
			this._discordSpeaking = void 0;
		}
	}
	connectDiscordSpeaking(discordToken) {
		this.disconnectDiscordSpeaking();
		this._discordToken = discordToken;
		this._discordSpeaking = new DiscordSpeakingBotClient().setVerbose(true);
		this._discordSpeaking.onSpeakingDeltas.add(this._onSpeakingDeltas);
		this._discordSpeaking.onSpeakingError.add(this._onSpeakingError);
		this._discordSpeaking.connect(discordToken);
	}
	disconnectDiscordSpeaking() {
		if (!this._discordSpeaking) return;
		this._discordSpeaking.onSpeakingDeltas.remove(this._onSpeakingDeltas);
		this._discordSpeaking.onSpeakingError.remove(this._onSpeakingError);
		this._discordSpeaking.disconnect();
		this._discordSpeaking = void 0;
	}
	getActivePlayerSlot() {
		return this._activePlayerSlot;
	}
	/**
	* Override the current turn player.
	*
	* @param playerSlot
	* @returns
	*/
	overrideActivePlayerSlot(playerSlot) {
		this._activePlayerSlot = playerSlot;
		this._save();
		return this;
	}
	/**
	* Turn change, set current player and tell speaking
	* where to refund talk-over time.
	*
	* @param playerSlot
	* @returns
	*/
	setCurrentTurn(playerSlot) {
		this.overrideActivePlayerSlot(playerSlot);
		if (this._discordSpeaking) {
			var _world$getPlayerBySlo;
			const playerName = (_world$getPlayerBySlo = _tabletop_playground_api.world.getPlayerBySlot(playerSlot)) === null || _world$getPlayerBySlo === void 0 ? void 0 : _world$getPlayerBySlo.getName();
			this._discordSpeaking.setCurrentTurn(playerName);
		}
		return this;
	}
	getPlayerCount() {
		return this._playerCount;
	}
	setPlayerCount(playerCount) {
		this._playerCount = playerCount;
		this._save();
		return this;
	}
	getPlayerOrder() {
		return this._playerOrder;
	}
	setPlayerOrder(playerOrder) {
		if (playerOrder.length !== this._playerCount) throw new Error("player count mismatch");
		this._playerOrder = [...playerOrder];
		this._save();
		return this;
	}
	getWidgetColor(playerSlot) {
		return this._playerSlotToWidgetColor.get(playerSlot) ?? new _tabletop_playground_api.Color(1, 1, 1);
	}
	setWidgetColor(playerSlot, color) {
		this._playerSlotToWidgetColor.set(playerSlot, color);
		this._save();
		return this;
	}
	getTimeBudgetSeconds() {
		return this._timeBudgetSeconds;
	}
	setTimeBudgetSeconds(timeBudgetSeconds) {
		this._timeBudgetSeconds = timeBudgetSeconds;
		this._save();
		return this;
	}
	getTimeRemainingSeconds(playerSlot) {
		return this._playerSlotToRemainingSeconds.get(playerSlot) ?? this._timeBudgetSeconds;
	}
	setTimeRemainingSeconds(playerSlot, seconds) {
		this._playerSlotToRemainingSeconds.set(playerSlot, seconds);
		this._save();
		return this;
	}
	resetTimers() {
		for (const playerSlot of this._playerSlotToRemainingSeconds.keys()) this._playerSlotToRemainingSeconds.set(playerSlot, this._timeBudgetSeconds);
		return this;
	}
	applyTimeDetlas(deltas, summary) {
		const msg = "Chess clock: " + summary.join("\n");
		this.broadcast(msg);
		for (const [playerName, delta] of deltas.entries()) {
			const player = _tabletop_playground_api.world.getPlayerByName(playerName);
			if (!player) {
				console.log(`ChessClockData.applyTimeDetlas: player not found: ${playerName}`);
				continue;
			}
			const playerSlot = player.getSlot();
			const remainingTime = this._playerSlotToRemainingSeconds.get(playerSlot) ?? this._timeBudgetSeconds;
			console.log(`ChessClockData.applyTimeDetlas: ${playerName} ${delta} ${remainingTime}`);
			this._playerSlotToRemainingSeconds.set(playerSlot, remainingTime - delta);
		}
		this._save();
		return this;
	}
	broadcast(msg) {
		const msgColor = new _tabletop_playground_api.Color(1, .55, 0, 1);
		Broadcast.chatAll(msg, msgColor);
		return this;
	}
};
//#endregion
//#region src/lib/chess-clock/chess-clock-widget.ts
var ChessClockWidget = class {
	constructor(chessClockData) {
		this._buttonData = [];
		this._isEditing = false;
		this._intervalUpdateWidget = void 0;
		this._chessClockData = chessClockData;
		if (this._chessClockData.getPlayerCount() <= 0) throw new Error("invalid player count");
	}
	create(params) {
		this._intervalUpdateWidget = setInterval(() => {
			this.update();
		}, 1e3);
		const verticalBox = new _tabletop_playground_api.VerticalBox().setChildDistance(0);
		const playerCount = this._chessClockData.getPlayerCount();
		if (this._chessClockData.getPlayerOrder().length !== playerCount) throw new Error("player count mismatch");
		const h = (params.windowSize.height - 2) / (playerCount + .5);
		this._buttonData = [];
		for (let i = 0; i < playerCount; i++) {
			const buttonData = {
				bg: new _tabletop_playground_api.Border(),
				playerName: new _tabletop_playground_api.Text().setJustification(_tabletop_playground_api.TextJustification.Left).setFontSize(params.fontSize).setAutoWrap(false),
				time: new _tabletop_playground_api.Text().setJustification(_tabletop_playground_api.TextJustification.Right).setFontSize(params.fontSize).setAutoWrap(false),
				editTime: new _tabletop_playground_api.TextBox().setFontSize(params.fontSize).setText("00:00"),
				timeWidgetSwitcher: new _tabletop_playground_api.WidgetSwitcher()
			};
			buttonData.timeWidgetSwitcher.addChild(buttonData.time).addChild(buttonData.editTime);
			const horizontalBox = new _tabletop_playground_api.HorizontalBox().addChild(buttonData.playerName, .7).addChild(buttonData.timeWidgetSwitcher, .3);
			const p = params.spacing * 2;
			const layoutBox = new _tabletop_playground_api.LayoutBox().setHorizontalAlignment(_tabletop_playground_api.HorizontalAlignment.Fill).setVerticalAlignment(_tabletop_playground_api.VerticalAlignment.Center).setOverrideHeight(h).setOverrideWidth(params.windowSize.width).setPadding(p, p, 0, 0).setChild(horizontalBox);
			buttonData.bg.setChild(layoutBox);
			const button = new _tabletop_playground_api.ContentButton().setChild(buttonData.bg);
			button.onClicked.add((_button, clickingPlayer) => {
				if (!clickingPlayer) throw new Error("invalid player");
				const clickingPlayerName = clickingPlayer.getName();
				const targetPlayerSlot = this._chessClockData.getPlayerOrder()[i];
				if (targetPlayerSlot === void 0) throw new Error("invalid player slot");
				const targetPlayer = _tabletop_playground_api.world.getPlayerBySlot(targetPlayerSlot);
				const targetPlayerName = (targetPlayer === null || targetPlayer === void 0 ? void 0 : targetPlayer.getName()) ?? "<?>";
				if (this._chessClockData.getActivePlayerSlot() === targetPlayerSlot) {
					const msg = `${clickingPlayerName} stopped the clock`;
					this._chessClockData.broadcast(msg);
					this._chessClockData.overrideActivePlayerSlot(-1);
				} else {
					const msg = `${clickingPlayerName} set the clock to ${targetPlayerName}`;
					this._chessClockData.broadcast(msg);
					this._chessClockData.overrideActivePlayerSlot(targetPlayerSlot);
				}
				this.update();
			});
			this._buttonData.push(buttonData);
			const buttonBox = new _tabletop_playground_api.LayoutBox().setPadding(-4, -4, -4, -4).setOverrideHeight(h).setChild(button);
			verticalBox.addChild(buttonBox);
		}
		const editButton = new _tabletop_playground_api.Button().setFontSize(params.fontSize * .4).setText("EDIT");
		const editButtonBox = new _tabletop_playground_api.LayoutBox().setOverrideHeight(h / 2).setChild(editButton);
		verticalBox.addChild(editButtonBox);
		editButton.onClicked.add((_button, clickingPlayer) => {
			if (this._isEditing) {
				this.editEnd(clickingPlayer);
				editButton.setText("EDIT");
			} else {
				this.editStart(clickingPlayer);
				editButton.setText("SAVE");
			}
		});
		this.update();
		return verticalBox;
	}
	destroy() {
		if (this._intervalUpdateWidget !== void 0) {
			clearInterval(this._intervalUpdateWidget);
			this._intervalUpdateWidget = void 0;
		}
	}
	editStart(clickingPlayer) {
		if (!clickingPlayer) throw new Error("editStart: invalid player");
		this._isEditing = true;
		const msg = `${clickingPlayer.getName()} stopped the clock to edit remaining time(s)`;
		this._chessClockData.broadcast(msg);
		this._chessClockData.overrideActivePlayerSlot(-1);
		for (const buttonData of this._buttonData) {
			const value = buttonData.time.getText();
			buttonData.editTime.setText(value);
			buttonData.timeWidgetSwitcher.setActiveWidget(buttonData.editTime);
		}
		this.update();
	}
	editEnd(clickingPlayer) {
		if (!clickingPlayer) throw new Error("editEnd: invalid player");
		this._isEditing = false;
		const msg = `${clickingPlayer.getName()} finished editing remaining time(s), click a player to resume time allocation`;
		this._chessClockData.broadcast(msg);
		for (const buttonData of this._buttonData) buttonData.timeWidgetSwitcher.setActiveWidget(buttonData.time);
		const newTimes = [];
		for (const buttonData of this._buttonData) {
			const text = buttonData.editTime.getText();
			const m = text.match(/^(-?)(\d+):(\d+)$/);
			let sign = 1;
			let seconds = -1;
			let minutes = -1;
			if (m) {
				sign = m[1] === "-" ? -1 : 1;
				minutes = parseInt(m[2] ?? "-1");
				seconds = parseInt(m[3] ?? "-1");
			}
			if (seconds < 0 || seconds >= 60 || minutes < 0 || minutes > 120) {
				const msg2 = `Invalid time format "${text}", use MM:SS. Restoring old time values.`;
				this._chessClockData.broadcast(msg2);
				return;
			}
			const time = sign * (minutes * 60 + seconds);
			newTimes.push(time);
		}
		const playerSlots = this._chessClockData.getPlayerOrder();
		for (let i = 0; i < newTimes.length; i++) {
			const playerSlot = playerSlots[i];
			const newTime = newTimes[i];
			if (playerSlot === void 0 || newTime === void 0) throw new Error("invalid index");
			this._chessClockData.setTimeRemainingSeconds(playerSlot, newTime);
		}
		this.update();
	}
	update() {
		const playerOrder = this._chessClockData.getPlayerOrder();
		for (let i = 0; i < this._chessClockData.getPlayerCount(); i++) {
			const playerSlot = playerOrder[i];
			if (playerSlot === void 0) throw new Error("invalid player slot");
			const buttonData = this._buttonData[i];
			if (buttonData === void 0) throw new Error("invalid button data");
			const color = this._chessClockData.getWidgetColor(playerSlot);
			if (color === void 0) throw new Error("invalid color");
			let playerName = `<player ${i + 1}>`;
			const player = _tabletop_playground_api.world.getPlayerBySlot(playerSlot);
			if (player !== void 0) playerName = player.getName();
			const time = this._chessClockData.getTimeRemainingSeconds(playerSlot);
			const timeStr = `${time < 0 ? "-" : ""}${Math.floor(Math.abs(time) / 60).toString()}:${(Math.abs(time) % 60).toFixed(0).padStart(2, "0")}`;
			buttonData.playerName.setText(playerName);
			buttonData.time.setText(timeStr);
			const isActive = this._chessClockData.getActivePlayerSlot() === playerSlot;
			const fg = isActive ? new _tabletop_playground_api.Color(0, 0, 0) : color;
			const bg = isActive ? color : new _tabletop_playground_api.Color(0, 0, 0);
			buttonData.playerName.setTextColor(fg);
			buttonData.time.setTextColor(fg);
			buttonData.bg.setColor(bg);
		}
	}
};
//#endregion
//#region src/lib/chess-clock/chess-clock.ts
var ChessClock = class ChessClock {
	static #_ = this.KEY_CHESS_DATA = "@data/chess-clock";
	static #_2 = this.KEY_WINDOW = "@window/chess-clock";
	constructor(params) {
		var _params$windowAnchor, _params$windowAnchor2, _params$windowPositio, _params$windowPositio2;
		const playerCount = params.playerSlotOrder.length;
		if (playerCount === 0) throw new Error("No players in chess clock data.");
		this._chessClockData = new ChessClockData(ChessClock.KEY_CHESS_DATA).setPlayerCount(playerCount).setPlayerOrder(params.playerSlotOrder);
		const chessClockData = this._chessClockData;
		const windowParams = {
			title: "Chess Clock",
			size: {
				width: 400,
				height: playerCount * 60
			},
			screen: {
				anchor: {
					u: ((_params$windowAnchor = params.windowAnchor) === null || _params$windowAnchor === void 0 ? void 0 : _params$windowAnchor.u) ?? .5,
					v: ((_params$windowAnchor2 = params.windowAnchor) === null || _params$windowAnchor2 === void 0 ? void 0 : _params$windowAnchor2.v) ?? 0
				},
				pos: {
					u: ((_params$windowPositio = params.windowPosition) === null || _params$windowPositio === void 0 ? void 0 : _params$windowPositio.u) ?? .5,
					v: ((_params$windowPositio2 = params.windowPosition) === null || _params$windowPositio2 === void 0 ? void 0 : _params$windowPositio2.v) ?? .1
				}
			},
			windowWidgetGenerator: function() {
				return new ChessClockWidget(chessClockData);
			},
			disableWarpScreenWorld: true,
			addToggleMenuItem: true
		};
		const visibleTo = [...params.playerSlotOrder];
		for (const player of _tabletop_playground_api.world.getAllPlayers()) {
			const playerSlot = player.getSlot();
			if (!visibleTo.includes(playerSlot)) visibleTo.push(playerSlot);
		}
		this._chessClockWindow = new Window(windowParams, visibleTo, ChessClock.KEY_WINDOW);
		this._getCurrentPlayerSlot = params.getCurrentPlayerSlot;
	}
	getChessClockData() {
		return this._chessClockData;
	}
	openConfigWindow(clickingPlayer) {
		const visibleToPlayerSlot = clickingPlayer.getSlot();
		this._chessClockWindow.detach();
		const onOkClicked = () => {
			if (this._getCurrentPlayerSlot) {
				const playerSlot = this._getCurrentPlayerSlot();
				this._chessClockData.overrideActivePlayerSlot(playerSlot);
			}
			this._chessClockWindow.attach();
		};
		new ChessClockConfigWindow(visibleToPlayerSlot, this._chessClockData, onOkClicked);
	}
	destroy() {
		this._chessClockWindow.detach();
		this._chessClockData.destroy();
	}
};
//#endregion
//#region src/lib/color-lib/colors.data.ts
const COLORS = {
	green: [
		{
			target: "#00C60A",
			slot: "#00C702",
			slotRendered: "#01C609",
			plastic: "#06CC44",
			plasticRendered: "#00C50A",
			widget: "#02B615",
			widgetRendered: "#00C408"
		},
		{
			target: "#5DC262",
			slot: "#5DC362",
			slotRendered: "#5DC262",
			plastic: "#75CA72",
			plasticRendered: "#5DC162",
			widget: "#39B838",
			widgetRendered: "#5DC262"
		},
		{
			target: "#0C9113",
			slot: "#04920B",
			slotRendered: "#0C9113",
			plastic: "#3C9531",
			plasticRendered: "#0B9113",
			widget: "#115C0D",
			widgetRendered: "#0A8F12"
		},
		{
			target: "#82EB09",
			slot: "#83EC02",
			slotRendered: "#82EB09",
			plastic: "#9BFE54",
			plasticRendered: "#82E608",
			widget: "#61FE1E",
			widgetRendered: "#80DB08"
		},
		{
			target: "#09EB67",
			slot: "#02EC67",
			slotRendered: "#09EB67",
			plastic: "#5FFE7D",
			plasticRendered: "#08E666",
			widget: "#22FE40",
			widgetRendered: "#0ADB67"
		}
	],
	red: [
		{
			target: "#FF0505",
			slot: "#FE0101",
			slotRendered: "#FE0606",
			plastic: "#FE2221",
			plasticRendered: "#E80406",
			widget: "#FE0808",
			widgetRendered: "#D90305"
		},
		{
			target: "#AD5E5E",
			slot: "#AE5E5E",
			slotRendered: "#AD5E5E",
			plastic: "#B86868",
			plasticRendered: "#AD5E5E",
			widget: "#952D2E",
			widgetRendered: "#AD5F5E"
		},
		{
			target: "#C02516",
			slot: "#C1200E",
			slotRendered: "#C02516",
			plastic: "#CF3524",
			plasticRendered: "#C02616",
			widget: "#B60E09",
			widgetRendered: "#BC2415"
		},
		{
			target: "#CF213E",
			slot: "#D01B3C",
			slotRendered: "#CF213E",
			plastic: "#DF334B",
			plasticRendered: "#CF213E",
			widget: "#DE0E19",
			widgetRendered: "#CE223D"
		},
		{
			target: "#FF6969",
			slot: "#FE6969",
			slotRendered: "#FE6969",
			plastic: "#FE7273",
			plasticRendered: "#E76968",
			widget: "#FE3639",
			widgetRendered: "#DA6869"
		}
	],
	yellow: [
		{
			target: "#FFD900",
			slot: "#FEDA00",
			slotRendered: "#FED901",
			plastic: "#FEE62B",
			plasticRendered: "#E4D501",
			widget: "#FEF112",
			widgetRendered: "#D7D500"
		},
		{
			target: "#FCE979",
			slot: "#FCEA7A",
			slotRendered: "#FCE979",
			plastic: "#FEFE8E",
			plasticRendered: "#E0E27B",
			widget: "#FEFE52",
			widgetRendered: "#D5D779"
		},
		{
			target: "#A69317",
			slot: "#A79410",
			slotRendered: "#A69317",
			plastic: "#AC9A3D",
			plasticRendered: "#A69417",
			widget: "#7D5D11",
			widgetRendered: "#A58E16"
		},
		{
			target: "#D6BD4B",
			slot: "#D7BE4A",
			slotRendered: "#D6BD4B",
			plastic: "#E8C868",
			plasticRendered: "#D6BD4B",
			widget: "#FDB62F",
			widgetRendered: "#D7BE4B"
		},
		{
			target: "#F6FF00",
			slot: "#F6FE00",
			slotRendered: "#F6FE01",
			plastic: "#FEFE06",
			plasticRendered: "#E1E500",
			widget: "#FEFE02",
			widgetRendered: "#D6D900"
		}
	],
	pink: [
		{
			target: "#FF74D6",
			slot: "#FE75D7",
			slotRendered: "#FE74D6",
			plastic: "#FE79E7",
			plasticRendered: "#EE74D7",
			widget: "#FE3DF8",
			widgetRendered: "#E174D6"
		},
		{
			target: "#EDADD9",
			slot: "#EEAEDA",
			slotRendered: "#EDADD9",
			plastic: "#FEB1F2",
			plasticRendered: "#E5A9DB",
			widget: "#FE86FC",
			widgetRendered: "#D9A8D5"
		},
		{
			target: "#C21F90",
			slot: "#C31991",
			slotRendered: "#C21F90",
			plastic: "#C43992",
			plasticRendered: "#C11F90",
			widget: "#A9105C",
			widgetRendered: "#C21F90"
		},
		{
			target: "#BD2DB0",
			slot: "#BE29B1",
			slotRendered: "#BD2DB0",
			plastic: "#BD41B0",
			plasticRendered: "#BD2DAF",
			widget: "#9B148C",
			widgetRendered: "#BC2EB0"
		},
		{
			target: "#DE64B1",
			slot: "#DF64B2",
			slotRendered: "#DE64B1",
			plastic: "#E76FB4",
			plasticRendered: "#DE64B1",
			widget: "#F43390",
			widgetRendered: "#DE64B1"
		}
	],
	orange: [
		{
			target: "#FF8C00",
			slot: "#FE8D00",
			slotRendered: "#FE8C01",
			plastic: "#FE9406",
			plasticRendered: "#EA8C00",
			widget: "#FE5E00",
			widgetRendered: "#DE8C00"
		},
		{
			target: "#E09F5C",
			slot: "#E1A05C",
			slotRendered: "#E09F5C",
			plastic: "#F6A66E",
			plasticRendered: "#E19F5C",
			widget: "#FE7734",
			widgetRendered: "#DA9F5C"
		},
		{
			target: "#854300",
			slot: "#864100",
			slotRendered: "#854301",
			plastic: "#8E4E00",
			plasticRendered: "#854300",
			widget: "#561B00",
			widgetRendered: "#864300"
		},
		{
			target: "#FF6200",
			slot: "#FE6200",
			slotRendered: "#FE6201",
			plastic: "#FE6D00",
			plasticRendered: "#E96200",
			widget: "#FE3200",
			widgetRendered: "#DC6200"
		},
		{
			target: "#FFA600",
			slot: "#FEA700",
			slotRendered: "#FEA601",
			plastic: "#FEAF02",
			plasticRendered: "#E9A600",
			widget: "#FE8106",
			widgetRendered: "#DDA500"
		}
	],
	purple: [
		{
			target: "#B252FF",
			slot: "#B351FE",
			slotRendered: "#B252FE",
			plastic: "#B14DFD",
			plasticRendered: "#B252E3",
			widget: "#8A1EFE",
			widgetRendered: "#B251D9"
		},
		{
			target: "#AF76CF",
			slot: "#B077D0",
			slotRendered: "#AF76CF",
			plastic: "#B27BD9",
			plasticRendered: "#AF76CE",
			widget: "#8A3FE0",
			widgetRendered: "#AF76CF"
		},
		{
			target: "#681D91",
			slot: "#681792",
			slotRendered: "#681D91",
			plastic: "#6E2E90",
			plasticRendered: "#681D90",
			widget: "#330C5C",
			widgetRendered: "#691C91"
		},
		{
			target: "#945CED",
			slot: "#955CEE",
			slotRendered: "#945CED",
			plastic: "#9255FD",
			plasticRendered: "#945BE3",
			widget: "#5D25FE",
			widgetRendered: "#945CD8"
		},
		{
			target: "#A600FF",
			slot: "#A700FE",
			slotRendered: "#A601FE",
			plastic: "#A500F3",
			plasticRendered: "#A70ADF",
			widget: "#7400FE",
			widgetRendered: "#A600D9"
		}
	],
	blue: [
		{
			target: "#00CFFF",
			slot: "#00D0FE",
			slotRendered: "#01CFFE",
			plastic: "#01DBFC",
			plasticRendered: "#01CEE1",
			widget: "#00DEFE",
			widgetRendered: "#00CFD6"
		},
		{
			target: "#6FD9F2",
			slot: "#6FDAF2",
			slotRendered: "#6FD9F2",
			plastic: "#7CF6FD",
			plasticRendered: "#6FDBE0",
			widget: "#3EFEFE",
			widgetRendered: "#6FD5D5"
		},
		{
			target: "#0E96B5",
			slot: "#0697B6",
			slotRendered: "#0E96B5",
			plastic: "#3D99B9",
			plasticRendered: "#0E95B5",
			widget: "#126A98",
			widgetRendered: "#0D99B4"
		},
		{
			target: "#00FFEA",
			slot: "#00FEEB",
			slotRendered: "#01FEEA",
			plastic: "#08FEFC",
			plasticRendered: "#00E2E0",
			widget: "#00FEFE",
			widgetRendered: "#00D8D5"
		},
		{
			target: "#0091FF",
			slot: "#0092FE",
			slotRendered: "#0191FE",
			plastic: "#008EFC",
			plasticRendered: "#0192E2",
			widget: "#0A5AFE",
			widgetRendered: "#0092D8"
		}
	],
	white: [
		{
			target: "#F0F0F0",
			slot: "#F0F0F0",
			slotRendered: "#F0F0F0",
			plastic: "#FEFEFC",
			plasticRendered: "#DEDFDF",
			widget: "#FEFEFE",
			widgetRendered: "#D4D4D4"
		},
		{
			target: "#969696",
			slot: "#979797",
			slotRendered: "#969696",
			plastic: "#9D9D9A",
			plasticRendered: "#969696",
			widget: "#696968",
			widgetRendered: "#969695"
		},
		{
			target: "#4A4A4A",
			slot: "#484848",
			slotRendered: "#4A4A4A",
			plastic: "#535351",
			plasticRendered: "#4A4A4A",
			widget: "#1E1E1E",
			widgetRendered: "#494949"
		},
		{
			target: "#2C2C2E",
			slot: "#28282A",
			slotRendered: "#2C2C2E",
			plastic: "#313133",
			plasticRendered: "#2C2C2E",
			widget: "#0D0D0E",
			widgetRendered: "#2C2C2D"
		},
		{
			target: "#2E2626",
			slot: "#2A2121",
			slotRendered: "#2E2626",
			plastic: "#342A29",
			plasticRendered: "#2E2626",
			widget: "#0E0B0B",
			widgetRendered: "#2E2727"
		}
	]
};
//#endregion
//#region src/lib/color-lib/color-lib.ts
const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
var ColorLib = class {
	constructor() {
		this._hexColorRegex = new RegExp(HEX_COLOR_REGEX);
	}
	parseColor(hexColor) {
		const m = hexColor.match(this._hexColorRegex);
		const hexStr = (m === null || m === void 0 ? void 0 : m[1]) ?? "";
		if (!m) return;
		if (hexStr.length !== 3 && hexStr.length !== 6 && hexStr.length !== 8) return;
		let r = 0;
		let g = 0;
		let b = 0;
		let a = 1;
		if (hexStr.length === 3) {
			r = Number.parseInt(hexStr.substring(0, 1), 16) / 15;
			g = Number.parseInt(hexStr.substring(1, 2), 16) / 15;
			b = Number.parseInt(hexStr.substring(2, 3), 16) / 15;
		} else {
			r = Number.parseInt(hexStr.substring(0, 2), 16) / 255;
			g = Number.parseInt(hexStr.substring(2, 4), 16) / 255;
			b = Number.parseInt(hexStr.substring(4, 6), 16) / 255;
		}
		if (hexStr.length === 8) a = Number.parseInt(hexStr.substring(6, 8), 16) / 255;
		return new _tabletop_playground_api.Color(r, g, b, a);
	}
	parseColorOrThrow(hexColor) {
		const color = this.parseColor(hexColor);
		if (!color) throw new Error(`bad hexColor "${hexColor}"`);
		return color;
	}
	getColorsByName(colorName, index) {
		const colorsArray = COLORS[colorName];
		return colorsArray === null || colorsArray === void 0 ? void 0 : colorsArray[index];
	}
	getColorsByNameOrThrow(colorName, index) {
		const color = this.getColorsByName(colorName, index);
		if (color === void 0) throw new Error(`bad colorName "${colorName}" or index "${index}"`);
		return color;
	}
	getColorsByPlayerSlot(playerSlot) {
		const slotHex = "#" + _tabletop_playground_api.world.getSlotColor(playerSlot).toHex().substring(0, 6);
		return this.getColorsByTarget(slotHex);
	}
	getColorsByPlayerSlotOrThrow(playerSlot) {
		const color = this.getColorsByPlayerSlot(playerSlot);
		if (color === void 0) throw new Error(`bad playerSlot "${playerSlot}"`);
		return color;
	}
	getColorsByTarget(target) {
		const targetColor = this.parseColor(target);
		if (!targetColor) return;
		let best;
		let bestD = Number.MAX_SAFE_INTEGER;
		for (const colorsArray of Object.values(COLORS)) for (const colorsType of colorsArray) {
			const color = this.parseColor(colorsType.target);
			if (color) {
				const dr = targetColor.r - color.r;
				const dg = targetColor.g - color.g;
				const db = targetColor.b - color.b;
				const d = dr * dr + dg * dg + db * db;
				if (d < bestD) {
					best = colorsType;
					bestD = d;
				}
			}
		}
		return best;
	}
	getColorsByTargetOrThrow(target) {
		const color = this.getColorsByTarget(target);
		if (color === void 0) throw new Error(`bad target "${target}"`);
		return color;
	}
	getColorsLength(colorName) {
		const colorsArray = COLORS[colorName];
		return colorsArray === null || colorsArray === void 0 ? void 0 : colorsArray.length;
	}
	getColorsLengthOrThrow(colorName) {
		const length = this.getColorsLength(colorName);
		if (length === void 0) throw new Error(`bad colorName "${colorName}"`);
		return length;
	}
};
//#endregion
//#region src/lib/event/on-card-became-singleton-or-deck/on-card-became-singleton-or-deck.ts
/**
* Global events trigger when either:
*
* 1. A singleton card gets added to a deck/second card.
*
* 2. A singleton card gets removed from a deck.
*
* 3. A deck has its second-last card removed, making that deck a singleton.
*
* Scripts may wish to offer context menu items for singleton cards, but
* not when they become a deck (or vice versa).
*
* If one adds a listener during global init, it will be called next frame with
* with in-game singleton cards and decks.
*/
var OnCardBecameSingletonOrDeck = class OnCardBecameSingletonOrDeck {
	static #_ = this.onSingletonCardCreated = new TriggerableMulticastDelegate();
	static #_2 = this.onSingletonCardMadeDeck = new TriggerableMulticastDelegate();
	static #_3 = this._onInsertedHandler = (deck, _insertedCard, position, player) => {
		process.nextTick(() => {
			if (deck.isValid() && deck.getStackSize() > 1) {
				deck.onInserted.remove(OnCardBecameSingletonOrDeck._onInsertedHandler);
				deck.onRemoved.remove(OnCardBecameSingletonOrDeck._onRemovedHandler);
				deck.onRemoved.add(OnCardBecameSingletonOrDeck._onRemovedHandler);
				const nsids = NSID.getDeck(deck);
				const oldNsid = nsids[position === 1 ? 0 : nsids.length - 1];
				if (oldNsid !== void 0) OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.trigger(deck, oldNsid, player);
			}
		});
	};
	static #_4 = this._onRemovedHandler = (deck, _removedCard, _position, player) => {
		process.nextTick(() => {
			if (deck.getStackSize() === 1) {
				deck.onRemoved.remove(OnCardBecameSingletonOrDeck._onRemovedHandler);
				deck.onInserted.remove(OnCardBecameSingletonOrDeck._onInsertedHandler);
				deck.onInserted.add(OnCardBecameSingletonOrDeck._onInsertedHandler);
				OnCardBecameSingletonOrDeck.onSingletonCardCreated.trigger(deck, player);
			}
		});
	};
	static #_5 = this._onCreatedHandler = (obj) => {
		if (!(obj instanceof _tabletop_playground_api.Card)) return;
		process.nextTick(() => {
			if (!obj.isValid()) return;
			if (obj.getStackSize() > 1) {
				obj.onRemoved.remove(OnCardBecameSingletonOrDeck._onRemovedHandler);
				obj.onRemoved.add(OnCardBecameSingletonOrDeck._onRemovedHandler);
				const oldNsid = NSID.getDeck(obj)[0];
				if (oldNsid !== void 0) OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.trigger(obj, oldNsid);
			} else if (obj.getStackSize() === 1) {
				obj.onInserted.remove(OnCardBecameSingletonOrDeck._onInsertedHandler);
				obj.onInserted.add(OnCardBecameSingletonOrDeck._onInsertedHandler);
				OnCardBecameSingletonOrDeck.onSingletonCardCreated.trigger(obj);
			}
		});
	};
	/**
	* Remove and (re)install handlers.  Safe to call multiple times.
	*/
	init() {
		_tabletop_playground_api.globalEvents.onObjectCreated.add(OnCardBecameSingletonOrDeck._onCreatedHandler);
		for (const obj of _tabletop_playground_api.world.getAllObjects(false)) OnCardBecameSingletonOrDeck._onCreatedHandler(obj);
	}
	static _reset() {
		_tabletop_playground_api.globalEvents.onObjectCreated.remove(OnCardBecameSingletonOrDeck._onCreatedHandler);
		OnCardBecameSingletonOrDeck.onSingletonCardCreated.clear();
		OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.clear();
	}
};
if (_tabletop_playground_api.GameWorld.getExecutionReason() === "unittest") afterEach(() => OnCardBecameSingletonOrDeck._reset());
//#endregion
//#region src/lib/context-menu/abstract-right-click-card/abstract-right-click-card.ts
/**
* Add a context menu item ONLY when the singleton card exists.
* Remove it if the card becomes a deck.
*
* NOTE: the handler is a standard onCustomAction handler -- you need to verify
* the identifier before processing!  This is to match other onCustomAction
* handling rather than create a new signature.
*/
var AbstractRightClickCard = class {
	constructor(cardNsidPrefix, customActionName, customActionHandler) {
		this._customActionNames = [];
		this._tooltips = /* @__PURE__ */ new Map();
		this._cardNsidPrefix = cardNsidPrefix;
		this._customActionNames.push(customActionName);
		this._customActionHandler = customActionHandler;
	}
	/**
	* The first tooltip is
	*
	* @param tooltip
	*/
	setTooltip(actionName, tooltip) {
		this._tooltips.set(actionName, tooltip);
		return this;
	}
	addCustomActionName(customActionName) {
		this._customActionNames.push(customActionName);
		return this;
	}
	init() {
		OnCardBecameSingletonOrDeck.onSingletonCardCreated.add((card) => {
			if (NSID.get(card).startsWith(this._cardNsidPrefix)) {
				for (const customActionName of this._customActionNames) {
					const tooltip = this._tooltips.get(customActionName);
					card.removeCustomAction(customActionName);
					card.addCustomAction(customActionName, tooltip);
				}
				card.onCustomAction.remove(this._customActionHandler);
				card.onCustomAction.add(this._customActionHandler);
			}
		});
		OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add((card, oldNsid) => {
			if (oldNsid.startsWith(this._cardNsidPrefix)) {
				for (const customActionName of this._customActionNames) card.removeCustomAction(customActionName);
				card.onCustomAction.remove(this._customActionHandler);
			}
		});
	}
};
//#endregion
//#region src/lib/context-menu/abstract-right-click-deck/abstract-right-click-deck.ts
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
var AbstractRightClickDeck = class {
	constructor(deckNsidPrefix, customActionName, customActionHandler) {
		this._customActionNames = [];
		this._deckNsidPrefix = deckNsidPrefix;
		this._customActionNames.push(customActionName);
		this._customActionHandler = customActionHandler;
	}
	addCustomActionName(customActionName) {
		this._customActionNames.push(customActionName);
		return this;
	}
	init() {
		OnCardBecameSingletonOrDeck.onSingletonCardCreated.add((card) => {
			if (NSID.get(card).startsWith(this._deckNsidPrefix)) {
				for (const customActionName of this._customActionNames) card.removeCustomAction(customActionName);
				card.onCustomAction.remove(this._customActionHandler);
			}
		});
		OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add((card) => {
			const nsids = NSID.getDeck(card);
			for (const nsid of nsids) if (!nsid.startsWith(this._deckNsidPrefix)) return;
			for (const customActionName of this._customActionNames) {
				card.removeCustomAction(customActionName);
				card.addCustomAction(customActionName);
			}
			card.onCustomAction.remove(this._customActionHandler);
			card.onCustomAction.add(this._customActionHandler);
		});
	}
};
//#endregion
//#region src/lib/context-menu/leave-seat/leave-seat.ts
/**
* Global content menu item to leave seat.  Move to an unused slot, NOT the
* spectator slot (spectators cannot interact, preventing them from clicking
* any "take seat" buttons).
*/
var LeaveSeat = class LeaveSeat {
	static #_ = this.CUSTOM_ACTION_NAME = "*Leave Seat";
	static #_2 = this._customActionHandler = (player, identifier) => {
		if (identifier === LeaveSeat.CUSTOM_ACTION_NAME) LeaveSeat.leaveSeat(player);
	};
	init() {
		const tooltip = "Switch to non-seat player slot";
		_tabletop_playground_api.world.removeCustomAction(LeaveSeat.CUSTOM_ACTION_NAME);
		_tabletop_playground_api.world.addCustomAction(LeaveSeat.CUSTOM_ACTION_NAME, tooltip);
		_tabletop_playground_api.globalEvents.onCustomAction.remove(LeaveSeat._customActionHandler);
		_tabletop_playground_api.globalEvents.onCustomAction.add(LeaveSeat._customActionHandler);
	}
	/**
	* Move player to an "unused" slot, meaning no existing player NOR any
	* object's owning player slot.
	*
	* @param player
	*/
	static leaveSeat(player) {
		const busy = /* @__PURE__ */ new Set();
		for (const activePlayer of _tabletop_playground_api.world.getAllPlayers()) busy.add(activePlayer.getSlot());
		for (const obj of _tabletop_playground_api.world.getAllObjects(false)) busy.add(obj.getOwningPlayerSlot());
		for (let i = 0; i < 20; i++) if (!busy.has(i)) {
			console.log(`LeaveSeat: moving "${player.getName()}" to open slot ${i}`);
			player.switchSlot(i);
			return true;
		}
		console.log("LeaveSeat: no available player slot");
		return false;
	}
};
//#endregion
//#region src/lib/context-menu/report-remaining/report-remaining.ts
var ReportRemaining = class ReportRemaining {
	static #_ = this._actionName = "*Report Remaining";
	constructor(cardNsidPrefix) {
		this._customActionHandler = (obj, player, identifier) => {
			if (identifier !== ReportRemaining._actionName) return;
			if (obj instanceof _tabletop_playground_api.Card) {
				const names = obj.getAllCardDetails().map((cardDetails) => {
					return cardDetails.name;
				});
				const nameToCount = {};
				for (const name of names) nameToCount[name] = (nameToCount[name] ?? 0) + 1;
				const nameCountArray = Object.keys(nameToCount).sort().map((name) => {
					const count = nameToCount[name];
					if (count !== void 0 && count > 1) return `${name} (${count})`;
					return name;
				});
				Broadcast.chatOne(player, `remaining: ${nameCountArray.join(", ")}`);
			}
		};
		this._cardNsidPrefix = cardNsidPrefix;
	}
	_maybeAdd(obj) {
		if (obj instanceof _tabletop_playground_api.Card) {
			const firstNsid = NSID.getDeck(obj)[0];
			if (firstNsid && firstNsid.startsWith(this._cardNsidPrefix)) {
				obj.removeCustomAction(ReportRemaining._actionName);
				obj.addCustomAction(ReportRemaining._actionName);
				obj.onCustomAction.remove(this._customActionHandler);
				obj.onCustomAction.add(this._customActionHandler);
			}
		}
	}
	init() {
		_tabletop_playground_api.globalEvents.onObjectCreated.add((obj) => {
			this._maybeAdd(obj);
		});
		for (const obj of _tabletop_playground_api.world.getAllObjects(false)) this._maybeAdd(obj);
	}
};
//#endregion
//#region src/lib/data-store/data-store.ts
const BLOCK_SIZE = 512;
const BLOCKS_PER_OBJ = Math.floor(65516 / 544);
const KEY_FREELIST = "f";
const KEY_NEXT_OBJECT_ID = "o";
const KEY_NEXT_BLOCK_INDEX = "i";
const KEY_BLOCK_DATA = "d";
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
var DataStore = class {
	/**
	* constructor
	*
	* @param dataStoreId - each store MUST have a different id
	*/
	constructor(dataStoreId) {
		let rootObj;
		const globalKey = `__DataStore:${dataStoreId}__`;
		const rootObjId = _tabletop_playground_api.world.getSavedData(globalKey);
		if (rootObjId && rootObjId.length > 0) rootObj = _tabletop_playground_api.world.getObjectById(rootObjId);
		if (!rootObj) {
			rootObj = _tabletop_playground_api.world.createObjectFromTemplate("A44BAA604E0ED034CD67FA9502214AA7", [
				0,
				0,
				-10
			]);
			if (rootObj) {
				rootObj.setObjectType(_tabletop_playground_api.ObjectType.NonInteractive);
				rootObj.setSavedData("[]", KEY_FREELIST);
				_tabletop_playground_api.world.setSavedData(rootObj.getId(), globalKey);
			}
		}
		if (!rootObj || !(rootObj instanceof _tabletop_playground_api.Container)) throw new Error("DataStore unable to find or create root container");
		this._root = rootObj;
	}
	/**
	* Remove data.
	*
	* @param dataId
	* @returns
	*/
	delete(dataId) {
		const firstBlockLocation = this._getRootEntry(dataId);
		if (!firstBlockLocation) return;
		const blocks = this._getChain(firstBlockLocation);
		this._releaseBlock(firstBlockLocation);
		for (const block of blocks) if (block.next) this._releaseBlock(block.next);
		this._root.setSavedData("", dataId);
	}
	/**
	* Add or replace data.
	*
	* @param dataId
	* @param data
	* @returns
	*/
	set(dataId, data) {
		var _blockLocations$, _blockLocations$2;
		this.delete(dataId);
		if (data.length === 0) return;
		const n = Math.ceil(data.length / BLOCK_SIZE);
		const dataChunks = [];
		for (let i = 0; i < data.length; i += BLOCK_SIZE) {
			const end = Math.min(i + BLOCK_SIZE, data.length);
			dataChunks.push(data.substring(i, end));
		}
		const blockLocations = [];
		for (let i = 0; i < dataChunks.length; i++) blockLocations.push(this._allocBlock());
		const blocks = [];
		for (let i = 0; i < n; i++) {
			const data2 = dataChunks[i];
			if (data2) {
				const block = { data: data2 };
				if (i < dataChunks.length - 1) block.next = blockLocations[i + 1];
				blocks.push(block);
			}
		}
		for (let i = 0; i < n; i++) {
			const blockLocation = blockLocations[i];
			if (!blockLocation) throw new Error("missing block location");
			const block = blocks[i];
			if (!block) throw new Error("missing block");
			const blockEnc = { [KEY_BLOCK_DATA]: block.data };
			if (i < dataChunks.length - 1) {
				const nextLocation = blockLocations[i + 1];
				if (!nextLocation) throw new Error("missing next");
				blockEnc[KEY_NEXT_BLOCK_INDEX] = nextLocation.index;
				if (blockLocation.obj !== nextLocation.obj) blockEnc[KEY_NEXT_OBJECT_ID] = nextLocation.obj.getId();
			}
			blockLocation.obj.setSavedData(JSON.stringify(blockEnc), blockLocation.index.toString());
		}
		const id = (_blockLocations$ = blockLocations[0]) === null || _blockLocations$ === void 0 ? void 0 : _blockLocations$.obj.getId();
		const index = (_blockLocations$2 = blockLocations[0]) === null || _blockLocations$2 === void 0 ? void 0 : _blockLocations$2.index;
		if (id === void 0 || index === void 0) throw new Error("missing root");
		const rootEnc = {
			[KEY_NEXT_OBJECT_ID]: id,
			[KEY_NEXT_BLOCK_INDEX]: index
		};
		this._root.setSavedData(JSON.stringify(rootEnc), dataId);
	}
	/**
	* Get data.
	*
	* @param dataId
	* @returns
	*/
	get(dataId) {
		const firstBlockLocation = this._getRootEntry(dataId);
		if (!firstBlockLocation) return;
		return this._getChain(firstBlockLocation).map((block) => block.data).join("");
	}
	/**
	* Get the first data block location for the data entry.
	*
	* @param dataId
	* @returns
	*/
	_getRootEntry(dataId) {
		const blockLocationEncData = this._root.getSavedData(dataId);
		if (!blockLocationEncData || blockLocationEncData.length === 0) return;
		const blockLocationEnc = JSON.parse(blockLocationEncData);
		if (blockLocationEnc[KEY_NEXT_OBJECT_ID] === void 0 || blockLocationEnc[KEY_NEXT_BLOCK_INDEX] === void 0) throw new Error("bad objId or block index");
		const obj = _tabletop_playground_api.world.getObjectById(blockLocationEnc[KEY_NEXT_OBJECT_ID]);
		if (!obj) throw new Error("bad obj");
		return {
			obj,
			index: blockLocationEnc[KEY_NEXT_BLOCK_INDEX]
		};
	}
	/**
	* Read all blocks starting with the given location.
	*
	* @param blockLocation
	* @param processor
	*/
	_getChain(blockLocation) {
		var _blocks;
		const blocks = [];
		do {
			const blockEncData = blockLocation.obj.getSavedData(blockLocation.index.toString());
			if (!blockEncData || blockEncData.length === 0) throw new Error("bad blockEncData");
			const blockEnc = JSON.parse(blockEncData);
			if (blockEnc[KEY_BLOCK_DATA] === void 0) throw new Error("missing block data");
			const block = { data: blockEnc[KEY_BLOCK_DATA] };
			if (blockEnc[KEY_NEXT_BLOCK_INDEX]) {
				let obj;
				if (blockEnc[KEY_NEXT_OBJECT_ID]) {
					obj = _tabletop_playground_api.world.getObjectById(blockEnc[KEY_NEXT_OBJECT_ID]);
					if (!obj) throw new Error("bad objId");
				} else obj = blockLocation.obj;
				block.next = {
					obj,
					index: blockEnc[KEY_NEXT_BLOCK_INDEX]
				};
				blockLocation = block.next;
			}
			blocks.push(block);
		} while ((_blocks = blocks[blocks.length - 1]) === null || _blocks === void 0 ? void 0 : _blocks.next);
		return blocks;
	}
	/**
	* Reserve a block (index within a store file).
	* If store has no more free slots remove it from root available list.
	*
	* @returns
	*/
	_allocBlock() {
		let store = this._getStore();
		if (!store) store = this._allocStore();
		const freelistData = store.getSavedData(KEY_FREELIST);
		if (!freelistData || freelistData.length === 0) throw new Error("bad freelistData");
		const freelist = JSON.parse(freelistData);
		if (!Array.isArray(freelist)) throw new Error("freelist is not an array");
		if (freelist.length === 0) throw new Error("freelist empty");
		const blockIndex = freelist.shift() ?? -1;
		store.setSavedData(JSON.stringify(freelist), KEY_FREELIST);
		if (freelist.length === 0) this._removeStoreFromAvailable(store);
		return {
			obj: store,
			index: blockIndex
		};
	}
	/**
	* Release a block (index within a store file).
	* If the store is no longer in use delete it.
	*
	* @param blockLocation
	*/
	_releaseBlock(blockLocation) {
		const store = blockLocation.obj;
		const freelistData = store.getSavedData(KEY_FREELIST);
		if (!freelistData || freelistData.length === 0) throw new Error("bad freelistData");
		const freelist = JSON.parse(freelistData);
		if (!Array.isArray(freelist)) throw new Error("freelist is not an array");
		freelist.push(blockLocation.index);
		store.setSavedData(JSON.stringify(freelist), KEY_FREELIST);
		if (freelist.length === 1) this._addStoreToAvailable(store);
		if (freelist.length === BLOCKS_PER_OBJ) this._releaseStore(store);
	}
	/**
	* Add store to available with-capacity list (store has more room).
	*
	* @param obj
	*/
	_addStoreToAvailable(obj) {
		const rootStoreIdsData = this._root.getSavedData(KEY_FREELIST);
		if (!rootStoreIdsData || rootStoreIdsData.length === 0) throw new Error("bad rootStoreData");
		const rootStoreIds = JSON.parse(rootStoreIdsData);
		if (!Array.isArray(rootStoreIds)) throw new Error("rootStoreData not array");
		rootStoreIds.push(obj.getId());
		this._root.setSavedData(JSON.stringify(rootStoreIds), KEY_FREELIST);
	}
	/**
	* Remove store from available with-capcity list (store is full).
	*
	* @param obj
	*/
	_removeStoreFromAvailable(obj) {
		const rootStoreIdsData = this._root.getSavedData(KEY_FREELIST);
		if (!rootStoreIdsData || rootStoreIdsData.length === 0) throw new Error("bad rootStoreData");
		const rootStoreIds = JSON.parse(rootStoreIdsData);
		if (!Array.isArray(rootStoreIds)) throw new Error("rootStoreData not array");
		const idx = rootStoreIds.indexOf(obj.getId());
		if (idx < 0) throw new Error("file not in root freelist");
		rootStoreIds.splice(idx, 1);
		this._root.setSavedData(JSON.stringify(rootStoreIds), KEY_FREELIST);
	}
	/**
	* Get a store from the list of stores with free slots.
	*
	* @returns
	*/
	_getStore() {
		const rootStoreIdsData = this._root.getSavedData(KEY_FREELIST);
		if (!rootStoreIdsData || rootStoreIdsData.length === 0) throw new Error("bad rootStoreData");
		const rootStoreIds = JSON.parse(rootStoreIdsData);
		if (!Array.isArray(rootStoreIds)) throw new Error("rootStoreData not array");
		if (rootStoreIds.length > 0) {
			const objId = rootStoreIds[0];
			if (objId) {
				const obj = _tabletop_playground_api.world.getObjectById(objId);
				if (!obj) throw new Error("bad obj");
				return obj;
			}
		}
	}
	/**
	* Create a new store, add to the list of stores with free slots.
	*
	* @returns
	*/
	_allocStore() {
		const obj = _tabletop_playground_api.world.createObjectFromTemplate("83FDE12C4E6D912B16B85E9A00422F43", [
			0,
			0,
			0
		]);
		if (!obj) throw new Error("unable to create store");
		this._root.addObjects([obj]);
		const freelist = [];
		for (let i = 0; i < BLOCKS_PER_OBJ; i++) freelist.push(i);
		obj.setSavedData(JSON.stringify(freelist), KEY_FREELIST);
		this._addStoreToAvailable(obj);
		return obj;
	}
	/**
	* Remove a store from the list of stores with free slots, then
	* delete the store object.
	*
	* @param obj
	*/
	_releaseStore(obj) {
		this._removeStoreFromAvailable(obj);
		obj.destroy();
	}
};
//#endregion
//#region src/lib/dice-group/dice-group.ts
const DICE_GROUP_SAVED_DATA_KEY = "__DiceGroup_DiceId__";
/**
* Remove any lingering DiceGroup dice.
*/
var DiceGroupCleanup = class {
	init() {
		for (const obj of _tabletop_playground_api.world.getAllObjects(true)) {
			if (!(obj instanceof _tabletop_playground_api.Dice)) continue;
			const value = obj.getSavedData(DICE_GROUP_SAVED_DATA_KEY);
			if (value && value.length > 0) obj.destroy();
		}
	}
};
/**
* Roll a collection of dice, listen to onRolled for overall result.
* Can only be used once, create a new one for new rolls.
*
* Intended use: roll + format
*/
var DiceGroup = class DiceGroup {
	static #_ = this.DEFAULT_TIMEOUT_SECONDS = 3;
	static #_2 = this.DEFAULT_DELETE_AFTER_SECONDS = 5;
	/**
	* Create and roll dice group.
	* Do via static to prevent attempting to reuse the single-use instance.
	*
	* @param params
	*/
	static roll(params) {
		const diceGroup = new DiceGroup(params);
		if (params.doFakeRoll) diceGroup.fakeRoll();
		else diceGroup.roll();
	}
	/**
	* Format a dice result for display.
	*
	* @param diceResult
	* @returns
	*/
	static format(diceResult) {
		const parts = [];
		if (diceResult.rerolledValue) parts.push(`${diceResult.rerolledValue}->`);
		parts.push(diceResult.value.toString());
		if (diceResult.hit) parts.push("#");
		if (diceResult.crit) for (let i = 0; i < (diceResult.diceParams.critCount ?? 1); i++) parts.push("#");
		return parts.join("");
	}
	_applyExtraRerolls() {
		console.log("Applying extra rerolls");
		if (this._extraRerolls <= 0) return;
		const diceResults = Object.values(this._diceObjIdToDiceResult).filter((diceResult) => !diceResult.hit).sort((a, b) => {
			return (a.diceParams.hit ?? Number.MAX_SAFE_INTEGER) - (b.diceParams.hit ?? Number.MAX_SAFE_INTEGER);
		});
		diceResults.splice(Math.min(this._extraRerolls, diceResults.length));
		for (const diceResult of diceResults) {
			const diceParams = diceResult.diceParams;
			const faceIndex = Math.floor(Math.random() * diceParams.sides);
			diceResult.rerolledValue = diceResult.value;
			diceResult.value = faceIndex + 1;
			diceResult.hit = diceResult.value >= (diceParams.hit ?? Number.MAX_SAFE_INTEGER);
			diceResult.crit = diceResult.value >= (diceParams.crit ?? Number.MAX_SAFE_INTEGER);
		}
	}
	constructor(params) {
		this._diceObjIdToDiceResult = {};
		this._activeDice = /* @__PURE__ */ new Set();
		this._onDiceRolledHandler = (player, diceArray) => {
			for (const dice of diceArray) {
				const diceResult = this._diceObjIdToDiceResult[dice.getId()];
				if (!diceResult) return;
				const diceParams = diceResult.diceParams;
				const value = dice.getCurrentFaceIndex() + 1;
				diceResult.value = value;
				diceResult.hit = value >= (diceParams.hit ?? Number.MAX_SAFE_INTEGER);
				diceResult.crit = value >= (diceParams.crit ?? Number.MAX_SAFE_INTEGER);
				if (diceParams.reroll && !diceResult.hit && !diceResult.rerolledValue) {
					diceResult.rerolledValue = value;
					dice.roll(player);
				} else {
					this._activeDice.delete(dice);
					if (this._activeDice.size === 0) {
						this._applyExtraRerolls();
						this._sendResult();
					}
				}
			}
		};
		this._onTimeoutHandler = () => {
			this._sendResult();
		};
		this._onDeleteDiceHandler = () => {
			for (const diceResult of Object.values(this._diceObjIdToDiceResult)) if (diceResult.dice && diceResult.dice.isValid()) diceResult.dice.destroy();
		};
		this._diceParamsArray = params.diceParams;
		this._player = params.player;
		this._callback = params.callback;
		this._deleteAfterSeconds = params.deleteAfterSeconds ?? DiceGroup.DEFAULT_DELETE_AFTER_SECONDS;
		this._timeoutSeconds = params.timeoutSeconds ?? DiceGroup.DEFAULT_TIMEOUT_SECONDS;
		this._position = params.position ?? [
			0,
			0,
			0
		];
		this._extraRerolls = params.extraRerolls ?? 0;
	}
	fakeRoll() {
		let index = 0;
		for (const diceParams of this._diceParamsArray) {
			const diceResult = {
				diceParams,
				value: -1
			};
			DiceGroup._setFakeValue(diceResult);
			const id = "dice" + index++;
			this._diceObjIdToDiceResult[id] = diceResult;
		}
		this._applyExtraRerolls();
		this._sendResult();
	}
	roll() {
		if (this._timeoutSeconds > 0) this._timeoutHandle = setTimeout(this._onTimeoutHandler, this._timeoutSeconds * 1e3);
		if (this._deleteAfterSeconds > 0) setTimeout(this._onDeleteDiceHandler, this._deleteAfterSeconds * 1e3);
		_tabletop_playground_api.globalEvents.onDiceRolled.add(this._onDiceRolledHandler);
		const z = _tabletop_playground_api.world.getTableHeight() + 2;
		for (let i = 0; i < this._diceParamsArray.length; i++) {
			const diceParams = this._diceParamsArray[i];
			if (diceParams) {
				const phi = i / this._diceParamsArray.length * Math.PI * 2;
				const r = this._diceParamsArray.length * .3;
				const pos = new _tabletop_playground_api.Vector(Math.cos(phi) * r, Math.sin(phi) * r, z).add(this._position);
				const dice = DiceGroup._createDice(diceParams, pos);
				this._diceObjIdToDiceResult[dice.getId()] = {
					diceParams,
					dice,
					value: -1
				};
				this._activeDice.add(dice);
			}
		}
		for (const dice of this._activeDice) dice.roll(this._player);
	}
	_sendResult() {
		if (this._timeoutHandle) {
			clearTimeout(this._timeoutHandle);
			this._timeoutHandle = void 0;
		}
		_tabletop_playground_api.globalEvents.onDiceRolled.remove(this._onDiceRolledHandler);
		const diceResults = Object.values(this._diceObjIdToDiceResult);
		for (const diceResult of diceResults) if (diceResult.dice && this._activeDice.has(diceResult.dice)) DiceGroup._setFakeValue(diceResult);
		if (this._callback) this._callback(diceResults, this._player);
	}
	static _setFakeValue(diceResult) {
		const diceParams = diceResult.diceParams;
		let faceIndex = Math.floor(Math.random() * diceParams.sides);
		diceResult.value = faceIndex + 1;
		if (diceParams.reroll && diceParams.hit !== void 0 && diceResult.value < diceParams.hit) {
			diceResult.rerolledValue = diceResult.value;
			faceIndex = Math.floor(Math.random() * diceParams.sides);
			diceResult.value = faceIndex + 1;
		}
		diceResult.hit = diceResult.value >= (diceParams.hit ?? Number.MAX_SAFE_INTEGER);
		diceResult.crit = diceResult.value >= (diceParams.crit ?? Number.MAX_SAFE_INTEGER);
	}
	static _createDice(diceParams, position) {
		let templateId;
		switch (diceParams.sides) {
			case 4:
				templateId = "1885447D4CF808B36797CFB1DD679BAC";
				break;
			case 6:
				templateId = "A897158B490E36F0911B03B3BE9BA52A";
				break;
			case 8:
				templateId = "10614E404E82F969E6CFD48CAC80F363";
				break;
			case 10:
				templateId = "9065AC5141F87F8ADE1F5AB6390BBEE4";
				break;
			case 12:
				templateId = "9FD625E14B5EEEA9C6C998B2DB3E9085";
				break;
			case 20:
				templateId = "0A2C628E4A706A123AA3CF9C34CAB9A1";
				break;
			default: throw new Error(`invalid sides: "${diceParams.sides}"`);
		}
		const dice = _tabletop_playground_api.world.createObjectFromTemplate(templateId, position);
		if (!dice) throw new Error(`created failed for d${diceParams.sides} (${templateId})`);
		if (!(dice instanceof _tabletop_playground_api.Dice)) throw new Error(`not Dice for d${diceParams.sides} (${templateId})`);
		dice.setObjectType(_tabletop_playground_api.ObjectType.Penetrable);
		const id = diceParams.id && diceParams.id.length > 0 ? diceParams.id : "dice-group-die";
		dice.setSavedData(id, DICE_GROUP_SAVED_DATA_KEY);
		if (diceParams.primaryColor) dice.setPrimaryColor(diceParams.primaryColor);
		if (diceParams.secondaryColor) dice.setSecondaryColor(diceParams.secondaryColor);
		if (diceParams.name) dice.setName(diceParams.name);
		return dice;
	}
};
//#endregion
//#region src/lib/error-handler/bugsplat-remote-reporter.ts
/**
* Report errors or other messages to a remote service.
*/
var BugSplatRemoteReporter = class BugSplatRemoteReporter {
	static #_ = this.__isEnabled = true;
	static setEnabled(isEnabled) {
		BugSplatRemoteReporter.__isEnabled = isEnabled;
	}
	constructor(params) {
		this._seen = /* @__PURE__ */ new Set();
		this._database = params.database;
		this._appName = params.appName;
		this._appVersion = params.appVersion;
	}
	init() {
		ErrorHandler.onError.add((error, rawError) => {
			if (BugSplatRemoteReporter.__isEnabled) this.onError(rawError ?? error);
		});
	}
	onError(error) {
		if (this._seen.has(error)) return;
		this._seen.add(error);
		const onSuccess = () => {};
		const onError = () => {};
		this.sendError(error).then(onSuccess, onError);
	}
	createURL() {
		return "https://" + this._database + ".bugsplat.com/post/js/";
	}
	createFetchOptions(error) {
		if (!error.startsWith("Error: ")) error = "Error: " + error;
		const form = {
			database: this._database,
			appName: this._appName,
			appVersion: this._appVersion,
			callstack: error
		};
		const players = _tabletop_playground_api.world.getAllPlayers();
		let hostName = void 0;
		players.forEach((player) => {
			if (player.isHost()) hostName = player.getName() + ` (#${players.length})`;
		});
		if (hostName) form.user = hostName;
		const boundary = "~~boundary~~";
		const headers = { "Content-Type": `multipart/form-data;boundary="${boundary}"` };
		const bodyLines = [""];
		Object.entries(form).map(([k, v]) => {
			bodyLines.push(`--${boundary}`);
			bodyLines.push(`Content-Disposition: form-data; name="${k}"`);
			bodyLines.push("");
			bodyLines.push(v);
		});
		bodyLines.push(`--${boundary}--`);
		return {
			body: bodyLines.join("\r\n"),
			headers,
			method: "POST"
		};
	}
	sendError(error) {
		const url = this.createURL();
		const options = this.createFetchOptions(error);
		return (0, _tabletop_playground_api.fetch)(url, options);
	}
};
//#endregion
//#region src/lib/facing/facing.ts
var Facing = class {
	static isFaceUp(obj) {
		if (obj instanceof _tabletop_playground_api.Card) return obj.isFaceUp();
		return obj.getRotation().getUpVector().clampVectorMagnitude(1, 1).dot([
			0,
			0,
			1
		]) > .8;
	}
};
//#endregion
//#region src/lib/find/find-tracking.ts
/**
* Find, but only for pre-tracked nsids.
*
* Monitors object (and card singleton) creation and destruction to keep an
* up-to-date set.
*
* Unlike find this can track multiple objects with the same nsid.
*/
var FindTracking = class {
	/**
	* Rebuild the entire tracking map from scratch.
	* Similar cost to reseeding a single nsid (full scan anyhow).
	*/
	_seedNsidToObjIds() {
		this._nsidToObjIds.clear();
		for (const obj of _tabletop_playground_api.world.getAllObjects(false)) {
			const nsid = NSID.get(obj);
			if (this._trackNsids.has(nsid)) {
				let objIds = this._nsidToObjIds.get(nsid);
				if (!objIds) {
					objIds = /* @__PURE__ */ new Set();
					this._nsidToObjIds.set(nsid, objIds);
				}
				objIds.add(obj.getId());
			}
		}
	}
	constructor() {
		this._trackNsids = /* @__PURE__ */ new Set();
		this._nsidToObjIds = /* @__PURE__ */ new Map();
		this._onObjectCreated = (obj) => {
			const nsid = NSID.get(obj);
			const objId = obj.getId();
			const objIds = this._nsidToObjIds.get(nsid);
			if (objIds) objIds.add(objId);
		};
		this._onObjectDestroyed = (obj) => {
			const nsid = NSID.get(obj);
			const objId = obj.getId();
			const objIds = this._nsidToObjIds.get(nsid);
			if (objIds) objIds.delete(objId);
		};
		this._onSingletonCardCreated = (card) => {
			const nsid = NSID.get(card);
			const objId = card.getId();
			const objIds = this._nsidToObjIds.get(nsid);
			if (objIds) objIds.add(objId);
		};
		this._onSingletonCardMadeDeck = (card, oldNsid) => {
			const objId = card.getId();
			const objIds = this._nsidToObjIds.get(oldNsid);
			if (objIds) objIds.delete(objId);
		};
		_tabletop_playground_api.globalEvents.onObjectCreated.add(this._onObjectCreated);
		_tabletop_playground_api.globalEvents.onObjectDestroyed.add(this._onObjectDestroyed);
		OnCardBecameSingletonOrDeck.onSingletonCardCreated.add(this._onSingletonCardCreated);
		OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.add(this._onSingletonCardMadeDeck);
	}
	destroy() {
		_tabletop_playground_api.globalEvents.onObjectCreated.remove(this._onObjectCreated);
		_tabletop_playground_api.globalEvents.onObjectDestroyed.remove(this._onObjectDestroyed);
		OnCardBecameSingletonOrDeck.onSingletonCardCreated.remove(this._onSingletonCardCreated);
		OnCardBecameSingletonOrDeck.onSingletonCardMadeDeck.remove(this._onSingletonCardMadeDeck);
		this._nsidToObjIds.clear();
		this._trackNsids.clear();
	}
	trackNsid(nsid) {
		if (!this._trackNsids.has(nsid)) {
			this._trackNsids.add(nsid);
			this._nsidToObjIds.clear();
		}
	}
	trackNsids(nsids) {
		nsids.forEach((nsid) => this._trackNsids.add(nsid));
	}
	find(nsid) {
		if (!this._trackNsids.has(nsid)) throw new Error(`FindTracking.find called for untracked nsid: ${nsid}`);
		let objIds = this._nsidToObjIds.get(nsid);
		if (!objIds) this._seedNsidToObjIds();
		objIds = this._nsidToObjIds.get(nsid);
		if (!objIds) return [];
		const objs = [];
		for (const objId of objIds) {
			const obj = _tabletop_playground_api.world.getObjectById(objId);
			if (obj && obj.isValid()) objs.push(obj);
		}
		return objs;
	}
	findCards(nsid) {
		const objs = this.find(nsid);
		const cards = [];
		for (const obj of objs) if (obj instanceof _tabletop_playground_api.Card) cards.push(obj);
		return cards;
	}
	findCard(nsid) {
		return this.findCards(nsid)[0];
	}
};
//#endregion
//#region src/lib/game-object/cardholder-player-name/cardholder-player-name.ts
/**
* Display player name above-and-behind the card holder.
* Show a "take seat" button when no player in slot.
*/
var CardHolderPlayerName = class CardHolderPlayerName {
	static #_ = this.DEFAULT_FONT_SIZE = 30;
	constructor(cardHolder) {
		if (!cardHolder || !(cardHolder instanceof _tabletop_playground_api.CardHolder)) throw new Error("missing card holder");
		this._cardHolder = cardHolder;
		this._nameText = new _tabletop_playground_api.Text().setBold(true).setJustification(_tabletop_playground_api.TextJustification.Center).setText(" Player Name ");
		this._nameBorder = new _tabletop_playground_api.Border().setColor([
			0,
			0,
			0,
			.75
		]).setChild(this._nameText);
		this._takeSeatButton = new _tabletop_playground_api.Button().setBold(true).setText(" TAKE SEAT ");
		this._widgetSwitcher = new _tabletop_playground_api.WidgetSwitcher().addChild(this._takeSeatButton).addChild(this._nameBorder);
		this._ui = new _tabletop_playground_api.UIElement();
		this._ui.presentationStyle = _tabletop_playground_api.UIPresentationStyle.ViewAligned;
		this._ui.useTransparency = true;
		this._ui.useWidgetSize = true;
		this._ui.widget = this._widgetSwitcher;
		this._takeSeatButton.onClicked.add((_button, player) => {
			const thisSlot = this._cardHolder.getOwningPlayerSlot();
			if (thisSlot < 0) throw new Error("invalid player slot");
			player.switchSlot(thisSlot);
			const delayedResetCardHolder = () => {
				if (this._cardHolder instanceof _tabletop_playground_api.CardHolder) player.setHandHolder(this._cardHolder);
			};
			process.nextTick(delayedResetCardHolder);
		});
		const eventHandler = () => {
			process.nextTick(() => {
				this._updatePlayerStatus();
			});
		};
		_tabletop_playground_api.globalEvents.onPlayerJoined.add(eventHandler);
		_tabletop_playground_api.globalEvents.onPlayerLeft.add(eventHandler);
		_tabletop_playground_api.globalEvents.onPlayerSwitchedSlots.add(eventHandler);
		cardHolder.onDestroyed.add(() => {
			_tabletop_playground_api.globalEvents.onPlayerJoined.remove(eventHandler);
			_tabletop_playground_api.globalEvents.onPlayerLeft.remove(eventHandler);
			_tabletop_playground_api.globalEvents.onPlayerSwitchedSlots.remove(eventHandler);
		});
		cardHolder.addUI(this._ui);
		this.setColor(cardHolder.getPrimaryColor()).setFontSizeAndPosition(CardHolderPlayerName.DEFAULT_FONT_SIZE);
		this._updatePlayerStatus();
		cardHolder.onReleased.add(() => {
			this._setPosition();
		});
	}
	setColor(color) {
		this._nameText.setTextColor(color);
		this._takeSeatButton.setTextColor(color);
		return this;
	}
	setFont(fontName, fontPackageId) {
		this._nameText.setFont(fontName, fontPackageId);
		this._takeSeatButton.setFont(fontName, fontPackageId);
		return this;
	}
	setFontSizeAndPosition(fontSize) {
		this._nameText.setFontSize(fontSize);
		this._takeSeatButton.setFontSize(fontSize);
		this._setPosition();
		return this;
	}
	_setPosition() {
		const x = (this._cardHolder.getPosition().x >= 0 ? 1 : -1) * 30;
		const z = this._nameText.getFontSize() * .15;
		const worldPos = this._cardHolder.getPosition().add([
			x,
			0,
			z
		]);
		this._ui.position = this._cardHolder.worldPositionToLocal(worldPos);
		this._cardHolder.updateUI(this._ui);
	}
	_updatePlayerStatus() {
		let widget = this._takeSeatButton;
		const playerSlot = this._cardHolder.getOwningPlayerSlot();
		for (const player of _tabletop_playground_api.world.getAllPlayers()) if (player.getSlot() === playerSlot) {
			this._nameText.setText(` ${player.getName()} `);
			widget = this._nameBorder;
			break;
		}
		if (this._widgetSwitcher.getActiveWidget() !== widget) {
			this._widgetSwitcher.setActiveWidget(widget);
			this._cardHolder.updateUI(this._ui);
		}
	}
	/**
	* Update UI position for reversed card holder.
	*/
	reverseUI() {
		this._setPosition();
	}
};
//#endregion
//#region src/lib/game-object/garbage/garbage-container.ts
/**
* Possibly return the given object to its designated "thrown in the garbage" location.
*/
var GarbageHandler = class {};
/**
* Attempt to recycle deposited objects, break up decks into individual cards.
*/
var GarbageContainer = class GarbageContainer {
	static #_ = this.onRecycled = new TriggerableMulticastDelegate();
	static #_2 = this._garbageHandlers = [];
	/**
	* Register a new recycler.
	*
	* @param garbageHandler
	*/
	static addHandler(garbageHandler) {
		this._garbageHandlers.push(garbageHandler);
	}
	/**
	* Clear all recycle handlers (for tests).
	*/
	static clearHandlers() {
		this._garbageHandlers = [];
	}
	static tryRecycle(obj, player) {
		if (obj instanceof _tabletop_playground_api.Card && obj.getStackSize() > 1) return GarbageContainer._tryRecycleDeck(obj, player);
		else return GarbageContainer._tryRecycleObj(obj, player);
	}
	static _tryRecycleObj(obj, player) {
		for (const handler of this._garbageHandlers) if (handler.canRecycle(obj, player)) {
			const objId = obj.getId();
			let objName = obj.getName();
			const objMetadata = NSID.get(obj);
			if (obj instanceof _tabletop_playground_api.Card && obj.getStackSize() === 1) objName = obj.getCardDetails().name;
			if (handler.recycle(obj, player)) {
				GarbageContainer.onRecycled.trigger(objId, objName, objMetadata, player);
				return true;
			}
		}
		return false;
	}
	static _tryRecycleDeck(deck, player) {
		let recycleCount = 0;
		const stackSize = deck.getStackSize();
		for (let offset = stackSize - 1; offset >= 0; offset--) {
			let card;
			if (offset === 0 && deck.getStackSize() === 1) card = deck;
			else if (deck.getStackSize() > offset) card = deck.takeCards(1, false, offset, false);
			if (card) {
				if (GarbageContainer._tryRecycleObj(card, player)) recycleCount += 1;
				else if (card !== deck) deck.addCards(card, false, offset, false, false);
			}
		}
		return recycleCount === stackSize;
	}
	constructor(container) {
		if (!container || !(container instanceof _tabletop_playground_api.Container)) throw new Error("missing container");
		this._container = container;
		container.onInserted.add((_container, _insertedObjects, player) => {
			process.nextTick(() => {
				this._recycle(player);
			});
		});
	}
	_recycle(player) {
		const objs = this._container.getItems();
		for (const obj of objs) {
			if (!obj.isValid()) continue;
			if (obj.getContainer() !== this._container) continue;
			const above = this._container.getPosition().add([
				0,
				0,
				obj.getSize().z + 3
			]);
			this._container.take(obj, above);
			if (!GarbageContainer.tryRecycle(obj, player)) this._container.addObjects([obj]);
		}
	}
};
//#endregion
//#region src/lib/game-object/garbage/simple-card-garbage-handler.ts
/**
* Recycle cards to a specific snap point on a mat.
* Add to any deck already there, or start a new deck.
* Optionally shuffle after discard.
*/
var SimpleCardGarbageHandler = class {
	constructor() {
		this._find = new Find();
		this._cardNsidPrefix = "";
		this._snapPointTag = "";
		this._faceUp = false;
		this._shuffleAfterDiscard = false;
	}
	setCardNsidPrefix(cardNsidPrefix) {
		this._cardNsidPrefix = cardNsidPrefix;
		return this;
	}
	setSnapPointTag(tag) {
		this._snapPointTag = tag;
		return this;
	}
	setFaceUp(value) {
		this._faceUp = value;
		return this;
	}
	setShuffleAfterDiscard(shuffle) {
		this._shuffleAfterDiscard = shuffle;
		return this;
	}
	canRecycle(obj, _player) {
		if (!(obj instanceof _tabletop_playground_api.Card)) return false;
		if (obj.getStackSize() !== 1) return false;
		const nsid = NSID.get(obj);
		return this._cardNsidPrefix.length > 0 && nsid.startsWith(this._cardNsidPrefix);
	}
	recycle(obj, _player) {
		if (!(obj instanceof _tabletop_playground_api.Card)) throw new Error("not a card");
		if (obj.getStackSize() !== 1) throw new Error("not singleton card");
		if (!NSID.get(obj).startsWith(this._cardNsidPrefix)) throw new Error("nsid mismatch");
		const snapPoint = this._find.findSnapPointByTag(this._snapPointTag);
		if (!snapPoint) return false;
		let deck = snapPoint.getSnappedObject();
		if (deck && !(deck instanceof _tabletop_playground_api.Card)) deck = void 0;
		let success = true;
		if (deck) {
			let offset = 0;
			if (this._shuffleAfterDiscard) {
				deck.shuffle();
				offset = Math.floor(Math.random() * deck.getStackSize());
			}
			success = deck.addCards(obj, true, offset, true, false);
		} else {
			const above = snapPoint.getGlobalPosition().add([
				0,
				0,
				10
			]);
			obj.setPosition(above, 0);
			if (obj.isFaceUp() !== this._faceUp) {
				const rot = obj.getRotation().compose([
					0,
					0,
					180
				]);
				obj.setRotation(rot);
			}
			obj.snapToGround();
			obj.snap();
		}
		return success;
	}
};
//#endregion
//#region src/lib/game-object/garbage/simple-to-container-handler.ts
/**
* Recycle object(s) to a container, optionally matching owning slot.
*/
var SimpleToContainerHandler = class {
	constructor() {
		this._recycleObjectNsids = /* @__PURE__ */ new Set();
		this._find = new Find();
		this._requirePlayerSlot = false;
		this._containerNsid = "";
	}
	addRecycleObjectNsid(nsid) {
		this._recycleObjectNsids.add(nsid);
		return this;
	}
	setContainerNsid(nsid) {
		this._containerNsid = nsid;
		return this;
	}
	setRequireOwningPlayerSlot(value) {
		this._requirePlayerSlot = value;
		return this;
	}
	canRecycle(obj, _player) {
		const nsid = NSID.get(obj);
		return this._recycleObjectNsids.has(nsid);
	}
	recycle(obj, _player) {
		const playerSlot = this._requirePlayerSlot ? obj.getOwningPlayerSlot() : void 0;
		const container = this._find.findContainer(this._containerNsid, playerSlot);
		if (container) {
			container.addObjects([obj], 0, true);
			return true;
		}
		return false;
	}
};
//#endregion
//#region src/lib/game-object/garbage/simple-to-snap-point-handler.ts
/**
* Recycle an object to a specific snap point with the matching tag.
* Requires snap point not already occupied.
* Expects snap point is unique; does not look beyond first match.
*/
var SimpleToSnapPointHandler = class {
	constructor() {
		this._recycleObjectNsids = /* @__PURE__ */ new Set();
		this._find = new Find();
		this._snapPointTag = "";
	}
	addRecycleObjectNsid(nsid) {
		this._recycleObjectNsids.add(nsid);
		return this;
	}
	setSnapPointTag(tag) {
		this._snapPointTag = tag;
		return this;
	}
	setPreSnapRotation(rot) {
		this._preSnapRotation = rot;
		return this;
	}
	canRecycle(obj, _player) {
		const nsid = NSID.get(obj);
		return this._recycleObjectNsids.has(nsid);
	}
	recycle(obj, _player) {
		const snapPoint = this._find.findSnapPointByTag(this._snapPointTag);
		if (!snapPoint) return false;
		const otherObj = snapPoint.getSnappedObject();
		if (otherObj && otherObj.getSnappedToPoint() === snapPoint) return false;
		obj.setPosition(snapPoint.getGlobalPosition().add([
			0,
			0,
			10
		]), 1);
		if (this._preSnapRotation) obj.setRotation(this._preSnapRotation);
		obj.snapToGround();
		obj.snap();
		return true;
	}
};
//#endregion
//#region src/lib/global/global-init.ts
var GlobalInit = class {
	/**
	* Run all the init functions (even if one throws).
	* Batch together all errors for one throw at the end.
	*
	* @param abstractGlobals
	*/
	static runGlobalInit(abstractGlobals) {
		const runnables = [];
		for (const abstractGlobal of abstractGlobals) runnables.push(() => {
			abstractGlobal.init();
		});
		ErrorBatcher.runMaybeThrowAtEnd(runnables);
	}
};
//#endregion
//#region src/lib/hex/hex.ts
const HEX_LAYOUT_FLAT = {
	f0: 3 / 2,
	f1: 0,
	f2: Math.sqrt(3) / 2,
	f3: Math.sqrt(3),
	b0: 2 / 3,
	b1: 0,
	b2: -1 / 3,
	b3: Math.sqrt(3) / 3,
	startAngle: 0
};
const HEX_LAYOUT_POINTY = {
	f0: HEX_LAYOUT_FLAT.f3,
	f1: HEX_LAYOUT_FLAT.f2,
	f2: HEX_LAYOUT_FLAT.f1,
	f3: HEX_LAYOUT_FLAT.f0,
	b0: HEX_LAYOUT_FLAT.b3,
	b1: HEX_LAYOUT_FLAT.b2,
	b2: HEX_LAYOUT_FLAT.b1,
	b3: HEX_LAYOUT_FLAT.b0,
	startAngle: .5
};
/**
* Heavily distilled hex math based on RedBlobGames excellent hex docs.
* "Hex" values are strings for easy use as keys and comparison.
*/
var Hex = class Hex {
	/**
	* Get adjacent hexes.
	* First is "above", winding counterclockwise.
	*
	* @param {string} hex - Hex as "<q,r,s>" string
	* @return {Array} list of hex strings
	*/
	static neighbors(hex) {
		const [q, r, s] = Hex._hexFromString(hex);
		return [
			Hex._hexToString(q + 1, r + 0, s - 1),
			Hex._hexToString(q + 1, r - 1, s + 0),
			Hex._hexToString(q + 0, r - 1, s + 1),
			Hex._hexToString(q - 1, r + 0, s + 1),
			Hex._hexToString(q - 1, r + 1, s + 0),
			Hex._hexToString(q + 0, r + 1, s - 1)
		];
	}
	/**
	* Hex is a static-only class, do not instantiate it.
	*/
	constructor(layout, halfSize) {
		this._hexLayoutType = layout;
		this._halfSize = halfSize;
		this._tableHeight = _tabletop_playground_api.world.getTableHeight();
	}
	static _maybeHexFromString(hex) {
		const m = hex.match(/^<(-?\d+),(-?\d+),(-?\d+)>$/);
		const qStr = m === null || m === void 0 ? void 0 : m[1];
		const rStr = m === null || m === void 0 ? void 0 : m[2];
		const sStr = m === null || m === void 0 ? void 0 : m[3];
		if (qStr !== void 0 && rStr !== void 0 && sStr !== void 0) {
			const q = parseFloat(qStr);
			const r = parseFloat(rStr);
			const s = parseFloat(sStr);
			if (Math.round(q + r + s) !== 0) throw new Error(`q + r + s must be 0 ("${hex}")`);
			return [
				q,
				r,
				s
			];
		}
	}
	static _hexFromString(hex) {
		const result = Hex._maybeHexFromString(hex);
		if (result === void 0) throw new Error(`match error: "${hex}"`);
		return result;
	}
	static _hexToString(q, r, s) {
		return `<${q},${r},${s}>`;
	}
	/**
	* Get hex at position.
	*
	* @param {Vector} pos - Cartesian position on XY surface
	* @param {number} pos.x
	* @param {number} pos.y
	* @param {number} pos.z
	* @returns {string} hex as "<q,r,s>" string
	*/
	fromPosition(pos) {
		const M = this._hexLayoutType;
		const x = pos.x / this._halfSize;
		const y = pos.y / this._halfSize;
		const q = M.b0 * x + M.b1 * y;
		const r = M.b2 * x + M.b3 * y;
		const s = -q - r;
		let qi = Math.round(q);
		let ri = Math.round(r);
		let si = Math.round(s);
		const q_diff = Math.abs(qi - q);
		const r_diff = Math.abs(ri - r);
		const s_diff = Math.abs(si - s);
		if (q_diff > r_diff && q_diff > s_diff) qi = -ri - si;
		else if (r_diff > s_diff) ri = -qi - si;
		else si = -qi - ri;
		return Hex._hexToString(qi, ri, si);
	}
	/**
	* Get position from hex.
	*
	* @param {string} hex - Hex as "<q,r,s>" string
	* @returns {Vector} position
	*/
	toPosition(hex) {
		const M = this._hexLayoutType;
		const [q, r] = Hex._hexFromString(hex);
		const x = (M.f0 * q + M.f1 * r) * this._halfSize;
		const y = (M.f2 * q + M.f3 * r) * this._halfSize;
		const z = this._tableHeight;
		return new _tabletop_playground_api.Vector(x, y, z);
	}
	fromCartesian(cartesian) {
		let { left, top } = cartesian;
		if (Math.abs(left) % 2 === 1) top += .5;
		left *= this._halfSize * 2 * .75;
		top *= this._halfSize * 2 * this._hexLayoutType.f1;
		const pos = new _tabletop_playground_api.Vector(top, left, 0);
		return this.fromPosition(pos);
	}
	toCartesian(hex) {
		const pos = this.toPosition(hex);
		let left = pos.y / (this._halfSize * 2 * .75);
		let top = pos.x / (this._halfSize * 2 * this._hexLayoutType.f1);
		left = Math.round(left * 1e3) / 1e3;
		top = Math.round(top * 1e3) / 1e3;
		if (Math.abs(left) % 2 === 1) top -= .5;
		return {
			left,
			top
		};
	}
	/**
	* Get positions of hex corners.
	* First at "top right", winding counterclockwise.
	*
	* @param {string} hex - Hex as "<q,r,s>" string
	* @return {Array} list of position Vectors
	*/
	corners(hex) {
		const M = this._hexLayoutType;
		const center = this.toPosition(hex);
		const result = [];
		const z = this._tableHeight;
		for (let i = 0; i < 6; i++) {
			const phi = 2 * Math.PI * (M.startAngle - i) / 6;
			const x = center.x + this._halfSize * Math.cos(phi);
			const y = center.y + this._halfSize * Math.sin(phi);
			result.push(new _tabletop_playground_api.Vector(x, y, z));
		}
		return result;
	}
};
//#endregion
//#region src/lib/layout-objects/layout-objects.ts
/**
* Position objects, intended for initial table setup.
*/
var LayoutObjects = class LayoutObjects {
	constructor() {
		this._children = [];
		this._horizontalAlignment = _tabletop_playground_api.HorizontalAlignment.Center;
		this._verticalAlignment = _tabletop_playground_api.VerticalAlignment.Center;
		this._childDistance = 0;
		this._isVertical = false;
		this._overrideHeight = 0;
		this._overrideWidth = 0;
		this._layoutCenter = new _tabletop_playground_api.Vector(0, 0, 0);
		this.afterLayout = new TriggerableMulticastDelegate();
	}
	setChildDistance(value) {
		this._childDistance = value;
		return this;
	}
	setHorizontalAlignment(value) {
		this._horizontalAlignment = value;
		return this;
	}
	setVerticalAlignment(value) {
		this._verticalAlignment = value;
		return this;
	}
	setIsVertical(value) {
		this._isVertical = value;
		return this;
	}
	setOverrideHeight(value) {
		this._overrideHeight = value;
		return this;
	}
	setOverrideWidth(value) {
		this._overrideWidth = value;
		return this;
	}
	add(item) {
		this._children.push(item);
		return this;
	}
	addAfterLayout(f) {
		this.afterLayout.add(f);
		return this;
	}
	flip(flipH, flipV) {
		if (flipH && !this._isVertical || flipV && this._isVertical) this._children.reverse();
		if (flipH) {
			if (this._horizontalAlignment === _tabletop_playground_api.HorizontalAlignment.Left) this._horizontalAlignment = _tabletop_playground_api.HorizontalAlignment.Right;
			else if (this._horizontalAlignment === _tabletop_playground_api.HorizontalAlignment.Right) this._horizontalAlignment = _tabletop_playground_api.HorizontalAlignment.Left;
		}
		if (flipV) {
			if (this._verticalAlignment === _tabletop_playground_api.VerticalAlignment.Top) this._verticalAlignment = _tabletop_playground_api.VerticalAlignment.Bottom;
			else if (this._verticalAlignment === _tabletop_playground_api.VerticalAlignment.Bottom) this._verticalAlignment = _tabletop_playground_api.VerticalAlignment.Top;
		}
		for (const child of this._children) if (child instanceof LayoutObjects) child.flip(flipH, flipV);
		return this;
	}
	/**
	* Get size of self, applying any overrides.
	*
	* @returns {LayoutObjectsSize}
	*/
	calculateSize() {
		const size = this.calculateChildrenSize();
		if (this._overrideHeight > 0) size.h = this._overrideHeight;
		if (this._overrideWidth > 0) size.w = this._overrideWidth;
		return size;
	}
	/**
	* Get size from laying out children (ignore override on self).
	*
	* @returns {LayoutObjectsSize}
	*/
	calculateChildrenSize() {
		const size = {
			w: 0,
			h: 0
		};
		const spacing = Math.max(this._children.length - 1, 0) * this._childDistance;
		if (this._isVertical) size.h = spacing;
		else size.w = spacing;
		for (const child of this._children) {
			const childSize = LayoutObjects._calculateChildSize(child);
			if (this._isVertical) {
				size.w = Math.max(size.w, childSize.w);
				size.h += childSize.h;
			} else {
				size.h = Math.max(size.h, childSize.h);
				size.w += childSize.w;
			}
		}
		return size;
	}
	static _calculateChildSize(child) {
		let childSize;
		if (child instanceof _tabletop_playground_api.GameObject) {
			const uis = child.getUIs();
			for (const ui of uis) child.removeUIElement(ui);
			const extent = child.getExtent(true, false);
			const scale = child.getScale();
			childSize = {
				w: extent.y * 2 * scale.y,
				h: extent.x * 2 * scale.x
			};
			for (const ui of uis) child.addUI(ui);
		} else childSize = child.calculateSize();
		return childSize;
	}
	doLayoutAtPoint(center, yaw) {
		this._layoutCenter = center;
		const overrideSize = this.calculateSize();
		const childrenSize = this.calculateChildrenSize();
		let padLeft;
		let padTop;
		if (this._horizontalAlignment === _tabletop_playground_api.HorizontalAlignment.Left) padLeft = 0;
		else if (this._horizontalAlignment === _tabletop_playground_api.HorizontalAlignment.Right) padLeft = overrideSize.w - childrenSize.w;
		else padLeft = (overrideSize.w - childrenSize.w) / 2;
		if (this._verticalAlignment === _tabletop_playground_api.VerticalAlignment.Top) padTop = 0;
		else if (this._verticalAlignment === _tabletop_playground_api.VerticalAlignment.Bottom) padTop = overrideSize.h - childrenSize.h;
		else padTop = (overrideSize.h - childrenSize.h) / 2;
		let left = -overrideSize.w / 2 + padLeft;
		let top = overrideSize.h / 2 - padTop;
		for (const child of this._children) {
			const childSize = LayoutObjects._calculateChildSize(child);
			padLeft = 0;
			padTop = 0;
			if (this._isVertical) {
				if (this._horizontalAlignment === _tabletop_playground_api.HorizontalAlignment.Left) padLeft = 0;
				else if (this._horizontalAlignment === _tabletop_playground_api.HorizontalAlignment.Right) padLeft = childrenSize.w - childSize.w;
				else padLeft = (childrenSize.w - childSize.w) / 2;
			} else if (this._verticalAlignment === _tabletop_playground_api.VerticalAlignment.Top) padTop = 0;
			else if (this._verticalAlignment === _tabletop_playground_api.VerticalAlignment.Bottom) padTop = childrenSize.h - childSize.h;
			else padTop = (childrenSize.h - childSize.h) / 2;
			const childCenter = new _tabletop_playground_api.Vector(top - childSize.h / 2 - padTop, left + childSize.w / 2 + padLeft, 0).rotateAngleAxis(yaw, [
				0,
				0,
				1
			]).add(center);
			if (child instanceof _tabletop_playground_api.GameObject) {
				childCenter.z = _tabletop_playground_api.world.getTableHeight() + 20;
				child.setPosition(childCenter);
				child.setRotation(child.getRotation().compose([
					0,
					yaw,
					0
				]));
				child.snapToGround();
			} else child.doLayoutAtPoint(childCenter, yaw);
			if (this._isVertical) top -= childSize.h + this._childDistance;
			else left += childSize.w + this._childDistance;
		}
		this.afterLayout.trigger();
		return this;
	}
	getCenter() {
		return this._layoutCenter;
	}
	layoutLeftOf(peer, gap) {
		const peerSize = LayoutObjects._calculateChildSize(peer);
		const size = this.calculateSize();
		const center = peer.getPosition().subtract([
			0,
			(peerSize.w + size.w) / 2 + gap,
			0
		]);
		this.doLayoutAtPoint(center, 0);
		return this;
	}
	layoutRightOf(peer, gap) {
		const peerSize = LayoutObjects._calculateChildSize(peer);
		const size = this.calculateSize();
		const center = peer.getPosition().add([
			0,
			(peerSize.w + size.w) / 2 + gap,
			0
		]);
		this.doLayoutAtPoint(center, 0);
		return this;
	}
	layoutAbove(peer, gap) {
		const peerSize = LayoutObjects._calculateChildSize(peer);
		const size = this.calculateSize();
		const center = peer.getPosition().add([
			(peerSize.h + size.h) / 2 + gap,
			0,
			0
		]);
		this.doLayoutAtPoint(center, 0);
		return this;
	}
	layoutBelow(peer, gap) {
		const peerSize = LayoutObjects._calculateChildSize(peer);
		const size = this.calculateSize();
		const center = peer.getPosition().subtract([
			(peerSize.h + size.h) / 2 + gap,
			0,
			0
		]);
		this.doLayoutAtPoint(center, 0);
		return this;
	}
};
//#endregion
//#region src/lib/layout-objects/layout-border.ts
var LayoutBorder = class extends LayoutObjects {
	constructor(layoutObjects, padding) {
		super();
		this._color = new _tabletop_playground_api.Color(1, 1, 1, 1);
		this._outlineWidth = 1;
		this._tag = "";
		const size = layoutObjects.calculateSize();
		this.add(layoutObjects).setOverrideWidth(size.w + padding * 2).setOverrideHeight(size.h + padding * 2);
		this.addAfterLayout(() => {
			this._addBorder();
		});
	}
	setColor(color) {
		this._color = color.clone();
		return this;
	}
	setOutlineWidth(width) {
		this._outlineWidth = width;
		return this;
	}
	setTag(tag) {
		this._tag = tag;
		return this;
	}
	_addBorder() {
		if (this._tag.length > 0) {
			for (const line of _tabletop_playground_api.world.getDrawingLines()) if (line.tag === this._tag) _tabletop_playground_api.world.removeDrawingLineObject(line);
		}
		const center = this.getCenter();
		center.z = _tabletop_playground_api.world.getTableHeight() + .02;
		const wh = this.calculateSize();
		const extent = new _tabletop_playground_api.Vector(wh.h, wh.w, 0).multiply(.5);
		const topLeft = center.add(new _tabletop_playground_api.Vector(extent.x, -extent.y, 0));
		const topRight = center.add(new _tabletop_playground_api.Vector(extent.x, extent.y, 0));
		const botRight = center.add(new _tabletop_playground_api.Vector(-extent.x, extent.y, 0));
		const botLeft = center.add(new _tabletop_playground_api.Vector(-extent.x, -extent.y, 0));
		const line = new _tabletop_playground_api.DrawingLine();
		line.points = [
			topLeft,
			topRight,
			botRight,
			botLeft,
			topLeft
		];
		line.thickness = this._outlineWidth;
		line.color = this._color;
		line.tag = this._tag;
		_tabletop_playground_api.world.addDrawingLine(line);
	}
};
//#endregion
//#region src/lib/locale/locale.ts
const REPLACE_REGEX = /(?<!\\){(?!#)(.*?)(?<!\\)}/gm;
const PLURAL_REGEX = /(?<!\\){#(.*?)(?<!\\)}/gm;
const PLURAL_SEPERATOR = /(?<!\\)\|/gm;
const _lang = {};
const locale = (key, replacement) => {
	const str = _lang[key];
	if (!str) return key;
	if (replacement === void 0) return str;
	return str.replace(REPLACE_REGEX, (match) => {
		var _replacement$match$su;
		const r = (_replacement$match$su = replacement[match.substring(1, match.length - 1)]) === null || _replacement$match$su === void 0 ? void 0 : _replacement$match$su.toString();
		if (r === void 0) return match;
		return r;
	}).replace(PLURAL_REGEX, (match) => {
		const [val, singular, plural] = match.substring(2, match.length - 1).split(PLURAL_SEPERATOR);
		if (val === void 0 || singular === void 0 || plural === void 0) throw new Error("match failed");
		const num = Number(replacement[val]);
		if (isNaN(num) || num === 0) return plural;
		if (num > 1) return plural;
		return singular;
	});
};
locale.inject = (dict) => {
	for (const [k, v] of Object.entries(dict)) _lang[k] = v;
};
//#endregion
//#region src/lib/perf/perf.ts
/**
* Singleton class for frames per second performance tracking.
*/
var Perf = class Perf {
	/**
	* Returns the singleton instance of the Perf class.
	* @returns {Perf} The singleton instance.
	*/
	static getInstance() {
		if (!Perf._instance) Perf._instance = new Perf();
		return Perf._instance;
	}
	constructor(windowSize = 50) {
		this._nextWindowFrameMsecsIndex = 0;
		this._windowFps = Array(60).fill(0);
		this._nextWindowFpsIndex = 0;
		this._lastFpsUpdateSecond = -1;
		this._onTickHandler = (prevTickDurationSecs) => {
			this._windowFrameSecs[this._nextWindowFrameMsecsIndex] = prevTickDurationSecs;
			this._nextWindowFrameMsecsIndex = (this._nextWindowFrameMsecsIndex + 1) % this._windowFrameSecs.length;
			const nowSeconds = Math.floor(Date.now() / 1e3);
			if (nowSeconds !== this._lastFpsUpdateSecond) {
				this._lastFpsUpdateSecond = nowSeconds;
				const fps = this.getReport().fps;
				this._windowFps[this._nextWindowFpsIndex] = fps;
				this._nextWindowFpsIndex = (this._nextWindowFpsIndex + 1) % this._windowFps.length;
			}
		};
		this._windowFrameSecs = Array(windowSize).fill(-1);
		_tabletop_playground_api.globalEvents.onTick.add(this._onTickHandler);
	}
	init() {
		Perf.getInstance();
	}
	destroy() {
		_tabletop_playground_api.globalEvents.onTick.remove(this._onTickHandler);
	}
	/**
	* Returns a performance report based on the current data.
	* @returns {PerfReport} The performance report.
	*/
	getReport() {
		const msecs = this._windowFrameSecs.filter((seconds) => seconds > 0).map((seconds) => seconds * 1e3);
		const n = msecs.length;
		const mean = msecs.reduce((a, b) => a + b, 0) / Math.max(n, 1);
		const stdDev = Math.sqrt(msecs.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / Math.max(n, 1));
		const sorted = msecs.sort((a, b) => b - a);
		const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
		const tolerance = stdDev * 3;
		const scrubbedArray = msecs.filter((x) => x > mean - tolerance && x < mean + tolerance);
		const scrubbed = scrubbedArray.length > 0 ? scrubbedArray.reduce((a, b) => a + b, 0) / scrubbedArray.length : mean;
		const fps = scrubbed > 0 ? 1e3 / scrubbed : 0;
		return {
			median: Math.floor(median * 1e3) / 1e3,
			mean: Math.floor(mean * 1e3) / 1e3,
			scrubbed: Math.floor(scrubbed * 1e3) / 1e3,
			stdDev: Math.floor(stdDev * 1e3) / 1e3,
			fps: Math.floor(fps * 1e3) / 1e3
		};
	}
	/**
	* Returns a string representation of the current performance report.
	* @returns {string} The string representation of the performance report.
	*/
	getReportStr() {
		const report = this.getReport();
		return `frame msecs: median=${report.median.toFixed(1)} mean=${report.mean.toFixed(1)} scrubbed=${report.scrubbed.toFixed(1)} stdDev=${report.stdDev.toFixed(2)} [${report.fps.toFixed(1)}]`;
	}
	/**
	* Get per-second FPS for the last minute, in time order.
	*
	* @returns
	*/
	getFpsHistory() {
		return [...this._windowFps.slice(this._nextWindowFpsIndex), ...this._windowFps.slice(0, this._nextWindowFpsIndex)];
	}
};
//#endregion
//#region src/lib/polygon/polygon.ts
/**
* Manage a polygon in the XY plane.
*/
var Polygon = class Polygon {
	/**
	* Join two-point segments sharing the tail of one with the head of another.
	* Useful for "faction borders" connecting a set of line segments.
	*
	* @param segments
	* @returns
	*/
	static conjoin(segments) {
		const result = [];
		let watchdog = 0;
		let grow = [];
		let found = false;
		while (segments.length > 0) {
			watchdog += 1;
			if (watchdog > 1e4) throw new Error("stuck?");
			if (!found) {
				const next = segments.shift();
				if (!next) throw new Error("no head (cannot happen)");
				grow = [next.a, next.b];
				result.push(grow);
			}
			if (!grow) throw new Error("no grow (cannot happen)");
			found = false;
			const growHead = grow[0];
			const growTail = grow[grow.length - 1];
			if (!growHead || !growTail) throw new Error("no grow head or tail (cannot happen)");
			for (let i = 0; i < segments.length; i++) {
				const segment = segments[i];
				if (!segment) throw new Error("no segment (cannot happen)");
				const { a, b } = segment;
				let d = growHead.subtract(b).magnitudeSquared();
				if (d < .1) {
					grow.unshift(a);
					found = true;
					segments.splice(i, 1);
					break;
				}
				d = growHead.subtract(a).magnitudeSquared();
				if (d < .1) {
					grow.unshift(b);
					found = true;
					segments.splice(i, 1);
					break;
				}
				d = growTail.subtract(a).magnitudeSquared();
				if (d < .1) {
					grow.push(b);
					found = true;
					segments.splice(i, 1);
					break;
				}
				d = growTail.subtract(b).magnitudeSquared();
				if (d < .1) {
					grow.push(a);
					found = true;
					segments.splice(i, 1);
					break;
				}
			}
		}
		return result.map((points) => new Polygon(points));
	}
	constructor(points) {
		this._polygon = points;
	}
	/**
	* Briefly draw the polygon assuming world space coordinates.
	*/
	drawDebug() {
		const p = this._polygon;
		const color = new _tabletop_playground_api.Color(1, 0, 0);
		const duration = 10;
		const thickness = .1;
		for (let i = 0; i < p.length; i++) _tabletop_playground_api.world.drawDebugLine(p[i] ?? new _tabletop_playground_api.Vector(0, 0, 0), p[(i + 1) % p.length] ?? new _tabletop_playground_api.Vector(0, 0, 0), color, duration, thickness);
	}
	/**
	* Get polygon vertices.
	*
	* @returns {Array.<Vector>} List of vertices.
	*/
	getPoints() {
		return this._polygon.map((p) => p.clone());
	}
	/**
	* Get polygon bounding box.
	*
	* @returns {Object} Dictionary from { left, top, right, bottom } to numbers.
	*/
	getBoundingBox() {
		if (!this._boundingBox) {
			this._boundingBox = {
				left: Number.MAX_VALUE,
				top: Number.MAX_VALUE,
				right: Number.MIN_VALUE,
				bottom: Number.MIN_VALUE
			};
			for (const point of this._polygon) {
				this._boundingBox.left = Math.min(point.x, this._boundingBox.left);
				this._boundingBox.top = Math.min(point.y, this._boundingBox.top);
				this._boundingBox.right = Math.max(point.x, this._boundingBox.right);
				this._boundingBox.bottom = Math.max(point.y, this._boundingBox.bottom);
			}
		}
		return this._boundingBox;
	}
	/**
	* Is the point within the polygon's XY frame?
	*
	* @param {Vector} point
	* @returns {boolean} True if point inside polygon
	*/
	contains(point) {
		const bb = this.getBoundingBox();
		if (point.x < bb.left || point.y < bb.top || point.x > bb.right || point.y > bb.bottom) return false;
		let odd = false;
		for (let i = 0, j = this._polygon.length - 1; i < this._polygon.length; i++) {
			var _this$_polygon$i, _this$_polygon$j, _this$_polygon$j2, _this$_polygon$i2, _this$_polygon$i3, _this$_polygon$j3, _this$_polygon$i4, _this$_polygon$i5;
			if ((((_this$_polygon$i = this._polygon[i]) === null || _this$_polygon$i === void 0 ? void 0 : _this$_polygon$i.y) ?? 0) > point.y !== (((_this$_polygon$j = this._polygon[j]) === null || _this$_polygon$j === void 0 ? void 0 : _this$_polygon$j.y) ?? 0) > point.y && point.x < ((((_this$_polygon$j2 = this._polygon[j]) === null || _this$_polygon$j2 === void 0 ? void 0 : _this$_polygon$j2.x) ?? 0) - (((_this$_polygon$i2 = this._polygon[i]) === null || _this$_polygon$i2 === void 0 ? void 0 : _this$_polygon$i2.x) ?? 0)) * (point.y - (((_this$_polygon$i3 = this._polygon[i]) === null || _this$_polygon$i3 === void 0 ? void 0 : _this$_polygon$i3.y) ?? 0)) / ((((_this$_polygon$j3 = this._polygon[j]) === null || _this$_polygon$j3 === void 0 ? void 0 : _this$_polygon$j3.y) ?? 0) - (((_this$_polygon$i4 = this._polygon[i]) === null || _this$_polygon$i4 === void 0 ? void 0 : _this$_polygon$i4.y) ?? 0)) + (((_this$_polygon$i5 = this._polygon[i]) === null || _this$_polygon$i5 === void 0 ? void 0 : _this$_polygon$i5.x) ?? 0)) odd = !odd;
			j = i;
		}
		return odd;
	}
	/**
	* Create a new polygon with an inset version of this one.
	*
	* @param {number} amount
	* @returns {Polygon} Inset polygon
	*/
	inset(amount) {
		var _this$_polygon$;
		const head = this._polygon[0];
		const tail = this._polygon[this._polygon.length - 1];
		const closed = head && tail && head.subtract(tail).magnitudeSquared() < .01 ? true : false;
		if (closed) this._polygon.pop();
		const lineIntersection = function(a, b, c, d) {
			const B = b.subtract(a);
			let C = c.subtract(a);
			let D = d.subtract(a);
			const distAB = Math.hypot(B.x, B.y);
			const cos = B.x / distAB;
			const sin = B.y / distAB;
			C = new _tabletop_playground_api.Vector(C.x * cos + C.y * sin, C.y * cos - C.x * sin, c.z);
			D = new _tabletop_playground_api.Vector(D.x * cos + D.y * sin, D.y * cos - D.x * sin, d.z);
			const ABx = D.x + (C.x - D.x) * D.y / (D.y - C.y);
			return new _tabletop_playground_api.Vector(a.x + ABx * cos, a.y + ABx * sin, a.z);
		};
		const insetCorner = function(prev, cur, next) {
			const d1 = cur.subtract(prev);
			const dist1 = Math.hypot(d1.x, d1.y);
			const d2 = next.subtract(cur);
			const dist2 = Math.hypot(d2.x, d2.y);
			if (dist1 <= 0 || dist2 <= 0) return cur;
			const inset1 = new _tabletop_playground_api.Vector(d1.y * amount / dist1, -d1.x * amount / dist1, cur.z);
			const prev1 = new _tabletop_playground_api.Vector(((prev === null || prev === void 0 ? void 0 : prev.x) ?? 0) + inset1.x, ((prev === null || prev === void 0 ? void 0 : prev.y) ?? 0) + inset1.y, cur.z);
			const prev2 = new _tabletop_playground_api.Vector(cur.x + inset1.x, cur.y + inset1.y, cur.z);
			const inset2 = new _tabletop_playground_api.Vector(d2.y * amount / dist2, -d2.x * amount / dist2, cur.z);
			const next1 = new _tabletop_playground_api.Vector(cur.x + inset2.x, cur.y + inset2.y, cur.z);
			const next2 = new _tabletop_playground_api.Vector(next.x + inset2.x, next.y + inset2.y, cur.z);
			if (prev2.x == next1.x && prev2.y == next1.y) return next1;
			return lineIntersection(prev1, prev2, next1, next2);
		};
		const z = ((_this$_polygon$ = this._polygon[0]) === null || _this$_polygon$ === void 0 ? void 0 : _this$_polygon$.z) ?? 0;
		const insetPoints = [];
		const numVertices = this._polygon.length;
		for (let i = 0; i < numVertices; i++) {
			const prevPt = this._polygon[(i + numVertices - 1) % numVertices];
			const curPt = this._polygon[i];
			const nextPt = this._polygon[(i + 1) % numVertices];
			if (prevPt && curPt && nextPt) {
				const xy = insetCorner(prevPt, curPt, nextPt);
				insetPoints.push(new _tabletop_playground_api.Vector(xy.x, xy.y, z));
			}
		}
		const insetHead = insetPoints[0];
		if (closed && head && insetHead) {
			this._polygon.push(head.clone());
			insetPoints.push(insetHead.clone());
		}
		return new Polygon(insetPoints);
	}
};
//#endregion
//#region src/lib/setup/abstract-setup.ts
/**
* Store owner information.
*/
var AbstractSetup = class {
	constructor(params) {
		this._playerSlot = (params === null || params === void 0 ? void 0 : params.playerSlot) ?? -1;
		this._primaryColor = (params === null || params === void 0 ? void 0 : params.primaryColor) ?? new _tabletop_playground_api.Color(1, 1, 1, 1);
		this._secondaryColor = (params === null || params === void 0 ? void 0 : params.secondaryColor) ?? new _tabletop_playground_api.Color(0, 0, 0, 1);
	}
	getPlayerSlot() {
		return this._playerSlot;
	}
	getPrimaryColor() {
		return this._primaryColor;
	}
	getSecondaryColor() {
		return this._secondaryColor;
	}
};
//#endregion
//#region src/lib/shuffle/shuffle.ts
/**
* Shuffle an array of objects.  Original is not modified,
* returns shuffled.
*/
var Shuffle = class {
	shuffle(items) {
		const copy = [...items];
		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const a = copy[i];
			const b = copy[j];
			if (a !== void 0 && b !== void 0) {
				copy[i] = b;
				copy[j] = a;
			}
		}
		return copy;
	}
	choice(items) {
		return items[Math.floor(Math.random() * items.length)];
	}
	choiceOrThrow(items) {
		const item = this.choice(items);
		if (item === void 0) throw new Error("item undefined");
		return item;
	}
};
//#endregion
//#region src/lib/spawn/spawn.ts
/**
* Registry for NSID to template id.
*/
var Spawn = class {
	constructor() {
		this._nsidToTemplateId = {};
	}
	spawn(nsid, position, rotation) {
		const templateId = this._nsidToTemplateId[nsid];
		if (!templateId) {
			console.log(`Spawn.spawn: unknown nsid "${nsid}"`);
			return;
		}
		if (position === void 0) position = [
			0,
			0,
			0
		];
		if (rotation === void 0) rotation = [
			0,
			0,
			0
		];
		const obj = _tabletop_playground_api.world.createObjectFromTemplate(templateId, position);
		if (obj) {
			const name = _tabletop_playground_api.world.getTemplateName(templateId);
			obj.setName(name);
			obj.setRotation(rotation);
		}
		return obj;
	}
	spawnOrThrow(nsid, position, rotation) {
		const obj = this.spawn(nsid, position, rotation);
		if (!obj) throw new Error(`spawnOrThrow failed for "${nsid}"`);
		return obj;
	}
	spawnMergeDecksWithNsidPrefixOrThrow(nsidPrefix, position, rotation) {
		const nsids = this.getAllNsids().filter((nsid) => nsid.startsWith(nsidPrefix));
		if (nsids.length === 0) throw new Error(`spawnMergeDecksWithNsidPrefixOrThrow failed for prefix "${nsidPrefix}": no matching nsids`);
		return this.spawnMergeDecksOrThrow(nsids, position, rotation);
	}
	spawnMergeDecks(nsids, position, rotation) {
		if (nsids.length === 0) {
			console.log("Spawn.spawnMergeDecks: empty nsid array");
			return;
		}
		let deck;
		for (const nsid of nsids) {
			const obj = this.spawn(nsid, position, rotation);
			if (!obj) {
				console.log(`Spawn.spawnMergeDecks: unknown nsid "${nsid}"`);
				if (deck) deck.destroy();
				return;
			}
			if (!(obj instanceof _tabletop_playground_api.Card)) {
				console.log(`Spawn.spawnMergeDecks: nsid "${nsid}" not a Card`);
				if (deck) deck.destroy();
				return;
			}
			if (deck) {
				if (!deck.addCards(obj)) {
					console.log(`Spawn.spawnMergeDecks: nsid "${nsid}" failed to merge with existing deck (wrong size?)`);
					if (deck) deck.destroy();
					return;
				}
			} else deck = obj;
		}
		return deck;
	}
	spawnMergeDecksOrThrow(nsids, position, rotation) {
		const obj = this.spawnMergeDecks(nsids, position, rotation);
		if (!obj) throw new Error(`spawnMergeDecksOrThrow failed for [${nsids.join(", ")}]`);
		return obj;
	}
	inject(dict) {
		for (const [k, v] of Object.entries(dict)) this._nsidToTemplateId[k] = v;
		return this;
	}
	has(nsid) {
		return this._nsidToTemplateId[nsid] ? true : false;
	}
	clear() {
		this._nsidToTemplateId = {};
		return this;
	}
	getAllNsids() {
		return Object.keys(this._nsidToTemplateId);
	}
	getTemplateIdOrThrow(nsid) {
		const templateId = this._nsidToTemplateId[nsid];
		if (!templateId) throw new Error(`getTemplateIdOrThrow failed for "${nsid}"`);
		return templateId;
	}
	/**
	* Make sure all registered templates exist.
	*/
	validate() {
		const templateIds = /* @__PURE__ */ new Set();
		for (const pkg of _tabletop_playground_api.world.getAllowedPackages()) for (const templateId of pkg.getTemplateIds()) templateIds.add(templateId);
		const missing = [];
		for (const [nsid, templateId] of Object.entries(this._nsidToTemplateId)) if (!templateIds.has(templateId)) missing.push(`${templateId} ("${nsid}")`);
		if (missing.length > 0) throw new Error(`Spawn.validate missing templateIds (${missing.length}):\n` + missing.join("\n"));
		return this;
	}
};
//#endregion
//#region src/lib/svg/svg-sparkline/svg-sparkline.ts
var SvgSparkline = class SvgSparkline {
	static #_ = this.WIDTH = 180;
	static #_2 = this.HEIGHT = 100;
	/**
	* Create a sparkline from non-negative numbers.
	*
	* @param values
	* @returns
	*/
	static svg(values) {
		const nonZeroValues = values.filter((value) => value > 0);
		if (nonZeroValues.length === 0) nonZeroValues.push(0);
		const mean = nonZeroValues.reduce((a, b) => a + b, 0) / nonZeroValues.length;
		let max = Math.min(Math.max(...values, 0), mean * 3);
		if (max === 0) return `<svg xmlns='http://www.w3.org/2000/svg'></svg>`;
		max = Math.ceil(max / 10) * 10 + 1;
		const v = values.map((value) => SvgSparkline.HEIGHT - Math.round(value * SvgSparkline.HEIGHT / max));
		const path = [`M 0 ${v[0]}`];
		for (let i = 1; i < v.length; i++) {
			path.push(`L ${i * 3} ${v[i]}`);
			if (v[i + i] !== v[i]) path.push(`L ${i * 3 + 3} ${v[i]}`);
		}
		return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${SvgSparkline.WIDTH} ${SvgSparkline.HEIGHT}'><path d='${path.join(" ")}' stroke-width='2' stroke='red' fill='transparent' /></svg>`;
	}
	static url(values) {
		return "data:image/svg+xml," + SvgSparkline.svg(values);
	}
};
//#endregion
//#region src/lib/swap-split-combine/swap-split-combine.ts
/**
* Replace one or more objects with others.  Applies the first matching rule.
*
* Useful to replace currency items with upper/lower versions.
*/
var SwapSplitCombine = class {
	constructor(rules, spawn) {
		this._nsids = /* @__PURE__ */ new Set();
		this._playerSlotToInProgressObjIdSet = {};
		this._overrideCreate = /* @__PURE__ */ new Map();
		this._overrideDestroy = /* @__PURE__ */ new Map();
		this._overideSupplyCount = /* @__PURE__ */ new Map();
		this._primaryActionHandler = (obj, player) => {
			this._go(obj, player);
		};
		this._objectCreatedHandler = (obj) => {
			const nsid = NSID.get(obj);
			if (this._nsids.has(nsid)) obj.onPrimaryAction.add(this._primaryActionHandler);
		};
		this._rules = rules;
		this._spawn = spawn;
		for (const rule of rules) for (const nsid of rule.src.nsids) this._nsids.add(nsid);
	}
	addOverrideCreate(nsid, create) {
		this._overrideCreate.set(nsid, create);
		return this;
	}
	addOverrideDestroy(nsid, destroy) {
		this._overrideDestroy.set(nsid, destroy);
		return this;
	}
	addOverrideSupplyCount(nsid, supplyCount) {
		this._overideSupplyCount.set(nsid, supplyCount);
		return this;
	}
	/**
	* Add "r" handler to relevant objects.
	*/
	init() {
		_tabletop_playground_api.globalEvents.onObjectCreated.add(this._objectCreatedHandler);
		for (const obj of _tabletop_playground_api.world.getAllObjects()) this._objectCreatedHandler(obj);
	}
	_go(rObj, player) {
		const playerSlot = player.getSlot();
		let inProgressObjIdSet = this._playerSlotToInProgressObjIdSet[playerSlot];
		if (!inProgressObjIdSet) {
			inProgressObjIdSet = /* @__PURE__ */ new Set();
			this._playerSlotToInProgressObjIdSet[playerSlot] = inProgressObjIdSet;
		}
		if (inProgressObjIdSet.has(rObj.getId())) return;
		const nsidToObjs = this._getHoveredAndSelectedObjs(rObj, player);
		for (const objs of Object.values(nsidToObjs)) for (const obj of objs) inProgressObjIdSet.add(obj.getId());
		process.nextTick(() => {
			delete this._playerSlotToInProgressObjIdSet[playerSlot];
		});
		this._applyRules(nsidToObjs, player);
		player.setSelectedObjects([]);
	}
	_getHoveredAndSelectedObjs(rObj, player) {
		const objs = player.getSelectedObjects();
		if (!objs.includes(rObj)) objs.push(rObj);
		const nsidToObjs = {};
		for (const obj of objs) {
			const nsid = NSID.get(obj);
			let nsidObjs = nsidToObjs[nsid];
			if (!nsidObjs) {
				nsidObjs = [];
				nsidToObjs[nsid] = nsidObjs;
			}
			nsidObjs.push(obj);
		}
		return nsidToObjs;
	}
	/**
	* Apply the first matching rule.
	*
	* @param nsidToObjs
	* @param player
	*/
	_applyRules(nsidToObjs, player) {
		for (const rule of this._rules) {
			const srcObjs = [];
			for (const nsid of rule.src.nsids) {
				let objs = nsidToObjs[nsid];
				if (objs) {
					if (rule.requireFaceUp) objs = objs.filter((obj) => Facing.isFaceUp(obj));
					if (rule.requireFaceDown) objs = objs.filter((obj) => !Facing.isFaceUp(obj));
					srcObjs.push(...objs);
				}
			}
			if (srcObjs.length >= rule.src.count) {
				this._applyRule(rule, srcObjs, player);
				break;
			}
		}
	}
	_applyRule(rule, srcObjs, player) {
		if (rule.requireFaceUp) srcObjs = srcObjs.filter((obj) => Facing.isFaceUp(obj));
		if (rule.requireFaceDown) srcObjs = srcObjs.filter((obj) => !Facing.isFaceUp(obj));
		const applyCount = rule.repeat ? Math.floor(srcObjs.length / rule.src.count) : 1;
		srcObjs = srcObjs.splice(0, applyCount * rule.src.count);
		const overrideSupplyCount = this._overideSupplyCount.get(rule.dst.nsid);
		if (overrideSupplyCount) {
			if (overrideSupplyCount(player) < applyCount * rule.dst.count) return;
		}
		for (const obj of srcObjs) {
			const nsid = NSID.get(obj);
			const overrideDestroy = this._overrideDestroy.get(nsid);
			if (overrideDestroy) overrideDestroy(obj, player);
			else if (!GarbageContainer.tryRecycle(obj, void 0)) DeletedItemsContainer.destroyWithoutCopying(obj);
		}
		const pos = player.getCursorPosition();
		pos.z = _tabletop_playground_api.world.getTableHeight() + 10;
		for (let i = 0; i < applyCount; i++) for (let j = 0; j < rule.dst.count; j++) {
			let dstObj;
			const overrideCreate = this._overrideCreate.get(rule.dst.nsid);
			if (overrideCreate) {
				dstObj = overrideCreate(player);
				dstObj === null || dstObj === void 0 || dstObj.setPosition(pos);
			} else dstObj = this._spawn.spawnOrThrow(rule.dst.nsid, pos);
			if (dstObj) {
				if (rule.requireFaceDown) dstObj.setRotation([
					0,
					0,
					180
				]);
				dstObj.snapToGround();
				pos.y += dstObj.getExtent(true, false).y / 2;
			}
		}
	}
};
//#endregion
//#region src/lib/timer/timer.ts
var TimerBreakdown = class {
	constructor(overallSeconds) {
		this._sign = overallSeconds < 0 ? -1 : 1;
		overallSeconds = Math.abs(overallSeconds);
		this._seconds = Math.floor(overallSeconds % 60);
		this._minutes = Math.floor(overallSeconds / 60) % 60;
		this._hours = Math.floor(overallSeconds / 3600);
	}
	decrHours() {
		this._hours = (this._hours + 99) % 100;
		return this;
	}
	decrMinutes() {
		this._minutes = (this._minutes + 59) % 60;
		return this;
	}
	decrSeconds() {
		this._seconds = (this._seconds + 59) % 60;
		return this;
	}
	getHours() {
		return this._hours;
	}
	getMinutes() {
		return this._minutes;
	}
	getSeconds() {
		return this._seconds;
	}
	getOverallSeconds() {
		return this._sign * (this._seconds + this._minutes * 60 + this._hours * 3600);
	}
	incrHours() {
		this._hours = (this._hours + 1) % 100;
		return this;
	}
	incrMinutes() {
		this._minutes = (this._minutes + 1) % 60;
		return this;
	}
	incrSeconds() {
		this._seconds = (this._seconds + 1) % 60;
		return this;
	}
	toTimeString() {
		return (this._sign < 0 ? "-" : "") + [
			this._hours.toLocaleString().padStart(2, "0"),
			this._minutes.toLocaleString().padStart(2, "0"),
			this._seconds.toLocaleString().padStart(2, "0")
		].join(" : ");
	}
};
/**
* Timer, counts up or down.
*/
var Timer = class {
	_saveState() {
		const json = JSON.stringify({
			v: this.getSeconds(),
			d: this._direction,
			a: this._active
		});
		_tabletop_playground_api.world.setSavedData(json, this._nameSpaceId);
	}
	_loadState() {
		const json = _tabletop_playground_api.world.getSavedData(this._nameSpaceId);
		if (json && json.length > 0) {
			const data = JSON.parse(json);
			const value = data.v;
			const direction = data.d;
			if (data.a) this.start(value, direction);
		}
	}
	constructor(nameSpaceId) {
		this.onTimerExpired = new TriggerableMulticastDelegate();
		this.onTimerTick = new TriggerableMulticastDelegate();
		this._anchorTimestamp = 0;
		this._anchorValue = 0;
		this._direction = 1;
		this._active = false;
		this._nameSpaceId = nameSpaceId;
		this._loadState();
	}
	export() {
		return {
			anchorTimestamp: this._anchorTimestamp,
			anchorValue: this._anchorValue,
			direction: this._direction,
			active: this._active
		};
	}
	getDirection() {
		return this._direction;
	}
	/**
	* Get absolute seconds, does not account for countdown.
	*
	* @returns number
	*/
	getSeconds() {
		let seconds = this._anchorValue;
		if (this._active) {
			const delta = Date.now() / 1e3 - this._anchorTimestamp;
			seconds += delta * this._direction;
		}
		return seconds;
	}
	getTimeString() {
		return new TimerBreakdown(this.getSeconds()).toTimeString();
	}
	start(value, direction) {
		this._anchorValue = value;
		this._anchorTimestamp = Date.now() / 1e3;
		this._direction = direction;
		this._active = true;
		this._saveState();
		if (this._intervalHandle) {
			clearInterval(this._intervalHandle);
			this._intervalHandle = void 0;
		}
		let lastValue = this.getSeconds();
		this._intervalHandle = setInterval(() => {
			this._saveState();
			this.onTimerTick.trigger();
			if (this._direction === -1) {
				const newValue = this.getSeconds();
				if (lastValue > 0 && newValue <= 0) this.onTimerExpired.trigger();
				lastValue = newValue;
			}
		}, 500);
		return this;
	}
	stop() {
		this._anchorValue = this.getSeconds();
		this._anchorTimestamp = 0;
		this._active = false;
		if (this._intervalHandle) {
			clearInterval(this._intervalHandle);
			this._intervalHandle = void 0;
		}
		return this;
	}
	toggle() {
		if (this._active) this.stop();
		else {
			const value = this.getSeconds();
			const direction = this._direction;
			this.start(value, direction);
		}
		return this;
	}
};
//#endregion
//#region src/lib/timer/edit-timer.ts
var EditTimer = class {
	constructor(timer) {
		this._scale = 1;
		this._timer = timer;
	}
	createWidget(onClose) {
		this._timer.stop();
		const timerBreakdown = new TimerBreakdown(this._timer.getSeconds());
		const fontSize = 12 * this._scale;
		const spacing = 10 * this._scale;
		const value = new _tabletop_playground_api.Text().setFontSize(fontSize).setJustification(_tabletop_playground_api.TextJustification.Center).setText("00 : 00 : 00");
		const updateValue = () => {
			const text = timerBreakdown.toTimeString();
			value.setText(text);
		};
		updateValue();
		const addH = new _tabletop_playground_api.Button().setFontSize(fontSize).setText("+");
		const addM = new _tabletop_playground_api.Button().setFontSize(fontSize).setText("+");
		const addS = new _tabletop_playground_api.Button().setFontSize(fontSize).setText("+");
		const addPanel = new _tabletop_playground_api.HorizontalBox().setChildDistance(spacing).addChild(addH, 1).addChild(addM, 1).addChild(addS, 1);
		addH.onClicked.add(() => {
			timerBreakdown.incrHours();
			updateValue();
		});
		addM.onClicked.add(() => {
			timerBreakdown.incrMinutes();
			updateValue();
		});
		addS.onClicked.add(() => {
			timerBreakdown.incrSeconds();
			updateValue();
		});
		const subH = new _tabletop_playground_api.Button().setFontSize(fontSize).setText("-");
		const subM = new _tabletop_playground_api.Button().setFontSize(fontSize).setText("-");
		const subS = new _tabletop_playground_api.Button().setFontSize(fontSize).setText("-");
		const subPanel = new _tabletop_playground_api.HorizontalBox().setChildDistance(spacing).addChild(subH, 1).addChild(subM, 1).addChild(subS, 1);
		subH.onClicked.add(() => {
			timerBreakdown.decrHours();
			updateValue();
		});
		subM.onClicked.add(() => {
			timerBreakdown.decrMinutes();
			updateValue();
		});
		subS.onClicked.add(() => {
			timerBreakdown.decrSeconds();
			updateValue();
		});
		const timerPanel = new _tabletop_playground_api.VerticalBox().setChildDistance(spacing).addChild(addPanel).addChild(value).addChild(subPanel);
		const countUp = new _tabletop_playground_api.Button().setFontSize(fontSize).setText("Count Up");
		countUp.onClicked.add(() => {
			this._timer.start(timerBreakdown.getOverallSeconds(), 1);
			onClose();
		});
		const countDown = new _tabletop_playground_api.Button().setFontSize(fontSize).setText("Count Down");
		countDown.onClicked.add(() => {
			this._timer.start(timerBreakdown.getOverallSeconds(), -1);
			onClose();
		});
		const startStop = new _tabletop_playground_api.VerticalBox().setChildDistance(spacing).addChild(countUp, 1).addChild(countDown, 1);
		const panel = new _tabletop_playground_api.HorizontalBox().setChildDistance(spacing).addChild(timerPanel).addChild(startStop);
		const box = new _tabletop_playground_api.LayoutBox().setPadding(spacing, spacing, spacing, spacing).setChild(panel);
		return new _tabletop_playground_api.Border().setChild(box);
	}
};
//#endregion
//#region src/lib/turn-order/turn-order.ts
const TURN_ORDER_STATE_SCHEMA = zod.z.object({
	a: zod.z.number().array(),
	p: zod.z.number().array(),
	e: zod.z.number().array(),
	o: zod.z.number().array(),
	d: zod.z.number(),
	c: zod.z.number(),
	s: zod.z.number(),
	n: zod.z.number()
}).strict();
/**
* Specify turn order with direction (forward, reverse, snake).
* Provides a central, persistent state for passed and eliminiated players.
*/
var TurnOrder = class TurnOrder {
	static #_ = this.onTurnStateChanged = new TriggerableMulticastDelegate();
	static #_2 = this._idToTurnOrder = {};
	static getInstance(savedDataKey) {
		let turnOrder = TurnOrder._idToTurnOrder[savedDataKey];
		if (!turnOrder) {
			turnOrder = new TurnOrder(savedDataKey);
			TurnOrder._idToTurnOrder[savedDataKey] = turnOrder;
		}
		return turnOrder;
	}
	/**
	* Constructor.  Does NOT register with shared instance memory; ALWAYS
	* use getInstance if you want to find/create a shared instance.
	*
	* @param savedDataKey
	*/
	constructor(savedDataKey) {
		this._away = /* @__PURE__ */ new Set();
		this._passed = /* @__PURE__ */ new Set();
		this._eliminated = /* @__PURE__ */ new Set();
		this._order = [];
		this._direction = 1;
		this._currentTurn = -1;
		this._snake = false;
		this._snakeNeedsAnotherTurn = false;
		this._savedDataKey = savedDataKey;
		this._restoreState();
	}
	getId() {
		return this._savedDataKey;
	}
	_saveState() {
		const state = {
			a: Array.from(this._away),
			p: Array.from(this._passed),
			e: Array.from(this._eliminated),
			o: this._order,
			d: this._direction,
			c: this._currentTurn,
			s: this._snake ? 1 : 0,
			n: this._snakeNeedsAnotherTurn ? 1 : 0
		};
		TURN_ORDER_STATE_SCHEMA.parse(state);
		const jsonStr = JSON.stringify(state);
		_tabletop_playground_api.world.setSavedData(jsonStr, this._savedDataKey);
	}
	_restoreState() {
		const jsonStr = _tabletop_playground_api.world.getSavedData(this._savedDataKey);
		if (!jsonStr || jsonStr.length === 0) return;
		const jsonObj = JSON.parse(jsonStr);
		const state = TURN_ORDER_STATE_SCHEMA.parse(jsonObj);
		this._away.clear();
		for (const playerSlot of state.a) this._away.add(playerSlot);
		this._passed.clear();
		for (const playerSlot of state.p) this._passed.add(playerSlot);
		this._eliminated.clear();
		for (const playerSlot of state.e) this._eliminated.add(playerSlot);
		this._order = state.o;
		this._direction = state.d;
		this._currentTurn = state.c;
		this._snake = state.s === 1;
		this._snakeNeedsAnotherTurn = state.n === 1;
	}
	nextTurn() {
		let cursor = this._order.indexOf(this._currentTurn);
		if (cursor < 0) return -1;
		let playerSlot = -1;
		let attempts = this._order.length * 2 + 1;
		while (attempts-- > 0) {
			if (this._snake && this._snakeNeedsAnotherTurn) {
				this._snakeNeedsAnotherTurn = false;
				this._direction = -this._direction;
			} else cursor = (cursor + this._direction + this._order.length) % this._order.length;
			if (this._snake && (this._direction === 1 && cursor === this._order.length - 1 || this._direction === -1 && cursor === 0)) this._snakeNeedsAnotherTurn = true;
			const candidate = this._order[cursor];
			if (candidate !== void 0) {
				if (!this.getPassed(candidate) && !this.getEliminated(candidate)) {
					playerSlot = candidate;
					break;
				}
			}
		}
		this._currentTurn = playerSlot;
		this._saveState();
		TurnOrder.onTurnStateChanged.trigger(this);
		return this._currentTurn;
	}
	getCurrentTurn() {
		return this._currentTurn;
	}
	/**
	* Set current turn.
	*
	* Do not require it be in the current turn order: perhaps the caller is
	* about to chnage the order to match, or has some other wacky use in mind.
	*
	* @param playerSlot
	* @returns
	*/
	setCurrentTurn(playerSlot) {
		if (this._currentTurn === playerSlot) return this;
		this._currentTurn = playerSlot;
		this._saveState();
		TurnOrder.onTurnStateChanged.trigger(this);
		return this;
	}
	getTurnOrder() {
		return [...this._order];
	}
	setTurnOrder(order, direction, currentTurn) {
		const directionValue = direction === "reverse" ? -1 : 1;
		const isSnake = direction === "snake";
		if (order.join(",") === this._order.join(",") && directionValue === this._direction && isSnake === this._snake && currentTurn === this._currentTurn) return this;
		this._order = [...order];
		this._direction = directionValue;
		this._snake = isSnake;
		this._snakeNeedsAnotherTurn = false;
		this._currentTurn = currentTurn;
		this._saveState();
		TurnOrder.onTurnStateChanged.trigger(this);
		return this;
	}
	getDirection() {
		if (this._snake) return "snake";
		return this._direction === 1 ? "forward" : "reverse";
	}
	setDirection(direction) {
		const directionValue = direction === "reverse" ? -1 : 1;
		const isSnake = direction === "snake";
		if (directionValue === this._direction && isSnake === this._snake) return this;
		this._direction = directionValue;
		this._snake = isSnake;
		this._snakeNeedsAnotherTurn = false;
		this._saveState();
		TurnOrder.onTurnStateChanged.trigger(this);
		return this;
	}
	getAway(playerSlot) {
		return this._away.has(playerSlot);
	}
	setAway(playerSlot, value) {
		if (value) {
			if (this._away.has(playerSlot)) return this;
			this._away.add(playerSlot);
		} else {
			if (!this._away.has(playerSlot)) return this;
			this._away.delete(playerSlot);
		}
		this._saveState();
		TurnOrder.onTurnStateChanged.trigger(this);
		return this;
	}
	getEliminated(playerSlot) {
		return this._eliminated.has(playerSlot);
	}
	setEliminated(playerSlot, value) {
		if (value) {
			if (this._eliminated.has(playerSlot)) return this;
			this._eliminated.add(playerSlot);
		} else {
			if (!this._eliminated.has(playerSlot)) return this;
			this._eliminated.delete(playerSlot);
		}
		this._saveState();
		TurnOrder.onTurnStateChanged.trigger(this);
		return this;
	}
	getPassed(playerSlot) {
		return this._passed.has(playerSlot);
	}
	setPassed(playerSlot, value) {
		if (value) {
			if (this._passed.has(playerSlot)) return this;
			this._passed.add(playerSlot);
		} else {
			if (!this._passed.has(playerSlot)) return this;
			this._passed.delete(playerSlot);
		}
		this._saveState();
		TurnOrder.onTurnStateChanged.trigger(this);
		return this;
	}
};
//#endregion
//#region src/lib/ui/ui-visibility/ui-visibility.ts
/**
* Set or toggle per-player visibility.
*/
var UiVisibility = class {
	constructor(ui, obj) {
		this._visibleToPlayerSlots = [];
		if (!ui.widget) throw new Error("UiVisibility: ui.widget not set");
		this._ui = ui;
		this._obj = obj;
		this._visibleToPlayerSlots = [...Array(20).keys()];
		ui.players = this.getPlayerPermission();
	}
	getPlayerPermission() {
		return new _tabletop_playground_api.PlayerPermission().setPlayerSlots(this._visibleToPlayerSlots);
	}
	isVisibleToPlayer(playerSlot) {
		return this._visibleToPlayerSlots.includes(playerSlot);
	}
	setAll() {
		this._visibleToPlayerSlots = [...Array(20).keys()];
		this._update();
		return this;
	}
	setNone() {
		this._visibleToPlayerSlots = [];
		this._update();
		return this;
	}
	setOnlyThisPlayer(playerSlot) {
		this._visibleToPlayerSlots = [playerSlot];
		this._update();
		return this;
	}
	togglePlayer(playerSlot) {
		const index = this._visibleToPlayerSlots.indexOf(playerSlot);
		if (index >= 0) this._visibleToPlayerSlots.splice(index, 1);
		else this._visibleToPlayerSlots.push(playerSlot);
		this._update();
		return this;
	}
	_update() {
		this._ui.widget.setVisible(this._visibleToPlayerSlots.length > 0);
		this._ui.players = this.getPlayerPermission();
		if (this._ui instanceof _tabletop_playground_api.ScreenUIElement) _tabletop_playground_api.world.updateScreenUI(this._ui);
		else if (this._obj) this._obj.updateUI(this._ui);
		else _tabletop_playground_api.world.updateUI(this._ui);
	}
};
//#endregion
//#region src/lib/weighted-choice/weighted-choice.ts
/**
* Class representing a weighted choice utility.
* @class
*/
var WeightedChoice = class {
	/**
	* Constructs a new WeightedChoice instance.
	*
	* @param {Array<WeightedChoiceOption<T>>} options - The options to choose from.
	* @throws {Error} If any option weight is negative.
	*/
	constructor(options) {
		options.forEach((option) => {
			if (option.weight < 0) throw new Error("weight must be non-negative");
		});
		this._options = options;
		this._totalWeight = this._options.map((option) => option.weight).reduce((prevValue, currentValue) => {
			return prevValue + currentValue;
		}, 0);
	}
	/**
	* Returns a randomly chosen option, with the likelihood of each option
	* being chosen proportional to its weight.
	*
	* @returns {T} The chosen option.
	* @throws {Error} If the method somehow fails to choose an option.
	*/
	choice() {
		let target = Math.random() * this._totalWeight;
		for (const option of this._options) {
			if (target <= option.weight) return option.value;
			target -= option.weight;
		}
		throw new Error("unreachable");
	}
};
//#endregion
//#region src/lib/whisper-reporter/whisper-reporter-locale.data.ts
const WhisperReporterLocaleData = { "whisper-reporter.message": "whisper from {sender} to {recipient}" };
//#endregion
//#region src/lib/whisper-reporter/whisper-reporter.ts
locale.inject(WhisperReporterLocaleData);
var WhisperReporter = class {
	constructor() {
		this._onWhisper = (sender, recipient, message) => {
			const msg = locale("whisper-reporter.message", {
				sender: sender.getName(),
				recipient: recipient.getName()
			});
			const color = sender.getPlayerColor();
			for (const player of _tabletop_playground_api.world.getAllPlayers()) if (player !== sender && player !== recipient) Broadcast.chatOne(player, msg, color);
		};
	}
	init() {
		_tabletop_playground_api.globalEvents.onWhisper.add(this._onWhisper);
	}
};
//#endregion
//#region src/lib/widget/confirm-button/confirm-button.ts
/**
* Two-stage button with a confirmation message requiring
* an additional click.
*
* MUTATES THE GIVEN BUTTON, rewriting the button text to
* the confirm message.
*/
var ConfirmButton = class {
	static #_ = this.CONFIRM_TIMEOUT_MSECS = 3e3;
	/**
	* Convert the given button into a two-stage button.
	*
	* @param wrapButton
	*/
	constructor(wrapButton) {
		this._confirmMessage = "Click again\nto confirm";
		this._confirmTimeoutHandle = void 0;
		this._wrappedButton = wrapButton;
		this._initialButton = new _tabletop_playground_api.Button();
		this._switcher = new _tabletop_playground_api.WidgetSwitcher();
		this._confirmFontSize = wrapButton.getFontSize() * .6;
		this._initialButton.setBold(wrapButton.isBold()).setEnabled(wrapButton.isEnabled()).setFont(wrapButton.getFontFileName(), wrapButton.getFontPackageId()).setFontSize(wrapButton.getFontSize()).setItalic(wrapButton.isItalic()).setJustification(wrapButton.getJustification()).setText(wrapButton.getText()).setTextColor(wrapButton.getTextColor()).setVisible(wrapButton.isVisible());
		this._wrappedButton.setText(this._confirmMessage).setFontSize(this._confirmFontSize);
		this._switcher.addChild(this._initialButton).addChild(this._wrappedButton);
		this._initialButton.onClicked.add(() => {
			this._switcher.setActiveWidget(this._wrappedButton);
			if (this._confirmTimeoutHandle) {
				clearTimeout(this._confirmTimeoutHandle);
				this._confirmTimeoutHandle = void 0;
			}
			this._confirmTimeoutHandle = setTimeout(() => {
				this._confirmTimeoutHandle = void 0;
				this._switcher.setActiveWidget(this._initialButton);
			}, 3e3);
		});
		this._wrappedButton.onClicked.add(() => {
			this._switcher.setActiveWidget(this._initialButton);
			if (this._confirmTimeoutHandle) {
				clearTimeout(this._confirmTimeoutHandle);
				this._confirmTimeoutHandle = void 0;
			}
		});
	}
	setConfirmFontSize(size) {
		this._confirmFontSize = size;
		this._wrappedButton.setText(this._confirmMessage).setFontSize(this._confirmFontSize);
		return this;
	}
	setConfirmMessage(message) {
		this._confirmMessage = message;
		this._wrappedButton.setText(this._confirmMessage).setFontSize(this._confirmFontSize);
		return this;
	}
	/**
	* Overall widget for the two-stage button.
	*
	* @returns {Widget}
	*/
	getWidget() {
		return this._switcher;
	}
};
//#endregion
//#region src/lib/widget/d6widget/d6widget.ts
/**
* Show a single D6 face as a square widget.
*
* Do not extend a widget class, the class shell can be lost when retrieving
* via getChild, etc.  Use an explicit getWidget method for the widget.
*/
var D6Widget = class {
	/**
	* Constructor.
	*/
	constructor() {
		this._imageWidget = new _tabletop_playground_api.ImageWidget();
		this._canvas = new _tabletop_playground_api.Canvas().addChild(this._imageWidget, 0, 0, 1, 1);
		this._layoutBox = new _tabletop_playground_api.LayoutBox().setChild(this._canvas);
		this.setSize(50);
		this.setFace(0);
	}
	/**
	* Set the widget / single-face image size.
	*
	* @param size
	* @returns self, for chaining
	*/
	setSize(size) {
		this._layoutBox.setOverrideHeight(size).setOverrideWidth(size);
		this._imageWidget.setImageSize(size * 3, size * 3);
		return this;
	}
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
	setDiceImage(textureName, texturePackageId) {
		this._imageWidget.setImage(textureName, texturePackageId);
		return this;
	}
	/**
	* Set which face is visible in the widget.
	*
	* @param index
	* @returns self, for chaining
	*/
	setFace(index) {
		const colRowEntry = [
			{
				col: 1,
				row: 0
			},
			{
				col: 0,
				row: 1
			},
			{
				col: 1,
				row: 1
			},
			{
				col: 1,
				row: 2
			},
			{
				col: 0,
				row: 2
			},
			{
				col: 2,
				row: 1
			}
		][index];
		if (!colRowEntry) throw new Error("invalid index");
		const { col, row } = colRowEntry;
		if (typeof col !== "number" || typeof row !== "number") throw new Error("bad index");
		const s = this._layoutBox.getOverrideWidth();
		const x = col * -s;
		const y = row * -s;
		this._canvas.updateChild(this._imageWidget, x, y, s * 3, s * 3);
		return this;
	}
	/**
	* Get a widget suitable for UI.
	*
	* @returns Widget
	*/
	getWidget() {
		return this._layoutBox;
	}
};
//#endregion
//#region src/lib/widget/end-turn-button/end-turn-locale.data.ts
const EndTurnLocaleData = { "button.end-turn": "END TURN" };
//#endregion
//#region src/lib/widget/end-turn-button/end-turn-button.ts
locale.inject(EndTurnLocaleData);
/**
* Display an "end turn" button on the current-active-player's screen.
* Optionally play a sound when it becomes a player's turn.
*/
var EndTurnButton = class EndTurnButton {
	static #_ = this.WIDTH = 180;
	static #_2 = this.HEIGHT = 60;
	static #_3 = this.FONT_SIZE = 18;
	static #_4 = this.BORDER_SIZE = 2;
	static #_5 = this.OFFSET_TOP = 50;
	constructor(turnOrder, params) {
		this._doUpdate = () => {
			this.update();
		};
		this._onEndTurnClicked = (_button, player) => {
			if (this._turnOrder.getCurrentTurn() !== player.getSlot()) return;
			this._turnOrder.nextTurn();
		};
		this._turnOrder = turnOrder;
		this._params = params;
		if (params.sound) this._sound = _tabletop_playground_api.world.importSound(params.sound, params.soundPackageId);
		const scale = params.scale ?? 1;
		const fontSize = Math.round(EndTurnButton.FONT_SIZE * scale);
		const text = locale("button.end-turn");
		this._button = new _tabletop_playground_api.Button().setFontSize(fontSize).setText(text).setBold(true);
		this._button.onClicked.add(this._onEndTurnClicked);
		const borderSize = Math.round(EndTurnButton.BORDER_SIZE * scale);
		const buttonBox = new _tabletop_playground_api.LayoutBox().setPadding(borderSize, borderSize, borderSize, borderSize).setChild(this._button);
		this._border = new _tabletop_playground_api.Border().setChild(buttonBox);
		const frameBox = new _tabletop_playground_api.LayoutBox().setPadding(borderSize, borderSize, borderSize, borderSize).setChild(this._border);
		const c = .02;
		this._widget = new _tabletop_playground_api.Border().setColor([
			c,
			c,
			c,
			1
		]).setChild(frameBox);
		this._screenUI = new _tabletop_playground_api.ScreenUIElement();
		this._screenUI.anchorX = .5;
		this._screenUI.anchorY = 0;
		this._screenUI.positionX = .5;
		this._screenUI.positionY = EndTurnButton.OFFSET_TOP;
		this._screenUI.relativePositionX = true;
		this._screenUI.relativePositionY = false;
		this._screenUI.width = Math.round(EndTurnButton.WIDTH * scale);
		this._screenUI.height = Math.round(EndTurnButton.HEIGHT * scale);
		this._screenUI.widget = this._widget;
		this._uiVisibility = new UiVisibility(this._screenUI).setNone();
		TurnOrder.onTurnStateChanged.add(this._doUpdate);
		_tabletop_playground_api.globalEvents.onPlayerJoined.add(this._doUpdate);
		_tabletop_playground_api.globalEvents.onPlayerSwitchedSlots.add(this._doUpdate);
		this.update();
	}
	destroy() {
		TurnOrder.onTurnStateChanged.remove(this._doUpdate);
		_tabletop_playground_api.globalEvents.onPlayerJoined.remove(this._doUpdate);
		_tabletop_playground_api.globalEvents.onPlayerSwitchedSlots.remove(this._doUpdate);
	}
	update() {
		const current = this._turnOrder.getCurrentTurn();
		if (this._uiVisibility.isVisibleToPlayer(current)) return;
		this._uiVisibility.setOnlyThisPlayer(current);
		const color = current >= 0 ? _tabletop_playground_api.world.getSlotColor(current) : new _tabletop_playground_api.Color(1, 1, 1, 1);
		this._button.setTextColor(color);
		this._border.setColor(color);
		if (this._sound) {
			const startTime = 0;
			const volume = this._params.volume ?? 1;
			const loop = false;
			const playerPermission = this._uiVisibility.getPlayerPermission();
			this._sound.play(startTime, volume, loop, playerPermission);
		}
	}
	getWidget() {
		return this._widget;
	}
	attachToScreen() {
		_tabletop_playground_api.world.addScreenUI(this._screenUI);
		return this;
	}
	detach() {
		_tabletop_playground_api.world.removeScreenUIElement(this._screenUI);
		return this;
	}
};
//#endregion
//#region src/lib/widget/hot-seat-button/hot-seat-locale.data.ts
const HotSeatLocaleData = {
	"hot-seat.end-turn": "END TURN",
	"hot-seat.start-turn": "START TURN"
};
//#endregion
//#region src/lib/widget/hot-seat-button/hot-seat-button.ts
locale.inject(HotSeatLocaleData);
/**
* "End turn" button that sets no active player (hiding card holders, etc),
* and becomes "Start turn" for the next player to seat them.
*/
var HotSeatButton = class HotSeatButton {
	static #_ = this.WIDTH = 180;
	static #_2 = this.HEIGHT = 60;
	static #_3 = this.FONT_SIZE = 18;
	static #_4 = this.BORDER_SIZE = 2;
	static #_5 = this.OFFSET_TOP = 50;
	constructor(turnOrder, params) {
		this._doUpdate = () => {
			const currentSlot = this._turnOrder.getCurrentTurn();
			const currentColor = _tabletop_playground_api.world.getSlotColor(currentSlot);
			if (_tabletop_playground_api.world.getPlayerBySlot(currentSlot) ? true : false) this._button.setText(locale("hot-seat.end-turn"));
			else this._button.setText(locale("hot-seat.start-turn"));
			this._button.setTextColor(currentColor);
			this._border.setColor(currentColor);
		};
		this._onEndTurnClicked = (_button, player) => {
			const currentSlot = this._turnOrder.getCurrentTurn();
			if (currentSlot === player.getSlot()) {
				LeaveSeat.leaveSeat(player);
				this._turnOrder.nextTurn();
			} else player.switchSlot(currentSlot);
		};
		this._turnOrder = turnOrder;
		const scale = params.scale ?? 1;
		const fontSize = Math.round(HotSeatButton.FONT_SIZE * scale);
		const text = locale("button.end-turn");
		this._button = new _tabletop_playground_api.Button().setFontSize(fontSize).setText(text).setBold(true);
		this._button.onClicked.add(new ThrottleClickHandler(this._onEndTurnClicked).get());
		const borderSize = Math.round(HotSeatButton.BORDER_SIZE * scale);
		const buttonBox = new _tabletop_playground_api.LayoutBox().setPadding(borderSize, borderSize, borderSize, borderSize).setChild(this._button);
		this._border = new _tabletop_playground_api.Border().setChild(buttonBox);
		const frameBox = new _tabletop_playground_api.LayoutBox().setPadding(borderSize, borderSize, borderSize, borderSize).setChild(this._border);
		const c = .02;
		this._widget = new _tabletop_playground_api.Border().setColor([
			c,
			c,
			c,
			1
		]).setChild(frameBox);
		this._screenUI = new _tabletop_playground_api.ScreenUIElement();
		this._screenUI.anchorX = .5;
		this._screenUI.anchorY = 0;
		this._screenUI.positionX = .5;
		this._screenUI.positionY = HotSeatButton.OFFSET_TOP;
		this._screenUI.relativePositionX = true;
		this._screenUI.relativePositionY = false;
		this._screenUI.width = Math.round(HotSeatButton.WIDTH * scale);
		this._screenUI.height = Math.round(HotSeatButton.HEIGHT * scale);
		this._screenUI.widget = this._widget;
		TurnOrder.onTurnStateChanged.add(this._doUpdate);
		_tabletop_playground_api.globalEvents.onPlayerJoined.add(this._doUpdate);
		_tabletop_playground_api.globalEvents.onPlayerSwitchedSlots.add(this._doUpdate);
	}
	destroy() {
		TurnOrder.onTurnStateChanged.remove(this._doUpdate);
		_tabletop_playground_api.globalEvents.onPlayerJoined.remove(this._doUpdate);
		_tabletop_playground_api.globalEvents.onPlayerSwitchedSlots.remove(this._doUpdate);
	}
	getWidget() {
		return this._widget;
	}
	attachToScreen() {
		_tabletop_playground_api.world.addScreenUI(this._screenUI);
		return this;
	}
	detach() {
		_tabletop_playground_api.world.removeScreenUIElement(this._screenUI);
		return this;
	}
};
//#endregion
//#region src/lib/widget/perf-widget/perf-widget-locale.data.ts
const PerfWidgetLocaleData = { "perf-widget.context-menu.toggle-perf": "* Toggle perf" };
//#endregion
//#region src/lib/widget/perf-widget/perf-widget.ts
locale.inject(PerfWidgetLocaleData);
var PerfWidget = class {
	constructor() {
		this._refresh = () => {
			this.refresh();
		};
		this._toggleVisibilityActionName = locale("perf-widget.context-menu.toggle-perf");
		this._onCustomActionHandler = (player, identifier) => {
			if (identifier === this._toggleVisibilityActionName) this.toggleVisibility(player.getSlot());
		};
		this._perf = new Perf();
		this._webBrowser = new _tabletop_playground_api.WebBrowser();
		this._fpsText = new _tabletop_playground_api.Text().setFontSize(10).setJustification(_tabletop_playground_api.TextJustification.Center);
		this._screenUI = new _tabletop_playground_api.ScreenUIElement();
		this._screenUI.anchorX = 1.2;
		this._screenUI.anchorY = 1.4;
		this._screenUI.positionX = 1;
		this._screenUI.positionY = 1;
		this._screenUI.relativePositionX = true;
		this._screenUI.relativePositionY = true;
		this._screenUI.width = SvgSparkline.WIDTH;
		this._screenUI.height = Math.round(SvgSparkline.HEIGHT * 100 / 85);
		this._screenUI.widget = this.getWidget();
		this._uiVisibility = new UiVisibility(this._screenUI).setNone();
		this._refreshHandle = setInterval(this._refresh, 1e3);
		_tabletop_playground_api.globalEvents.onCustomAction.add(this._onCustomActionHandler);
		_tabletop_playground_api.world.removeCustomAction(this._toggleVisibilityActionName);
		_tabletop_playground_api.world.addCustomAction(this._toggleVisibilityActionName);
		this._refresh();
	}
	destroy() {
		clearInterval(this._refreshHandle);
		this._perf.destroy();
	}
	refresh() {
		const fpsHistory = this._perf.getFpsHistory();
		const url = SvgSparkline.url(fpsHistory);
		this._webBrowser.setURL(url);
		const report = this._perf.getReport();
		this._fpsText.setText(`FPS ${report.fps.toFixed(1)}`);
		return this;
	}
	getWidget() {
		const panel = new _tabletop_playground_api.VerticalBox().addChild(this._webBrowser, 85).addChild(this._fpsText, 15);
		return new _tabletop_playground_api.Border().setChild(panel);
	}
	toggleVisibility(playerSlot) {
		this._uiVisibility.togglePlayer(playerSlot);
		return this;
	}
	attachToScreen() {
		_tabletop_playground_api.world.addScreenUI(this._screenUI);
		return this;
	}
	detach() {
		_tabletop_playground_api.world.removeScreenUIElement(this._screenUI);
		return this;
	}
};
//#endregion
//#region src/locale.data.ts
const GlobalLocaleData = {
	"button.cancel": "Cancel",
	"button.ok": "OK"
};
//#endregion
//#region src/lib/widget/turn-order-widget/turn-order-locale.data.ts
const TurnOrderLocaleData = {
	"turn-order.context-menu.toggle-visibility": "*Toggle Turn Order",
	"turn-order.eliminated.clear": "Clear eliminated",
	"turn-order.eliminated.set": "Set eliminated",
	"turn-order.eliminated.toggled-by": "{clickingPlayer} toggled eliminated for {targetPlayer}",
	"turn-order.passed.clear": "Clear passed",
	"turn-order.passed.set": "Set passed",
	"turn-order.passed.toggled-by": "{clickingPlayer} toggled passed for {targetPlayer}",
	"turn-order.player-name.missing": "<?>",
	"turn-order.set-turn": "Set current turn",
	"turn-order.set-turn-by": "{clickingPlayer} set current turn to {targetPlayer}"
};
//#endregion
//#region src/lib/widget/turn-order-widget/turn-order-widget-params.ts
const TurnOrderWidgetDefaults = {
	DEFAULT_ENTRY_WIDTH: 150,
	DEFAULT_ENTRY_HEIGHT: 25,
	DEFAULT_RESERVE_SLOTS: 8
};
//#endregion
//#region src/lib/widget/turn-order-widget/turn-clicked-widget.ts
locale.inject(GlobalLocaleData);
locale.inject(TurnOrderLocaleData);
/**
* "Popup" with options when clicking on a TurnEntryWidget.
*/
var TurnClickedWidget = class {
	constructor(turnOrder, params, playerSlot) {
		this._turnOrder = turnOrder;
		this._params = params;
		this._targetPlayerSlot = playerSlot;
		const targetPlayer = _tabletop_playground_api.world.getPlayerBySlot(playerSlot);
		this._targetPlayerName = (targetPlayer === null || targetPlayer === void 0 ? void 0 : targetPlayer.getName()) ?? locale("turn-order.player-name.missing");
		this._targetPlayerIndex = Math.max(this._turnOrder.getTurnOrder().indexOf(playerSlot), 0);
	}
	_createSetTurnButton() {
		const button = new _tabletop_playground_api.Button().setText(locale("turn-order.set-turn"));
		button.onClicked.add((_button, clickingPlayer) => {
			const msg = locale("turn-order.set-turn-by", {
				clickingPlayer: clickingPlayer.getName(),
				targetPlayer: this._targetPlayerName
			});
			Broadcast.chatAll(msg);
			if (this._turnOrder.getTurnOrder().indexOf(this._targetPlayerSlot) >= 0) this._turnOrder.setCurrentTurn(this._targetPlayerSlot);
			this.detach();
		});
		return button;
	}
	_createTogglePassedButton() {
		const isPassed = this._turnOrder.getPassed(this._targetPlayerSlot);
		const button = new _tabletop_playground_api.Button().setText(locale("turn-order.passed." + (isPassed ? "clear" : "set")));
		button.onClicked.add((_button, clickingPlayer) => {
			const msg = locale("turn-order.passed.toggled-by", {
				clickingPlayer: clickingPlayer.getName(),
				targetPlayer: this._targetPlayerName
			});
			Broadcast.chatAll(msg);
			this._turnOrder.setPassed(this._targetPlayerSlot, !isPassed);
			this.detach();
		});
		return button;
	}
	_createToggleEliminatedButton() {
		const isEliminated = this._turnOrder.getEliminated(this._targetPlayerSlot);
		const button = new _tabletop_playground_api.Button().setText(locale("turn-order.eliminated." + (isEliminated ? "clear" : "set")));
		button.onClicked.add((_button, clickingPlayer) => {
			const msg = locale("turn-order.eliminated.toggled-by", {
				clickingPlayer: clickingPlayer.getName(),
				targetPlayer: this._targetPlayerName
			});
			Broadcast.chatAll(msg);
			this._turnOrder.setEliminated(this._targetPlayerSlot, !isEliminated);
			this.detach();
		});
		return button;
	}
	_createCancelButton() {
		const button = new _tabletop_playground_api.Button().setText(locale("button.cancel"));
		button.onClicked.add(() => {
			this.detach();
		});
		return button;
	}
	getWidget() {
		const header = new _tabletop_playground_api.Text().setText(this._targetPlayerName).setJustification(_tabletop_playground_api.TextJustification.Center);
		const panel = new _tabletop_playground_api.VerticalBox().addChild(header).addChild(this._createSetTurnButton());
		if (this._params.togglePassed) panel.addChild(this._createTogglePassedButton());
		if (this._params.toggleEliminated) panel.addChild(this._createToggleEliminatedButton());
		for (const customAction of this._params.customActions ?? []) {
			const identifier = customAction.identifier ?? customAction.name;
			const button = new _tabletop_playground_api.Button().setText(customAction.name);
			button.onClicked.add((_button, player) => {
				this.detach();
				if (this._params.onCustomAction) this._params.onCustomAction(player, identifier, this._targetPlayerSlot);
			});
			panel.addChild(button);
		}
		panel.addChild(this._createCancelButton());
		return new _tabletop_playground_api.LayoutBox().setVerticalAlignment(_tabletop_playground_api.VerticalAlignment.Top).setChild(new _tabletop_playground_api.Border().setChild(panel));
	}
	attachToScreen(visibleToPlayer) {
		const entryHeight = this._params.entryHeight ?? TurnOrderWidgetDefaults.DEFAULT_ENTRY_HEIGHT;
		if (this._screenUI) {
			_tabletop_playground_api.world.removeScreenUIElement(this._screenUI);
			this._screenUI = void 0;
		}
		this._screenUI = new _tabletop_playground_api.ScreenUIElement();
		this._screenUI.anchorX = 1.3;
		this._screenUI.anchorY = 0;
		this._screenUI.positionX = 1;
		this._screenUI.positionY = Math.round(entryHeight * (this._targetPlayerIndex + 1.1));
		this._screenUI.relativePositionX = true;
		this._screenUI.relativePositionY = false;
		this._screenUI.height = 300;
		this._screenUI.width = 200;
		this._screenUI.widget = this.getWidget();
		this._screenUI.players = new _tabletop_playground_api.PlayerPermission().setPlayerSlots([visibleToPlayer.getSlot()]);
		_tabletop_playground_api.world.addScreenUI(this._screenUI);
		return this;
	}
	detach() {
		if (this._screenUI) {
			_tabletop_playground_api.world.removeScreenUIElement(this._screenUI);
			this._screenUI = void 0;
		}
		return this;
	}
};
//#endregion
//#region src/lib/widget/turn-order-widget/turn-entry-wart.ts
/**
* Augment a TurnEntryWidget.  May update its own widgets independently of
* changes to turn order (e.g. change score value when score changes).
*/
var TurnEntryWart = class {};
//#endregion
//#region src/lib/widget/turn-order-widget/turn-entry-widget.ts
locale.inject(TurnOrderLocaleData);
/**
* A single widget in the TurnOrderWidget's vertical stack.
*/
var TurnEntryWidget = class TurnEntryWidget {
	static computeFontSize(boxHeight) {
		return Math.ceil(boxHeight * .5);
	}
	static truncateLongText(boxWidth, text) {
		const maxLength = Math.floor(boxWidth / 12);
		if (text.length > maxLength) return text.substring(0, maxLength);
		return text;
	}
	static getFgBgColors(turnOrder, playerSlot) {
		let fgColor = _tabletop_playground_api.world.getSlotColor(playerSlot);
		let bgColor = new _tabletop_playground_api.Color(0, 0, 0, 1);
		if (turnOrder.getCurrentTurn() === playerSlot) [fgColor, bgColor] = [bgColor, fgColor];
		return {
			fgColor,
			bgColor
		};
	}
	constructor(params) {
		var _params$margins, _params$margins2, _params$margins3, _params$margins4, _params$nameBox, _params$nameBox2, _params$nameBox3, _params$nameBox4;
		this._warts = [];
		this._params = params;
		const w = params.entryWidth ?? TurnOrderWidgetDefaults.DEFAULT_ENTRY_WIDTH;
		const h = params.entryHeight ?? TurnOrderWidgetDefaults.DEFAULT_ENTRY_HEIGHT;
		const m = {
			l: ((_params$margins = params.margins) === null || _params$margins === void 0 ? void 0 : _params$margins.left) ?? 0,
			t: ((_params$margins2 = params.margins) === null || _params$margins2 === void 0 ? void 0 : _params$margins2.top) ?? 0,
			r: ((_params$margins3 = params.margins) === null || _params$margins3 === void 0 ? void 0 : _params$margins3.right) ?? 0,
			b: ((_params$margins4 = params.margins) === null || _params$margins4 === void 0 ? void 0 : _params$margins4.bottom) ?? 0,
			w: 0,
			h: 0
		};
		m.w = w - (m.l + m.r);
		m.h = w - (m.t + m.b);
		const name = {
			l: (((_params$nameBox = params.nameBox) === null || _params$nameBox === void 0 ? void 0 : _params$nameBox.left) ?? 0) - m.l,
			t: (((_params$nameBox2 = params.nameBox) === null || _params$nameBox2 === void 0 ? void 0 : _params$nameBox2.top) ?? 0) - m.t,
			w: ((_params$nameBox3 = params.nameBox) === null || _params$nameBox3 === void 0 ? void 0 : _params$nameBox3.width) ?? w,
			h: ((_params$nameBox4 = params.nameBox) === null || _params$nameBox4 === void 0 ? void 0 : _params$nameBox4.height) ?? h
		};
		this._nameCenter = {
			x: name.l + Math.floor(name.w / 2),
			y: name.t + Math.floor(name.h / 2)
		};
		const d = Math.floor(name.h * .06);
		name.t += d;
		this._nameWidth = name.w;
		this._bgBorder = new _tabletop_playground_api.Border();
		const fontSize = TurnEntryWidget.computeFontSize(name.h);
		this._nameText = new _tabletop_playground_api.Text().setBold(true).setJustification(_tabletop_playground_api.TextJustification.Center).setFontSize(fontSize);
		this._passedLine = new _tabletop_playground_api.Border();
		this._canvas = new _tabletop_playground_api.Canvas().addChild(this._bgBorder, 0, 0, m.w, m.h).addChild(this._nameText, name.l, name.t, name.w, name.h).addChild(this._passedLine, name.l, this._nameCenter.y - 1, name.w, 2);
		const innerCanvasBox = new _tabletop_playground_api.LayoutBox().setOverrideWidth(m.w).setOverrideHeight(m.h).setChild(this._canvas);
		const borderSize = 4;
		this._contentButton = new _tabletop_playground_api.ContentButton().setChild(innerCanvasBox);
		this._widget = new _tabletop_playground_api.LayoutBox().setPadding(m.l - borderSize, m.r - borderSize, m.t - borderSize, m.b - borderSize).setOverrideWidth(w).setOverrideHeight(h).setChild(this._contentButton);
		if (params.wartGenerators) for (const wartGenerator of params.wartGenerators) {
			const wart = wartGenerator(this, params);
			this._warts.push(wart);
		}
	}
	destroy() {
		for (const wart of this._warts) wart.destroy();
	}
	getWidget() {
		return this._widget;
	}
	getCanvas() {
		return this._canvas;
	}
	update(turnOrder, playerSlot) {
		const { fgColor, bgColor } = TurnEntryWidget.getFgBgColors(turnOrder, playerSlot);
		this._bgBorder.setColor(bgColor);
		const player = _tabletop_playground_api.world.getPlayerBySlot(playerSlot);
		const playerName = TurnEntryWidget.truncateLongText(this._nameWidth, (player === null || player === void 0 ? void 0 : player.getName()) ?? locale("turn-order.player-name.missing"));
		this._nameText.setText(playerName).setTextColor(fgColor);
		this._passedLine.setVisible(turnOrder.getPassed(playerSlot) || turnOrder.getEliminated(playerSlot));
		this._passedLine.setColor(fgColor);
		const halfW = Math.floor(playerName.length * 6);
		this._canvas.updateChild(this._passedLine, this._nameCenter.x - halfW, this._nameCenter.y - 1, halfW * 2, 2);
		if (this._contentButton && this._contentButton.onClicked) {
			this._contentButton.onClicked.clear();
			this._contentButton.onClicked.add((_button, clickingPlayer) => {
				new TurnClickedWidget(turnOrder, this._params, playerSlot).attachToScreen(clickingPlayer);
			});
		}
		for (const wart of this._warts) wart.update(playerSlot, fgColor, bgColor);
	}
};
//#endregion
//#region src/lib/widget/turn-order-widget/turn-order-widget.ts
/**
* Display turn order, update when turn order changes.
*/
var TurnOrderWidget = class {
	constructor(turnOrder, params) {
		this._turnEntryWidgets = [];
		this._doUpdate = () => {
			this.update();
		};
		this._toggleVisibilityActionName = locale("turn-order.context-menu.toggle-visibility");
		this._onCustomActionHandler = (player, identifier) => {
			if (identifier === this._toggleVisibilityActionName) this.toggleVisibility(player.getSlot());
		};
		this._params = params;
		this._turnOrder = turnOrder;
		this._panel = new _tabletop_playground_api.VerticalBox().setChildDistance(0);
		this._screenUI = new _tabletop_playground_api.ScreenUIElement();
		const w = params.entryWidth ?? TurnOrderWidgetDefaults.DEFAULT_ENTRY_WIDTH;
		const h = params.entryHeight ?? TurnOrderWidgetDefaults.DEFAULT_ENTRY_HEIGHT;
		const reserveSlots = params.reserveSlots ?? TurnOrderWidgetDefaults.DEFAULT_RESERVE_SLOTS;
		const gap = 10;
		const paddedW = w + gap;
		const paddedH = h * reserveSlots + 1 + gap;
		const widget = new _tabletop_playground_api.LayoutBox().setPadding(0, gap, gap, 0).setChild(this.getWidget());
		this._screenUI.anchorX = 1;
		this._screenUI.anchorY = 0;
		this._screenUI.positionX = 1;
		this._screenUI.relativePositionX = true;
		this._screenUI.relativePositionY = true;
		this._screenUI.height = paddedH;
		this._screenUI.width = paddedW;
		this._screenUI.widget = widget;
		this._uiVisibility = new UiVisibility(this._screenUI);
		TurnOrder.onTurnStateChanged.add(this._doUpdate);
		_tabletop_playground_api.globalEvents.onPlayerJoined.add(this._doUpdate);
		_tabletop_playground_api.globalEvents.onPlayerLeft.add(this._doUpdate);
		_tabletop_playground_api.globalEvents.onPlayerSwitchedSlots.add(this._doUpdate);
		_tabletop_playground_api.globalEvents.onCustomAction.add(this._onCustomActionHandler);
		_tabletop_playground_api.world.removeCustomAction(this._toggleVisibilityActionName);
		_tabletop_playground_api.world.addCustomAction(this._toggleVisibilityActionName);
		this.update();
		this._intervalId = setInterval(() => {
			this.update();
		}, 1e3);
	}
	destroy() {
		TurnOrder.onTurnStateChanged.remove(this._doUpdate);
		_tabletop_playground_api.globalEvents.onPlayerJoined.remove(this._doUpdate);
		_tabletop_playground_api.globalEvents.onPlayerLeft.remove(this._doUpdate);
		_tabletop_playground_api.globalEvents.onPlayerSwitchedSlots.remove(this._doUpdate);
		_tabletop_playground_api.globalEvents.onCustomAction.remove(this._onCustomActionHandler);
		clearInterval(this._intervalId);
	}
	getWidget() {
		return this._panel;
	}
	update() {
		const order = this._turnOrder.getTurnOrder();
		if (this._turnEntryWidgets.length !== order.length) {
			this._panel.removeAllChildren();
			for (const turnEnryWidget of this._turnEntryWidgets) turnEnryWidget.destroy();
			this._turnEntryWidgets = [];
			for (let i = 0; i < order.length; i++) {
				const turnEnryWidget = new TurnEntryWidget(this._params);
				this._turnEntryWidgets.push(turnEnryWidget);
				this._panel.addChild(turnEnryWidget.getWidget());
			}
		}
		for (const turnWidget of this._turnEntryWidgets) turnWidget.getWidget().setVisible(false);
		for (let i = 0; i < order.length; i++) {
			const playerSlot = order[i];
			const turnWidget = this._turnEntryWidgets[i];
			if (playerSlot && turnWidget) {
				turnWidget.getWidget().setVisible(true);
				turnWidget.update(this._turnOrder, playerSlot);
			}
		}
		return this;
	}
	attachToScreen() {
		_tabletop_playground_api.world.addScreenUI(this._screenUI);
		return this;
	}
	detach() {
		_tabletop_playground_api.world.removeScreenUIElement(this._screenUI);
		return this;
	}
	isVisibleTo(playerSlot) {
		return this._uiVisibility.isVisibleToPlayer(playerSlot);
	}
	toggleVisibility(playerSlot) {
		this._uiVisibility.togglePlayer(playerSlot);
		return this;
	}
};
//#endregion
exports.AbstractRightClickCard = AbstractRightClickCard;
exports.AbstractRightClickDeck = AbstractRightClickDeck;
exports.AbstractSetup = AbstractSetup;
exports.Adjacency = Adjacency;
exports.Atop = Atop;
exports.Broadcast = Broadcast;
exports.BugCardHolderAssignment = BugCardHolderAssignment;
exports.BugForceTransformUpdates = BugForceTransformUpdates;
exports.BugSplatRemoteReporter = BugSplatRemoteReporter;
exports.BugUniqueCards = BugUniqueCards;
exports.COLORS = COLORS;
exports.CardHolderPlayerName = CardHolderPlayerName;
exports.CardUtil = CardUtil;
exports.ChessClock = ChessClock;
exports.ChessClockConfigWidget = ChessClockConfigWidget;
exports.ChessClockConfigWindow = ChessClockConfigWindow;
exports.ChessClockData = ChessClockData;
exports.ChessClockWidget = ChessClockWidget;
exports.ColorLib = ColorLib;
exports.ConfirmButton = ConfirmButton;
exports.D6Widget = D6Widget;
exports.DECK_NSID = DECK_NSID;
exports.DELTA = DELTA;
exports.DICE_GROUP_SAVED_DATA_KEY = DICE_GROUP_SAVED_DATA_KEY;
exports.DataStore = DataStore;
exports.DeletedItemsContainer = DeletedItemsContainer;
exports.DiceGroup = DiceGroup;
exports.DiceGroupCleanup = DiceGroupCleanup;
exports.DiscordSpeakingBotClient = DiscordSpeakingBotClient;
exports.DiscordWebHook = DiscordWebHook;
exports.EditTimer = EditTimer;
exports.EndTurnButton = EndTurnButton;
exports.EndTurnLocaleData = EndTurnLocaleData;
exports.ErrorBatcher = ErrorBatcher;
exports.ErrorHandler = ErrorHandler;
exports.Facing = Facing;
exports.Find = Find;
exports.FindTracking = FindTracking;
exports.GarbageContainer = GarbageContainer;
exports.GarbageHandler = GarbageHandler;
exports.GlobalInit = GlobalInit;
exports.GlobalLocaleData = GlobalLocaleData;
exports.HEX_COLOR_REGEX = HEX_COLOR_REGEX;
exports.HEX_LAYOUT_FLAT = HEX_LAYOUT_FLAT;
exports.HEX_LAYOUT_POINTY = HEX_LAYOUT_POINTY;
exports.Heap = Heap;
exports.Hex = Hex;
exports.HotSeatButton = HotSeatButton;
exports.HotSeatLocaleData = HotSeatLocaleData;
exports.LayoutBorder = LayoutBorder;
exports.LayoutObjects = LayoutObjects;
exports.LeaveSeat = LeaveSeat;
exports.NSID = NSID;
exports.OnCardBecameSingletonOrDeck = OnCardBecameSingletonOrDeck;
exports.Perf = Perf;
exports.PerfWidget = PerfWidget;
exports.PerfWidgetLocaleData = PerfWidgetLocaleData;
exports.PlayerWindow = PlayerWindow;
exports.Polygon = Polygon;
exports.ReportRemaining = ReportRemaining;
exports.Shuffle = Shuffle;
exports.SimpleCardGarbageHandler = SimpleCardGarbageHandler;
exports.SimpleToContainerHandler = SimpleToContainerHandler;
exports.SimpleToSnapPointHandler = SimpleToSnapPointHandler;
exports.Spawn = Spawn;
exports.SpeakerToPlayer = SpeakerToPlayer;
exports.SpeakingAssign = SpeakingAssign;
exports.SpeakingAssignRecord = SpeakingAssignRecord;
exports.SpeakingParser = SpeakingParser;
exports.SvgSparkline = SvgSparkline;
exports.SwapSplitCombine = SwapSplitCombine;
exports.ThrottleClickHandler = ThrottleClickHandler;
exports.TimeSpanRecord = TimeSpanRecord;
exports.TimeSpans = TimeSpans;
exports.Timer = Timer;
exports.TimerBreakdown = TimerBreakdown;
exports.TriggerableMulticastDelegate = TriggerableMulticastDelegate;
exports.TurnClickedWidget = TurnClickedWidget;
exports.TurnEntryWart = TurnEntryWart;
exports.TurnEntryWidget = TurnEntryWidget;
exports.TurnOrder = TurnOrder;
exports.TurnOrderLocaleData = TurnOrderLocaleData;
exports.TurnOrderWidget = TurnOrderWidget;
exports.TurnOrderWidgetDefaults = TurnOrderWidgetDefaults;
exports.UiVisibility = UiVisibility;
exports.WINDOW_BUTTON_ASSET = WINDOW_BUTTON_ASSET;
exports.WeightedChoice = WeightedChoice;
exports.WhisperReporter = WhisperReporter;
exports.WhisperReporterLocaleData = WhisperReporterLocaleData;
exports.Window = Window;
exports.locale = locale;
