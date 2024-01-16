import { world } from "@tabletop-playground/api";
import { Vault } from "./vault";

it("constructor", () => {
    new Vault();
});

it("set/get/delete", () => {
    const dataId = "my-data-id";
    const data = "my test data";
    const vault = new Vault();
    expect(world.getAllObjects().length).toEqual(1);

    vault.set(dataId, data);

    let output = vault.get(dataId);
    expect(output).toBe(data);
    expect(world.getAllObjects().length).toEqual(2);

    vault.delete(dataId);
    output = vault.get(dataId);
    expect(output).toBeUndefined();
    expect(world.getAllObjects().length).toEqual(1);
});

it("long data", () => {
    const dataId = "my-data-id";
    const data = new Array(4096).fill("x").join("") + "y";
    expect(data.length).toEqual(4097);

    const vault = new Vault();

    vault.set(dataId, data);

    let output = vault.get(dataId);
    expect(output).toBe(data);
    expect(world.getAllObjects().length).toEqual(2);

    vault.delete(dataId);
    expect(world.getAllObjects().length).toEqual(1);
});

it("fill store", () => {
    const vault = new Vault();
    expect(world.getAllObjects().length).toEqual(1);

    const n = 400;
    for (let i = 0; i < n; i++) {
        vault.set("id" + i, "data" + i);
    }
    for (let i = 0; i < n; i++) {
        const data = vault.get("id" + i);
        expect(data).toEqual("data" + i);
    }
    // ceil(n / BLOCKS_PER_OBJ)
    expect(world.getAllObjects().length).toEqual(7);

    for (let i = 0; i < n; i++) {
        vault.delete("id" + i);
    }
    expect(world.getAllObjects().length).toEqual(1);
});
