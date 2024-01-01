import { GameObject, Rotator, Vector, world } from "@tabletop-playground/api";

/**
 * Registry for NSID to template id.
 */
export abstract class Spawn {
    private static _nsidToTemplateId: { [key: string]: string } = {};

    static spawn(
        nsid: string,
        position?: Vector | [x: number, y: number, z: number],
        rotation?: Rotator | [pitch: number, yaw: number, roll: number]
    ): GameObject | undefined {
        const templateId = Spawn._nsidToTemplateId[nsid];
        if (!templateId) {
            return undefined;
        }
        if (position === undefined) {
            position = [0, 0, 0];
        }
        if (rotation === undefined) {
            rotation = [0, 0, 0];
        }
        const obj = world.createObjectFromTemplate(templateId, position);
        if (obj) {
            const name = world.getTemplateName(templateId);
            obj.setName(name);
            obj.setRotation(rotation);
        }
        return obj;
    }

    static spawnOrThrow(
        nsid: string,
        position?: Vector | [x: number, y: number, z: number],
        rotation?: Rotator | [pitch: number, yaw: number, roll: number]
    ): GameObject {
        const obj: GameObject | undefined = Spawn.spawn(
            nsid,
            position,
            rotation
        );
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

    static has(nsid: string): boolean {
        return Spawn._nsidToTemplateId[nsid] ? true : false;
    }

    static clear() {
        Spawn._nsidToTemplateId = {};
    }

    static validate() {
        const templateIds = new Set();
        for (const pkg of world.getAllowedPackages()) {
            for (const templateId of pkg.getTemplateIds()) {
                templateIds.add(templateId);
            }
        }

        const missing = [];
        for (const [nsid, templateId] of Object.entries(
            Spawn._nsidToTemplateId
        )) {
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
