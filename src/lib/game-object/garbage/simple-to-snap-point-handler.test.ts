import { MockGameObject, MockSnapPoint, mockWorld } from "ttpg-mock";
import { SimpleToSnapPointHandler } from "./simple-to-snap-point-handler";

it("constructor", () => {
    new SimpleToSnapPointHandler();
});

it("canRecycleObj", () => {
    const objNsid = "my-obj-nsid";
    const yesObj = new MockGameObject({ templateMetadata: objNsid });
    const noObj = new MockGameObject({ templateMetadata: "mismatch" });

    const stsph = new SimpleToSnapPointHandler().addRecycleObjectNsid(objNsid);

    expect(stsph.canRecycle(yesObj)).toBeTruthy();
    expect(stsph.canRecycle(noObj)).toBeFalsy();
});

it("recycle", () => {
    const objNsid = "my-obj-nsid";
    const snapPointTag = "my-snap-point-tag";

    const obj = new MockGameObject({ templateMetadata: objNsid });
    const snapPoint = new MockSnapPoint({ tags: [snapPointTag] });
    const mat = new MockGameObject({
        snapPoints: [snapPoint],
    });

    const stsph = new SimpleToSnapPointHandler()
        .addRecycleObjectNsid(objNsid)
        .setSnapPointTag(snapPointTag);

    mockWorld._reset({ gameObjects: [obj, mat] });

    expect(stsph.recycle(obj)).toBeTruthy();

    mockWorld._reset();
});
