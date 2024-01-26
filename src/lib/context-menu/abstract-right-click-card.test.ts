import { GameObject, Player } from "@tabletop-playground/api";
import { AbstractRightClickCard } from "./abstract-right-click-card";

it("constructor", () => {
    class MyClass extends AbstractRightClickCard {}

    const cardNsid = "my-nsid";
    const customActionName = "* My action";
    const customActionHandler = (
        object: GameObject,
        player: Player,
        identifier: string
    ) => {};
    new MyClass(cardNsid, customActionName, customActionHandler);
});
