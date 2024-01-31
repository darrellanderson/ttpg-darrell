import {
    MockDice,
    MockGameObject,
    MockPlayer,
    globalEvents,
    mockWorld,
} from "ttpg-mock";
import {
    DICE_GROUP_SAVED_DATA_KEY,
    DiceGroup,
    DiceGroupCleanup,
    DiceParams,
    DiceResult,
} from "./dice-group";
import { Player } from "@tabletop-playground/api";

it("format", () => {
    const diceParams: DiceParams = { sides: 10 };
    const diceResult: DiceResult = { diceParams, value: 7 };
    expect(DiceGroup.format(diceResult)).toEqual("7");

    diceResult.hit = true;
    expect(DiceGroup.format(diceResult)).toEqual("7#");

    diceResult.crit = true;
    expect(DiceGroup.format(diceResult)).toEqual("7##");

    diceParams.critCount = 2;
    expect(DiceGroup.format(diceResult)).toEqual("7###");

    diceResult.rerolledValue = 5;
    expect(DiceGroup.format(diceResult)).toEqual("5->7###");
});

it("constructor", () => {
    const player = new MockPlayer();
    DiceGroup.roll({
        diceParams: [],
        player,
        doFakeRoll: true,
    });
});

it("cleanup", () => {
    const value = "my-id";
    const diceYes = new MockDice({
        savedData: { [DICE_GROUP_SAVED_DATA_KEY]: value },
    });
    const diceNo = new MockDice({});
    const objNo = new MockGameObject();

    expect(diceYes.getSavedData(DICE_GROUP_SAVED_DATA_KEY)).toEqual(value);
    expect(diceYes.isValid()).toBeTruthy();
    expect(diceNo.isValid()).toBeTruthy();
    expect(objNo.isValid()).toBeTruthy();

    new DiceGroupCleanup().init();

    expect(diceYes.isValid()).toBeFalsy();
    expect(diceNo.isValid()).toBeTruthy();
    expect(objNo.isValid()).toBeTruthy();
});

it("fakeRoll (empty)", () => {
    let eventCount = 0;
    let diceCount = 0;
    const callback = (diceResults: DiceResult[]): void => {
        eventCount += 1;
        diceCount += diceResults.length;
    };

    const player = new MockPlayer();
    DiceGroup.roll({
        diceParams: [],
        player,
        callback,
        doFakeRoll: true,
    });
    expect(eventCount).toEqual(1);
    expect(diceCount).toEqual(0);
});

it("fakeRoll", () => {
    let eventCount = 0;
    let diceCount = 0;
    let rerolledCount = 0;
    let hitCount = 0;
    let critCount = 0;
    let rollingPlayer: Player | undefined;
    const callback = (diceResults: DiceResult[], player: Player): void => {
        eventCount += 1;
        diceCount += diceResults.length;
        for (const diceResult of diceResults) {
            if (diceResult.rerolledValue !== undefined) {
                rerolledCount += 1;
            }
            if (diceResult.hit) {
                hitCount += 1;
            }
            if (diceResult.crit) {
                critCount += 1;
            }
        }
        rollingPlayer = player;
    };

    const player = new MockPlayer();
    DiceGroup.roll({
        diceParams: [
            { sides: 10, hit: 11, reroll: true }, // hit larger than max guarantee reroll
            { sides: 10, hit: 11, reroll: true }, // hit larger than max guarantee reroll
            { sides: 10, hit: 0, crit: 0, reroll: true }, // hit zero guarantee hit
        ],
        player,
        callback,
        doFakeRoll: true,
    });

    expect(eventCount).toEqual(1);
    expect(diceCount).toEqual(3);
    expect(rerolledCount).toEqual(2);
    expect(hitCount).toEqual(1);
    expect(critCount).toEqual(1);
    expect(rollingPlayer).toEqual(player);
});

it("roll (empty)", () => {
    const player = new MockPlayer();
    DiceGroup.roll({
        diceParams: [],
        player,
        timeoutSeconds: -1,
        deleteAfterSeconds: -1,
    });
});

it("roll", () => {
    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            "9065AC5141F87F8ADE1F5AB6390BBEE4": { _objType: "Dice" },
        },
    });

    let genericDiceEventCount = 0;
    globalEvents.onDiceRolled.add(() => {
        genericDiceEventCount++;
    });

    let eventCount = 0;
    let diceCount = 0;
    let rerolledCount = 0;
    let hitCount = 0;
    let critCount = 0;
    const callback = (diceResults: DiceResult[]): void => {
        eventCount += 1;
        diceCount += diceResults.length;
        for (const diceResult of diceResults) {
            if (diceResult.rerolledValue !== undefined) {
                rerolledCount += 1;
            }
            if (diceResult.hit) {
                hitCount += 1;
            }
            if (diceResult.crit) {
                critCount += 1;
            }
        }
    };

    const player = new MockPlayer();
    DiceGroup.roll({
        diceParams: [
            { sides: 10, hit: 11, reroll: true }, // hit larger than max guarantee reroll
            { sides: 10, hit: 11, reroll: true }, // hit larger than max guarantee reroll
            { sides: 10, hit: 0, crit: 0, reroll: true }, // hit zero guarantee hit
        ],
        player,
        timeoutSeconds: -1,
        deleteAfterSeconds: -1,
        callback,
    });

    expect(genericDiceEventCount).toEqual(5); // 3 + 2 rerolls
    expect(eventCount).toEqual(1);
    expect(diceCount).toEqual(3);
    expect(rerolledCount).toEqual(2);
    expect(hitCount).toEqual(1);
    expect(critCount).toEqual(1);
});

it("unmanaged dice rolled", () => {
    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            "9065AC5141F87F8ADE1F5AB6390BBEE4": { _objType: "Dice" },
        },
    });
    const player = new MockPlayer();

    // Roll a new die inside the generic handler,
    // the listener is still attached.
    let genericDiceEventCount = 0;
    globalEvents.onDiceRolled.add(() => {
        if (genericDiceEventCount++ === 0) {
            new MockDice().roll(player);
        }
    });

    DiceGroup.roll({
        diceParams: [
            { sides: 10, hit: 11, reroll: true }, // hit larger than max guarantee reroll
            { sides: 10, hit: 11, reroll: true }, // hit larger than max guarantee reroll
            { sides: 10, hit: 0, crit: 0, reroll: true }, // hit zero guarantee hit
        ],
        player,
        timeoutSeconds: 1,
        deleteAfterSeconds: -1,
    });

    expect(genericDiceEventCount).toEqual(6); // 3, 2 rerolls, 1 unmanaged dice
});

it("_createDice", () => {
    mockWorld._reset({
        _templateIdToMockGameObjectParams: {
            "1885447D4CF808B36797CFB1DD679BAC": { _objType: "Dice" },
        },
    });
    const dice = DiceGroup._createDice(
        {
            id: "my-id",
            sides: 4,
            primaryColor: [1, 0, 0, 1],
            secondaryColor: [0, 1, 0, 1],
            name: "my-name",
        },
        [0, 0, 0]
    );
    expect(dice.getSavedData(DICE_GROUP_SAVED_DATA_KEY)).toEqual("my-id");
    expect(dice.getPrimaryColor().toHex()).toEqual("FF0000FF");
    expect(dice.getSecondaryColor().toHex()).toEqual("00FF00FF");
    expect(dice.getName()).toEqual("my-name");
});
