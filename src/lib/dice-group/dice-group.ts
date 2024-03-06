import {
    Color,
    Dice,
    GameObject,
    Player,
    Vector,
    globalEvents,
    world,
} from "@tabletop-playground/api";
import { IGlobal } from "../global/i-global";

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
    critCount?: number; // how many extra hits per crit?
    reroll?: boolean; // reroll once if not a hit
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
};

export type DiceResult = {
    diceParams: DiceParams;
    dice?: Dice;
    value: number; // one based
    hit?: boolean; // one based
    crit?: boolean; // one based
    rerolledValue?: number; // one based
};

export const DICE_GROUP_SAVED_DATA_KEY = "__DiceGroup_DiceId__";

/**
 * Remove any lingering DiceGroup dice.
 */
export class DiceGroupCleanup implements IGlobal {
    init(): void {
        const skipContained = true;
        for (const obj of world.getAllObjects(skipContained)) {
            if (!(obj instanceof Dice)) {
                continue;
            }
            const value = obj.getSavedData(DICE_GROUP_SAVED_DATA_KEY);
            if (value && value.length > 0) {
                obj.destroy();
            }
        }
    }
}

/**
 * Roll a collection of dice, listen to onRolled for overall result.
 * Can only be used once, create a new one for new rolls.
 *
 * Intended use: roll + format
 */
export class DiceGroup {
    public static readonly DEFAULT_TIMEOUT_SECONDS = 3;
    public static readonly DEFAULT_DELETE_AFTER_SECONDS = 5;

    /**
     * Create and roll dice group.
     * Do via static to prevent attempting to reuse the single-use instance.
     *
     * @param params
     */
    public static roll(params: DiceGroupParams): void {
        const diceGroup = new DiceGroup(params);
        if (params.doFakeRoll) {
            diceGroup.fakeRoll();
        } else {
            diceGroup.roll();
        }
    }

    /**
     * Format a dice result for display.
     *
     * @param diceResult
     * @returns
     */
    public static format(diceResult: DiceResult): string {
        const parts: Array<string> = [];
        if (diceResult.rerolledValue) {
            parts.push(`${diceResult.rerolledValue}->`);
        }
        parts.push(diceResult.value.toString());
        if (diceResult.hit) {
            parts.push("#");
        }
        if (diceResult.crit) {
            for (let i = 0; i < (diceResult.diceParams.critCount ?? 1); i++) {
                parts.push("#");
            }
        }
        return parts.join("");
    }

    private readonly _diceParamsArray: Array<DiceParams>;
    private readonly _player: Player;
    private readonly _callback:
        | ((diceResults: Array<DiceResult>, player: Player) => void)
        | undefined;
    private readonly _deleteAfterSeconds: number;
    private readonly _timeoutSeconds: number;
    private readonly _position: Vector | [x: number, y: number, z: number];

    private readonly _diceObjIdToDiceResult: { [key: string]: DiceResult } = {};
    private readonly _activeDice: Set<Dice> = new Set<Dice>();

    private _timeoutHandle: timeout_handle | undefined;

    private readonly _onDiceRolledHandler = (
        player: Player,
        diceArray: Array<Dice>
    ): void => {
        for (const dice of diceArray) {
            const diceResult: DiceResult | undefined =
                this._diceObjIdToDiceResult[dice.getId()];
            if (!diceResult) {
                return; // not one of ours
            }
            const diceParams = diceResult.diceParams;
            const value = dice.getCurrentFaceIndex() + 1;

            diceResult.value = value;
            diceResult.hit =
                value >= (diceParams.hit ?? Number.MAX_SAFE_INTEGER);
            diceResult.crit =
                value >= (diceParams.crit ?? Number.MAX_SAFE_INTEGER);

            if (
                diceParams.reroll &&
                !diceResult.hit &&
                !diceResult.rerolledValue
            ) {
                diceResult.rerolledValue = value;
                dice.roll(player);
            } else {
                this._activeDice.delete(dice);
                if (this._activeDice.size === 0) {
                    this._sendResult();
                }
            }
        }
    };

    private readonly _onTimeoutHandler = (): void => {
        this._sendResult();
    };

    private readonly _onDeleteDiceHandler = (): void => {
        for (const diceResult of Object.values(this._diceObjIdToDiceResult)) {
            if (diceResult.dice && diceResult.dice.isValid()) {
                diceResult.dice.destroy();
            }
        }
    };

    private constructor(params: DiceGroupParams) {
        this._diceParamsArray = params.diceParams;
        this._player = params.player;
        this._callback = params.callback;
        this._deleteAfterSeconds =
            params.deleteAfterSeconds ?? DiceGroup.DEFAULT_DELETE_AFTER_SECONDS;
        this._timeoutSeconds =
            params.timeoutSeconds ?? DiceGroup.DEFAULT_TIMEOUT_SECONDS;
        this._position = params.position ?? [0, 0, 0];
    }

    fakeRoll(): void {
        let index = 0;
        for (const diceParams of this._diceParamsArray) {
            const diceResult: DiceResult = { diceParams, value: -1 };
            DiceGroup._setFakeValue(diceResult);
            const id = "dice" + index++;
            this._diceObjIdToDiceResult[id] = diceResult;
        }
        this._sendResult();
    }

    roll(): void {
        if (this._timeoutSeconds > 0) {
            this._timeoutHandle = setTimeout(
                this._onTimeoutHandler,
                this._timeoutSeconds * 1000
            );
        }

        // Delete dice after time.
        if (this._deleteAfterSeconds > 0) {
            setTimeout(
                this._onDeleteDiceHandler,
                this._deleteAfterSeconds * 1000
            );
        }

        // Listen for results, do rerolls.
        globalEvents.onDiceRolled.add(this._onDiceRolledHandler);

        // Create dice.  Wait to roll until after all dice registered.
        const z = world.getTableHeight() + 2;
        for (let i = 0; i < this._diceParamsArray.length; i++) {
            const diceParams: DiceParams | undefined = this._diceParamsArray[i];
            if (diceParams) {
                const phi = (i / this._diceParamsArray.length) * Math.PI * 2;
                const r = this._diceParamsArray.length * 0.3;
                const pos = new Vector(Math.cos(phi) * r, Math.sin(phi) * r, z);
                const dice: Dice = DiceGroup._createDice(diceParams, pos);
                this._diceObjIdToDiceResult[dice.getId()] = {
                    diceParams,
                    dice,
                    value: -1,
                };
                this._activeDice.add(dice);
            }
        }

        // Now that all dice are registered, roll.
        for (const dice of this._activeDice) {
            dice.roll(this._player);
        }
    }

    _sendResult(): void {
        // Clear listeners.
        if (this._timeoutHandle) {
            clearTimeout(this._timeoutHandle);
            this._timeoutHandle = undefined;
        }
        globalEvents.onDiceRolled.remove(this._onDiceRolledHandler);

        // If any dice did not finish (e.g. timeout) use a fake value.
        const diceResults: Array<DiceResult> = Object.values(
            this._diceObjIdToDiceResult
        );
        for (const diceResult of diceResults) {
            if (diceResult.dice && this._activeDice.has(diceResult.dice)) {
                DiceGroup._setFakeValue(diceResult);
            }
        }

        // Tell listeners.
        if (this._callback) {
            this._callback(diceResults, this._player);
        }
    }

    static _setFakeValue(diceResult: DiceResult): void {
        const diceParams: DiceParams = diceResult.diceParams;

        // Roll.
        let faceIndex = Math.floor(Math.random() * diceParams.sides);
        diceResult.value = faceIndex + 1;

        // Maybe reroll.
        if (
            diceParams.reroll !== undefined &&
            diceParams.hit !== undefined &&
            diceResult.value < diceParams.hit
        ) {
            diceResult.rerolledValue = diceResult.value;
            faceIndex = Math.floor(Math.random() * diceParams.sides);
            diceResult.value = faceIndex + 1;
        }

        // Create result record.
        diceResult.hit =
            diceResult.value >= (diceParams.hit ?? Number.MAX_SAFE_INTEGER);
        diceResult.crit =
            diceResult.value >= (diceParams.crit ?? Number.MAX_SAFE_INTEGER);
    }

    static _createDice(
        diceParams: DiceParams,
        position: Vector | [x: number, y: number, z: number]
    ): Dice {
        // Create dice.
        let templateId: string;
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
            default:
                throw new Error(`invalid sides: "${diceParams.sides}"`);
        }
        const dice: GameObject | undefined = world.createObjectFromTemplate(
            templateId,
            position
        );
        if (!dice) {
            throw new Error(
                `created failed for d${diceParams.sides} (${templateId})`
            );
        }
        if (!(dice instanceof Dice)) {
            throw new Error(
                `not Dice for d${diceParams.sides} (${templateId})`
            );
        }

        // Apply settings.
        const id: string =
            diceParams.id && diceParams.id.length > 0
                ? diceParams.id
                : "dice-group-die";
        dice.setSavedData(id, DICE_GROUP_SAVED_DATA_KEY);
        if (diceParams.primaryColor) {
            dice.setPrimaryColor(diceParams.primaryColor);
        }
        if (diceParams.secondaryColor) {
            dice.setSecondaryColor(diceParams.secondaryColor);
        }
        if (diceParams.name) {
            dice.setName(diceParams.name);
        }

        return dice;
    }
}
