import { world } from "@tabletop-playground/api";
import { NamedspacedId } from "../namespace-id/namespace-id";
import { TriggerableMulticastDelegate } from "../event/triggerable-multicast-delegate";
import { z } from "zod";

export type Direction = "forward" | "reverse" | "snake";
export type PlayerSlot = number;

// Compact serialized format; global saved state space is precious.
// We could make some less used entries optional, but it's safer to consume
// that space so the state size is mostly stable.
const TURN_ORDER_STATE_SCHEMA = z
    .object({
        p: z.number().array(), // passed
        e: z.number().array(), // eliminated
        o: z.number().array(), // order
        d: z.number(), // direction
        c: z.number(), // current turn
        s: z.number(), // snake
        n: z.number(), // snake needs another turn
    })
    .strict();
type TurnOrderState = z.infer<typeof TURN_ORDER_STATE_SCHEMA>;

/**
 * Specify turn order with direction (forward, reverse, snake).
 * Provides a central, persistent state for passed and eliminiated players.
 */
export class TurnOrder {
    public static readonly onTurnStateChanged =
        new TriggerableMulticastDelegate<(turnOrder: TurnOrder) => void>();

    private static readonly _idToTurnOrder: {
        [key: NamedspacedId]: TurnOrder;
    } = {};

    private readonly _savedDataKey: NamedspacedId;
    private readonly _passed: Set<PlayerSlot> = new Set();
    private readonly _eliminated: Set<PlayerSlot> = new Set();

    private _order: PlayerSlot[] = [];
    private _direction: number = 1;
    private _currentTurn: PlayerSlot = -1;
    private _snake: boolean = false;
    private _snakeNeedsAnotherTurn: boolean = false;

    static getInstance(savedDataKey: NamedspacedId): TurnOrder {
        let turnOrder: TurnOrder | undefined =
            TurnOrder._idToTurnOrder[savedDataKey];
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
    constructor(savedDataKey: NamedspacedId) {
        this._savedDataKey = savedDataKey;
        this._restoreState();
    }

    getId(): NamedspacedId {
        return this._savedDataKey;
    }

    _saveState() {
        const state: TurnOrderState = {
            p: Array.from(this._passed),
            e: Array.from(this._eliminated),
            o: this._order,
            d: this._direction,
            c: this._currentTurn,
            s: this._snake ? 1 : 0,
            n: this._snakeNeedsAnotherTurn ? 1 : 0,
        };
        TURN_ORDER_STATE_SCHEMA.parse(state); // validate
        const jsonStr = JSON.stringify(state);
        world.setSavedData(jsonStr, this._savedDataKey);
    }

    _restoreState() {
        const jsonStr: string = world.getSavedData(this._savedDataKey);
        if (!jsonStr || jsonStr.length === 0) {
            return;
        }
        const jsonObj = JSON.parse(jsonStr);
        const state: TurnOrderState = TURN_ORDER_STATE_SCHEMA.parse(jsonObj);

        this._passed.clear();
        for (const playerSlot of state.p) {
            this._passed.add(playerSlot);
        }
        this._eliminated.clear();
        for (const playerSlot of state.e) {
            this._eliminated.add(playerSlot);
        }
        this._order = state.o;
        this._direction = state.d;
        this._currentTurn = state.c;
        this._snake = state.s === 1;
        this._snakeNeedsAnotherTurn = state.n === 1;
    }

    nextTurn(): PlayerSlot {
        let cursor = this._order.indexOf(this._currentTurn);
        if (cursor < 0) {
            return -1;
        }

        let playerSlot: PlayerSlot = -1;
        let attempts = this._order.length * 2 + 1;
        while (attempts > 0) {
            // Advance to next slot.
            if (this._snake && this._snakeNeedsAnotherTurn) {
                this._snakeNeedsAnotherTurn = false;
                this._direction = -this._direction;
            } else {
                cursor =
                    (cursor + this._direction + this._order.length) %
                    this._order.length;
            }

            // If snake hit end, mark as needing another turn.
            if (
                this._snake &&
                ((this._direction === 1 && cursor === this._order.length - 1) ||
                    (this._direction === -1 && cursor === 0))
            ) {
                this._snakeNeedsAnotherTurn = true;
            }

            // Is the candidate available?
            playerSlot = this._order[cursor];
            if (
                !this._passed.has(playerSlot) &&
                !this._eliminated.has(playerSlot)
            ) {
                break; // use this player slot
            }
        }
        this._currentTurn = playerSlot;

        this._saveState();
        TurnOrder.onTurnStateChanged.trigger(this);
        return this._currentTurn;
    }

    getCurrentTurn(): PlayerSlot {
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
    setCurrentTurn(playerSlot: PlayerSlot): this {
        this._currentTurn = playerSlot;

        this._saveState();
        TurnOrder.onTurnStateChanged.trigger(this);
        return this;
    }

    getTurnOrder(): PlayerSlot[] {
        return [...this._order]; // copy
    }

    setTurnOrder(
        order: PlayerSlot[],
        direction: Direction,
        currentTurn: PlayerSlot
    ): this {
        this._order = order;
        this._direction = direction === "reverse" ? -1 : 1;
        this._snake = direction === "snake";
        this._snakeNeedsAnotherTurn = false;
        this._currentTurn = currentTurn;

        this._saveState();
        TurnOrder.onTurnStateChanged.trigger(this);
        return this;
    }

    getDirection(): Direction {
        if (this._snake) {
            return "snake";
        }
        return this._direction === 1 ? "forward" : "reverse";
    }

    setDirection(direction: Direction): this {
        this._direction = direction === "reverse" ? -1 : 1;
        this._snake = direction === "snake";
        this._snakeNeedsAnotherTurn = false;

        this._saveState();
        TurnOrder.onTurnStateChanged.trigger(this);
        return this;
    }

    getEliminated(playerSlot: PlayerSlot): boolean {
        return this._eliminated.has(playerSlot);
    }

    setEliminated(playerSlot: PlayerSlot, value: boolean): this {
        if (value) {
            this._eliminated.add(playerSlot);
        } else {
            this._eliminated.delete(playerSlot);
        }

        this._saveState();
        TurnOrder.onTurnStateChanged.trigger(this);
        return this;
    }

    getPassed(playerSlot: PlayerSlot): boolean {
        return this._passed.has(playerSlot);
    }

    setPassed(playerSlot: PlayerSlot, value: boolean): this {
        if (value) {
            this._passed.add(playerSlot);
        } else {
            this._passed.delete(playerSlot);
        }

        this._saveState();
        TurnOrder.onTurnStateChanged.trigger(this);
        return this;
    }
}
