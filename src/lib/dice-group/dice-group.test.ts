import { MockDice, MockPlayer, mockWorld } from "ttpg-mock";
import {
    DICE_GROUP_SAVED_DATA_KEY,
    DiceGroup,
    DiceGroupCleanup,
    DiceResult,
} from "./dice-group";
import { Player } from "@tabletop-playground/api";

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

    expect(diceYes.getSavedData(DICE_GROUP_SAVED_DATA_KEY)).toEqual(value);
    expect(diceYes.isValid()).toBeTruthy();
    expect(diceNo.isValid()).toBeTruthy();

    new DiceGroupCleanup().init();

    expect(diceYes.isValid()).toBeFalsy();
    expect(diceNo.isValid()).toBeTruthy();
});

it("fakeRoll (empty)", () => {
    let eventCount = 0;
    let diceCount = 0;
    const callback = (diceResults: DiceResult[], player: Player): void => {
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
