import { MockDice } from "ttpg-mock";
import { DiceSnapRotation } from "./dice-snap-rotation";
import { Dice } from "@tabletop-playground/api";

it("constructor", () => {
    const dice: Dice = new MockDice();
    new DiceSnapRotation(dice);
});
