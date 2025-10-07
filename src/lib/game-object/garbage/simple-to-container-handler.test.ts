import { MockContainer, MockGameObject, mockWorld } from "ttpg-mock";
import { SimpleToContainerHandler } from "./simple-to-container-handler";

it("constructor", () => {
    new SimpleToContainerHandler();
});

it("canRecycleObj", () => {
    const objNsid = "my-obj-nsid";
    const yesObj = new MockGameObject({ templateMetadata: objNsid });
    const noObj = new MockGameObject({ templateMetadata: "mismatch" });

    const stch = new SimpleToContainerHandler().addRecycleObjectNsid(objNsid);

    expect(stch.canRecycle(yesObj, undefined)).toBeTruthy();
    expect(stch.canRecycle(noObj, undefined)).toBeFalsy();
});

it("recycle", () => {
    const objNsid = "my-obj-nsid";
    const containerNsid = "my-container-nsid";

    const obj = new MockGameObject({ templateMetadata: objNsid });
    const container = new MockContainer({ templateMetadata: containerNsid });

    const stch = new SimpleToContainerHandler()
        .addRecycleObjectNsid(objNsid)
        .setContainerNsid(containerNsid)
        .setRequireOwningPlayerSlot(true);

    mockWorld._reset({ gameObjects: [obj, container] });

    expect(obj.getContainer()).toBeUndefined();
    expect(stch.recycle(obj, undefined)).toBeTruthy();
    expect(obj.getContainer()).toEqual(container);

    mockWorld._reset();
});

it("recycle (missing container)", () => {
    const objNsid = "my-obj-nsid";
    const containerNsid = "my-container-nsid";

    const obj = new MockGameObject({ templateMetadata: objNsid });

    const stch = new SimpleToContainerHandler()
        .addRecycleObjectNsid(objNsid)
        .setContainerNsid(containerNsid);

    mockWorld._reset({ gameObjects: [obj] });

    expect(obj.getContainer()).toBeUndefined();
    expect(stch.recycle(obj, undefined)).toBeFalsy();

    mockWorld._reset();
});
