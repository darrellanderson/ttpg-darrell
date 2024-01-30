import { Color, Dice, Vector, world } from "@tabletop-playground/api";
import { TriggerableMulticastDelegate } from "../event/triggerable-multicast-delegate";
import { AbstractGlobal } from "../global/abstract-global";

export type DiceParams = {
    sides: 4 | 6 | 8 | 10 | 12 | 20;
    id?: string;
    color?: Color | [r: number, g: number, b: number, a: number];
    name?: string;
    hit?: number;
    crit?: number;
    reroll?: boolean;
};

export type DiceResult = {
    value: number;
    id?: string;
    hit: boolean;
    crit: boolean;
    rerolled?: number;
};

const DICE_GROUP_SAVED_DATA_KEY = "__DiceGroup_Dice__";

export class DiceGroupCleanup extends AbstractGlobal {
    init(): void {
        const skipContained = true;
        for (const obj of world.getAllObjects(skipContained)) {
            if (obj.getSavedData(DICE_GROUP_SAVED_DATA_KEY)) {
                obj.destroy();
            }
        }
    }
}

export class DiceGroup {
    public static readonly TIMEOUT_SECONDS = 3;

    public readonly onRolled = new TriggerableMulticastDelegate<
        (diceResults: DiceResult[]) => void
    >();

    private readonly _diceParamsArray: DiceParams[] = [];
    private readonly _dice: Dice[] = [];
    private _deleteAfterSeconds: number = -1;
    private _position: Vector | [x: number, y: number, z: number] | undefined;

    constructor() {}

    addDice(diceParams: DiceParams): this {
        this._diceParamsArray.push(diceParams);
        return this;
    }

    setDeleteAfterSeconds(value: number): this {
        this._deleteAfterSeconds = value;
        return this;
    }

    roll(): this {
        // Create dice.
        const dice: Dice[] = [];
        const deleteDice = () => {
            for (const die of dice) {
                die.destroy();
            }
        };
        const sendResult = () => {
            const result: DiceResult[] = [];
            // TODO
            this.onRolled.trigger(result);
        };

        // Stop if not finished after enough time.
        const timeoutMsecs - 
        const timeoutHandle = setTimeout(() => {
            sendResult();
            deleteDice();
        }, DiceGroup.TIMEOUT_SECONDS * 1000);

        // Delete after seconds.
        let deleteAfterSecondsHandle;
        if (this._deleteAfterSeconds > 0) {
            deleteAfterSecondsHandle = setTimeout(
                deleteDice,
                this._deleteAfterSeconds * 1000
            );
        }

        // Roll.

        return this;
    }

    fakeRoll(): this {
        return this;
    }
}
