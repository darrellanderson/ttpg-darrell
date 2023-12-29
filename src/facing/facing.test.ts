import { Card, GameObject } from "@tabletop-playground/api";
import { MockCard, MockGameObject } from "ttpg-mock";
import { Facing } from "./facing";

it("card", () => {
  const cardUp: Card = new MockCard({
    isFaceUp: true,
  });
  expect(Facing.isFaceUp(cardUp)).toBeTruthy();

  const cardDown: Card = new MockCard({
    isFaceUp: false,
  });
  expect(Facing.isFaceUp(cardDown)).toBeFalsy();
});

it("generic", () => {
  const objUp: GameObject = new MockGameObject({ rotation: [0, 0, 0] });
  expect(Facing.isFaceUp(objUp)).toBeTruthy();

  const objDownPitch: GameObject = new MockGameObject({
    rotation: [180, 0, 0],
  });
  expect(Facing.isFaceUp(objDownPitch)).toBeFalsy();

  const objDownRoll: GameObject = new MockGameObject({ rotation: [0, 0, 180] });
  expect(Facing.isFaceUp(objDownRoll)).toBeFalsy();
});
