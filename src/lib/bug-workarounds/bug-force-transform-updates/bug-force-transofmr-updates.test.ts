import { MockGameObject } from "ttpg-mock";
import { BugForceTransformUpdates, DELTA } from "./bug-force-transform-updates"; // replace with your class's path

it("poke", () => {
    const bugForceTransformUpdatesMock = new BugForceTransformUpdates();
    const obj = new MockGameObject();
    const x = obj.getPosition().x;

    bugForceTransformUpdatesMock._maybeStartPoking(obj);

    bugForceTransformUpdatesMock.pokeAll();
    expect(obj.getPosition().x).toBe(x + DELTA);

    bugForceTransformUpdatesMock.pokeAll();
    expect(obj.getPosition().x).toBe(x);

    bugForceTransformUpdatesMock.pokeAll();
    expect(obj.getPosition().x).toBe(x + DELTA);

    bugForceTransformUpdatesMock.pokeAll();
    expect(obj.getPosition().x).toBe(x);

    // No longer poking.
    bugForceTransformUpdatesMock.pokeAll();
    expect(obj.getPosition().x).toBe(x);
    bugForceTransformUpdatesMock.pokeAll();
    expect(obj.getPosition().x).toBe(x);
    bugForceTransformUpdatesMock.pokeAll();
    expect(obj.getPosition().x).toBe(x);
});
