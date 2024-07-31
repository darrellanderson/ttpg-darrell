import { MockGameObject } from "ttpg-mock";
import { BugForceTransformUpdates, DELTA } from "./bug-force-transform-updates";

it("poke", () => {
    const bugForceTransformUpdatesMock = new BugForceTransformUpdates();
    const obj = new MockGameObject();
    const x = obj.getPosition().x;
    const yaw = obj.getRotation().yaw;

    bugForceTransformUpdatesMock._maybeStartPoking(obj);

    bugForceTransformUpdatesMock.pokeAll();
    expect(obj.getPosition().x).toBe(x + DELTA);
    expect(obj.getRotation().yaw).toBe(yaw + DELTA);

    bugForceTransformUpdatesMock.pokeAll();
    expect(obj.getPosition().x).toBe(x);
    expect(obj.getRotation().yaw).toBe(yaw);

    bugForceTransformUpdatesMock.pokeAll();
    expect(obj.getPosition().x).toBe(x + DELTA);
    expect(obj.getRotation().yaw).toBe(yaw + DELTA);

    bugForceTransformUpdatesMock.pokeAll();
    expect(obj.getPosition().x).toBe(x);
    expect(obj.getRotation().yaw).toBe(yaw);

    // No longer poking.
    bugForceTransformUpdatesMock.pokeAll();
    expect(obj.getPosition().x).toBe(x);
    expect(obj.getRotation().yaw).toBe(yaw);
    bugForceTransformUpdatesMock.pokeAll();
    expect(obj.getPosition().x).toBe(x);
    expect(obj.getRotation().yaw).toBe(yaw);
    bugForceTransformUpdatesMock.pokeAll();
    expect(obj.getPosition().x).toBe(x);
    expect(obj.getRotation().yaw).toBe(yaw);
});
