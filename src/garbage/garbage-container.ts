import {
  Card,
  Container,
  GameObject,
  Player,
  Vector,
} from "@tabletop-playground/api";
import { TriggerableMulticastDelegate } from "../triggerable-multicast-delegate/triggerable-multicast-delegate";

export abstract class GarbageHandler {
  /**
   * Can recycle this object?
   *
   * @param obj
   */
  public abstract canRecycle(obj: GameObject): boolean;

  /**
   * Recycle the object.
   *
   * @param obj
   * @returns true if recycled
   */
  public abstract recycle(obj: GameObject): boolean;
}

/**
 * Attempt to recycle deposited objects, break up decks into individual cards.
 */
export class GarbageContainer {
  public static onRecycled = new TriggerableMulticastDelegate<
    (obj: GameObject, player: Player | undefined) => void
  >();
  private static _garbageHandlers: GarbageHandler[] = [];

  private readonly _container: Container;

  /**
   * Register a new recycler.
   *
   * @param garbageHandler
   */
  public static addHandler(garbageHandler: GarbageHandler): void {
    this._garbageHandlers.push(garbageHandler);
  }

  /**
   * Clear all recycle handlers (for tests).
   */
  public static clearHandlers(): void {
    this._garbageHandlers = [];
  }

  public static tryRecycle(
    obj: GameObject,
    player: Player | undefined
  ): boolean {
    if (obj instanceof Card && obj.getStackSize() > 1) {
      return GarbageContainer._tryRecycleDeck(obj, player);
    } else {
      return GarbageContainer._tryRecycleObj(obj, player);
    }
  }

  private static _tryRecycleObj(
    obj: GameObject,
    player: Player | undefined
  ): boolean {
    for (const handler of this._garbageHandlers) {
      if (handler.canRecycle(obj)) {
        if (handler.recycle(obj)) {
          GarbageContainer.onRecycled.trigger(obj, player);
          return true;
        }
      }
    }
    return false;
  }

  private static _tryRecycleDeck(
    deck: Card,
    player: Player | undefined
  ): boolean {
    let recycleCount = 0;
    const stackSize = deck.getStackSize();

    // Process one card at a time.  Assume a handler will exist, cost to
    // extract card worthwhile (and if not, same code path for simplicity).
    for (let offset = stackSize - 1; offset >= 0; offset--) {
      // Get the card (use the deck if only one card left).
      let card: Card | undefined;
      if (offset === 0 && deck.getStackSize() === 1) {
        card = deck;
      } else if (deck.getStackSize() > offset) {
        const numCards = 1;
        const fromFront = false;
        const keep = false;
        card = deck.takeCards(numCards, fromFront, offset, keep);
      }
      if (!card) {
        continue;
      }

      // Try to recycle, return card to same spot if fails.
      let success = GarbageContainer._tryRecycleObj(card, player);
      if (success) {
        recycleCount += 1;
      } else if (card !== deck) {
        const toFront = false;
        const animate = false;
        const flipped = false;
        deck.addCards(card, toFront, offset, animate, flipped);
      }
    }
    return recycleCount === stackSize;
  }

  public constructor(container: Container) {
    if (!container) {
      throw new Error("missing container");
    }
    this._container = container;

    container.onInserted.add(
      (container: Container, insertedObjects: GameObject[], player: Player) => {
        process.nextTick(() => {
          this._recycle(player);
        });
      }
    );
  }

  // Expose for testing.
  _recycle(player: Player | undefined) {
    const objs: GameObject[] = this._container.getItems();
    for (const obj of objs) {
      // Verify object.
      if (!obj.isValid()) {
        continue; // object destroyed
      }
      if (obj.getContainer() !== this._container) {
        continue; // object no longer in this container
      }

      // Remove from container.
      const above: Vector = this._container
        .getPosition()
        .add([0, 0, obj.getSize().z + 3]);
      this._container.take(obj, above);

      // Attempt to recyle.
      const success: boolean = GarbageContainer.tryRecycle(obj, player);

      // If recycle fails, return to container.
      if (!success) {
        this._container.addObjects([obj]);
      }
    }
  }
}
