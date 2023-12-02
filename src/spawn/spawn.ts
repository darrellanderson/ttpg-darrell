import { GameObject, Vector, world } from "@tabletop-playground/api";

/**
 * Registry for NSID to template id.
 */
export abstract class Spawn {
  private static _nsidToTemplateId: { [key: string]: string } = {};

  static spawn(
    nsid: string,
    position: Vector | [x: number, y: number, z: number]
  ): GameObject | undefined {
    const templateId = Spawn._nsidToTemplateId[nsid];
    if (!templateId) {
      return undefined;
    }
    const obj = world.createObjectFromTemplate(templateId, position);
    return obj;
  }

  static spawnOrThrow(
    nsid: string,
    position: Vector | [x: number, y: number, z: number]
  ): GameObject {
    const obj: GameObject | undefined = Spawn.spawn(nsid, position);
    if (!obj) {
      throw new Error(`spawnOrThrow failed for "${nsid}"`);
    }
    return obj;
  }

  static inject(dict: { [key: string]: string }) {
    for (const [k, v] of Object.entries(dict)) {
      Spawn._nsidToTemplateId[k] = v;
    }
  }

  static validate() {
    const templateIds = new Set();
    for (const pkg of world.getAllowedPackages()) {
      for (const templateId of pkg.getTemplateIds()) {
        templateIds.add(templateId);
      }
    }

    const missing = [];
    for (const [nsid, templateId] of Object.entries(Spawn._nsidToTemplateId)) {
      if (!templateIds.has(templateId)) {
        missing.push(`${templateId} ("${nsid}")`);
      }
    }
    if (missing.length > 0) {
      throw new Error(
        `Spawn.validate missing templateIds (${missing.length}):\n` +
          missing.join("\n")
      );
    }
  }
}
