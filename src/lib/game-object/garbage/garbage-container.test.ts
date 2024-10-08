import { Card, Container, GameObject, Player } from "@tabletop-playground/api";
import {
    MockCard,
    MockCardDetails,
    MockContainer,
    MockGameObject,
    MockPlayer,
} from "ttpg-mock";
import { GarbageContainer, GarbageHandler } from "./garbage-container";

it("constructor", () => {
    const container: Container = new MockContainer();
    new GarbageContainer(container);
});

it("constructor (bad obj)", () => {
    expect(() => {
        new GarbageContainer(undefined as unknown as Container);
    }).toThrow();
});

it("_tryRecycleObj", () => {
    class OnlyFirstRecycler implements GarbageHandler {
        public recycled: GameObject | undefined;
        public canRecycle(): boolean {
            return true;
        }
        public recycle(obj: GameObject): boolean {
            if (this.recycled) {
                return false;
            }
            this.recycled = obj;
            return true;
        }
    }
    const onlyFirstRecycler = new OnlyFirstRecycler();
    GarbageContainer.clearHandlers();
    GarbageContainer.addHandler(onlyFirstRecycler);

    const obj1 = new MockGameObject();
    const obj2 = new MockGameObject();
    const container = new MockContainer({ items: [obj1, obj2] });
    const garbageContainer = new GarbageContainer(container);

    const player = new MockPlayer();
    garbageContainer._recycle(player);
    expect(onlyFirstRecycler.recycled).toEqual(obj1);
    expect(container.getItems()).toEqual([obj2]);

    GarbageContainer.clearHandlers();
});

it("_tryRecycleDeck (all)", () => {
    class RecycleAll implements GarbageHandler {
        public canRecycle(): boolean {
            return true;
        }
        public recycle(): boolean {
            return true;
        }
    }

    const recylceAll = new RecycleAll();
    GarbageContainer.clearHandlers();
    GarbageContainer.addHandler(recylceAll);

    const card1 = new MockCardDetails({ metadata: "my-card-1" });
    const card2 = new MockCardDetails({ metadata: "my-card-2" });
    const card3 = new MockCardDetails({ metadata: "my-card-3" });
    const deck: Card = new MockCard({
        cardDetails: [card1, card2, card3],
    });
    const container = new MockContainer({ items: [deck] });
    const garbageContainer = new GarbageContainer(container);
    expect(deck.getContainer()).toEqual(container);
    expect(deck.getStackSize()).toEqual(3);

    const player = new MockPlayer();
    garbageContainer._recycle(player);
    expect(deck.getStackSize()).toEqual(1); // deck still exists
    expect(deck.getContainer()).toBeUndefined();

    GarbageContainer.clearHandlers();
});

it("_tryRecycleDeck (first)", () => {
    class RecycleFirst implements GarbageHandler {
        _recycled: GameObject | undefined;
        public canRecycle(): boolean {
            return true;
        }
        public recycle(obj: GameObject): boolean {
            if (this._recycled) {
                return false;
            }
            this._recycled = obj;
            return true;
        }
    }

    const recylceFirst = new RecycleFirst();
    GarbageContainer.clearHandlers();
    GarbageContainer.addHandler(recylceFirst);

    const card1 = new MockCardDetails({ metadata: "my-card-1" });
    const card2 = new MockCardDetails({ metadata: "my-card-2" });
    const card3 = new MockCardDetails({ metadata: "my-card-3" });
    const deck: Card = new MockCard({
        cardDetails: [card1, card2, card3],
    });
    const container = new MockContainer({ items: [deck] });
    const garbageContainer = new GarbageContainer(container);
    expect(deck.getContainer()).toEqual(container);
    expect(deck.getStackSize()).toEqual(3);

    const player = new MockPlayer();
    garbageContainer._recycle(player);
    expect(deck.getStackSize()).toEqual(2);
    expect(deck.getContainer()).toEqual(container); // failed, returned to container

    GarbageContainer.clearHandlers();
});

it("_tryRecycleDeck (none)", () => {
    class RecycleNone implements GarbageHandler {
        public canRecycle(): boolean {
            return false;
        }
        public recycle(): boolean {
            return false;
        }
    }

    const recylceNone = new RecycleNone();
    GarbageContainer.clearHandlers();
    GarbageContainer.addHandler(recylceNone);

    const card1 = new MockCardDetails({ metadata: "my-card-1" });
    const card2 = new MockCardDetails({ metadata: "my-card-2" });
    const card3 = new MockCardDetails({ metadata: "my-card-3" });
    const deck: Card = new MockCard({
        cardDetails: [card1, card2, card3],
    });
    const container = new MockContainer({ items: [deck] });
    const garbageContainer = new GarbageContainer(container);
    expect(deck.getContainer()).toEqual(container);
    expect(deck.getStackSize()).toEqual(3);

    const player = new MockPlayer();
    garbageContainer._recycle(player);
    expect(deck.getStackSize()).toEqual(3);
    expect(deck.getContainer()).toEqual(container); // failed, returned to container

    GarbageContainer.clearHandlers();
});

it("onRecycled", () => {
    const recycledNames: Array<string> = [];
    const onRecycledHandler = (
        objName: string,
        _objMetadata: string,
        _player: Player | undefined
    ) => {
        recycledNames.push(objName);
    };

    class RecycleAll implements GarbageHandler {
        public canRecycle(): boolean {
            return true;
        }
        public recycle(): boolean {
            return true;
        }
    }

    GarbageContainer.clearHandlers();
    GarbageContainer.addHandler(new RecycleAll());
    GarbageContainer.onRecycled.add(onRecycledHandler);

    const obj = new MockGameObject({ name: "my-obj" });
    const player = new MockPlayer();
    GarbageContainer.tryRecycle(obj, player);
    expect(recycledNames).toEqual(["my-obj"]);

    GarbageContainer.clearHandlers();
    GarbageContainer.onRecycled.clear();
});

it("container onInserted", () => {
    const recycledNames: Array<string> = [];
    const onRecycledHandler = (
        objName: string,
        _objMetadata: string,
        _getHoveredAndSelectedObjsplayer: Player | undefined
    ) => {
        recycledNames.push(objName);
    };

    class RecycleAll implements GarbageHandler {
        public canRecycle(): boolean {
            return true;
        }
        public recycle(): boolean {
            return true;
        }
    }

    GarbageContainer.clearHandlers();
    GarbageContainer.addHandler(new RecycleAll());
    GarbageContainer.onRecycled.add(onRecycledHandler);

    const container: MockContainer = new MockContainer();
    new GarbageContainer(container);

    const obj1 = new MockGameObject({ name: "my-obj-1" });
    const obj2 = new MockGameObject({ name: "my-obj-2" });
    const obj3 = new MockGameObject({ name: "my-obj-2" });
    const player = new MockPlayer();

    container._addObjectsAsPlayer(
        [obj1, obj2, obj3],
        undefined,
        undefined,
        player
    );
    expect(container.getItems()).toEqual([obj1, obj2, obj3]);

    // Destroy before processing.
    obj2.destroy();

    // Remove while processing other item.
    const removeObj3 = () => {
        container.take(obj3, [0, 0, 0]);
        GarbageContainer.onRecycled.remove(removeObj3);
    };
    GarbageContainer.onRecycled.add(removeObj3);

    process.flushTicks();
    expect(recycledNames).toEqual(["my-obj-1"]);

    GarbageContainer.clearHandlers();
    GarbageContainer.onRecycled.clear();
});
