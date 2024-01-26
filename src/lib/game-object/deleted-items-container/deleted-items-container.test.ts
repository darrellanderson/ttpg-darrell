import { Container } from "@tabletop-playground/api";
import { MockContainer } from "ttpg-mock";
import { DeletedItemsContainer } from "./deleted-items-container";

it("constructor", () => {
    const container: Container = new MockContainer();
    new DeletedItemsContainer(container);
});
