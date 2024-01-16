import { world } from "@tabletop-playground/api";
import { DataStore } from "./data-store";

it("constructor", () => {
    new DataStore("test");
});

it("set/get/delete", () => {
    const dataId = "my-data-id";
    const data = "my test data";
    const dataStore = new DataStore("test");
    expect(world.getAllObjects().length).toEqual(1);

    dataStore.set(dataId, data);

    let output = dataStore.get(dataId);
    expect(output).toBe(data);
    expect(world.getAllObjects().length).toEqual(2);

    dataStore.delete(dataId);
    output = dataStore.get(dataId);
    expect(output).toBeUndefined();
    expect(world.getAllObjects().length).toEqual(1);
});

it("long data", () => {
    const dataId = "my-data-id";
    const data = new Array(4096).fill("x").join("") + "y";
    expect(data.length).toEqual(4097);

    const dataStore = new DataStore("test");

    dataStore.set(dataId, data);

    let output = dataStore.get(dataId);
    expect(output).toBe(data);
    expect(world.getAllObjects().length).toEqual(2);

    dataStore.delete(dataId);
    expect(world.getAllObjects().length).toEqual(1);
});

it("fill store", () => {
    const dataStore = new DataStore("test");
    expect(world.getAllObjects().length).toEqual(1);

    const n = 400;
    for (let i = 0; i < n; i++) {
        dataStore.set("id" + i, "data" + i);
    }
    for (let i = 0; i < n; i++) {
        const data = dataStore.get("id" + i);
        expect(data).toEqual("data" + i);
    }
    // ceil(n / BLOCKS_PER_OBJ)
    expect(world.getAllObjects().length).toEqual(7);

    for (let i = 0; i < n; i++) {
        dataStore.delete("id" + i);
    }
    expect(world.getAllObjects().length).toEqual(1);
});

it("same key finds existing store", () => {
    const dataId = "my-data-id";
    const data = "my test data";

    let dataStore = new DataStore("test");
    dataStore.set(dataId, data);
    let output = dataStore.get(dataId);
    expect(output).toBe(data);

    dataStore = new DataStore("test");
    output = dataStore.get(dataId);
    expect(output).toBe(data);

    dataStore = new DataStore("not-test");
    output = dataStore.get(dataId);
    expect(output).toBeUndefined();
});
