import { MockPackage, mockWorld } from "ttpg-mock";
import { Spawn } from "./spawn";

it("spawn", () => {
  const nsid = "my-nsid";
  const templateId = "my-template-id";
  const metadata = "my-metadata";
  mockWorld._reset({
    _templateIdToMockGameObjectParams: {
      [templateId]: { templateMetadata: metadata },
    },
  });

  Spawn.inject({ [nsid]: templateId });
  const obj = Spawn.spawn(nsid, [0, 0, 0]);
  expect(obj?.getTemplateMetadata()).toEqual(metadata);

  mockWorld._reset();
});

it("validate", () => {
  const nsid = "my-nsid";
  const templateId = "my-template-id";
  Spawn.inject({ [nsid]: templateId });

  // Spawn knows about the template id, but world does not.
  expect(() => {
    Spawn.validate();
  }).toThrow();

  // Tell world about template id.
  mockWorld._reset({
    packages: [new MockPackage({ templateIds: [templateId] })],
  });
  Spawn.validate(); // good!

  mockWorld._reset();
});
