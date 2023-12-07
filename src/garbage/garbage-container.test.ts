import {
    Card,
    CardDetails,
    Container,
    GameObject,
} from "@tabletop-playground/api";
import {
    MockCard,
    MockCardDetails,
    MockContainer,
    MockGameObject,
} from "ttpg-mock";
import { GarbageContainer, GarbageHandler } from "./garbage-container";

it("constructor", () => {
    const container: Container = new MockContainer();
    new GarbageContainer(container);
});

it("_tryRecycleObj", () => {
    class OnlyFirstRecycler implements GarbageHandler {
        public recycled: GameObject | undefined;
        public canRecycle(obj: GameObject): boolean {
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

    garbageContainer._recycle();
    expect(onlyFirstRecycler.recycled).toEqual(obj1);
    expect(container.getItems()).toEqual([obj2]);

    GarbageContainer.clearHandlers();
});

it("_tryRecycleDeck (all)", () => {
    class RecycleAll implements GarbageHandler {
        public canRecycle(obj: GameObject): boolean {
            return true;
        }
        public recycle(obj: GameObject): boolean {
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

    garbageContainer._recycle();
    expect(deck.getStackSize()).toEqual(1); // deck still exists
    expect(deck.getContainer()).toBeUndefined();

    GarbageContainer.clearHandlers();
});

it("_tryRecycleDeck (first)", () => {
    class RecycleFirst implements GarbageHandler {
        _recycled: GameObject | undefined;
        public canRecycle(obj: GameObject): boolean {
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

    garbageContainer._recycle();
    expect(deck.getStackSize()).toEqual(2);
    expect(deck.getContainer()).toEqual(container); // failed, returned to container

    GarbageContainer.clearHandlers();
});

it("_tryRecycleDeck (none)", () => {
    class RecycleNone implements GarbageHandler {
        public canRecycle(obj: GameObject): boolean {
            return false;
        }
        public recycle(obj: GameObject): boolean {
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

    garbageContainer._recycle();
    expect(deck.getStackSize()).toEqual(3);
    expect(deck.getContainer()).toEqual(container); // failed, returned to container

    GarbageContainer.clearHandlers();
});
