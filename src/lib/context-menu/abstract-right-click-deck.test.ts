import { GameObject, Player } from "@tabletop-playground/api";
import { AbstractRightClickDeck } from "./abstract-right-click-deck";

it("constructor", () => {
    class MyClass extends AbstractRightClickDeck {}

    const deckNsidPrefix = "my-nsid";
    const customActionName = "* My action";
    const customActionHandler = (
        object: GameObject,
        player: Player,
        identifier: string
    ) => {};
    new MyClass(deckNsidPrefix, customActionName, customActionHandler);
});
