import { NamespaceId } from "./namespace-id";

it("usage", () => {
    const namespaceId: NamespaceId = "@test/test";
    expect(namespaceId).toEqual("@test/test");
});
