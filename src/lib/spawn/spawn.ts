import {
    Card,
    GameObject,
    Rotator,
    Vector,
    world,
} from "@tabletop-playground/api";

/**
 * Registry for NSID to template id.
 */
export class Spawn {
    private _nsidToTemplateId: { [key: string]: string } = {};

    spawn(
        nsid: string,
        position?: Vector | [x: number, y: number, z: number],
        rotation?: Rotator | [pitch: number, yaw: number, roll: number]
    ): GameObject | undefined {
        const templateId = this._nsidToTemplateId[nsid];
        if (!templateId) {
            console.log(`Spawn.spawn: unknown nsid "${nsid}"`);
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

    spawnOrThrow(
        nsid: string,
        position?: Vector | [x: number, y: number, z: number],
        rotation?: Rotator | [pitch: number, yaw: number, roll: number]
    ): GameObject {
        const obj: GameObject | undefined = this.spawn(
            nsid,
            position,
            rotation
        );
        if (!obj) {
            throw new Error(`spawnOrThrow failed for "${nsid}"`);
        }
        return obj;
    }

    spawnMergeDecksWithNsidPrefixOrThrow(
        nsidPrefix: string,
        position?: Vector | [x: number, y: number, z: number],
        rotation?: Rotator | [pitch: number, yaw: number, roll: number]
    ): Card {
        const nsids: Array<string> = this.getAllNsids().filter((nsid) =>
            nsid.startsWith(nsidPrefix)
        );
        if (nsids.length === 0) {
            throw new Error(
                `spawnMergeDecksWithNsidPrefixOrThrow failed for prefix "${nsidPrefix}": no matching nsids`
            );
        }
        return this.spawnMergeDecksOrThrow(nsids, position, rotation);
    }

    spawnMergeDecks(
        nsids: Array<string>,
        position?: Vector | [x: number, y: number, z: number],
        rotation?: Rotator | [pitch: number, yaw: number, roll: number]
    ): Card | undefined {
        if (nsids.length === 0) {
            console.log("Spawn.spawnMergeDecks: empty nsid array");
            return undefined;
        }

        let deck: Card | undefined;
        for (const nsid of nsids) {
            const obj: GameObject | undefined = this.spawn(
                nsid,
                position,
                rotation
            );

            // If any object fails, fail the whole spawn.
            if (!obj) {
                console.log(`Spawn.spawnMergeDecks: unknown nsid "${nsid}"`);
                if (deck) {
                    deck.destroy();
                }
                return undefined;
            }

            if (!(obj instanceof Card)) {
                console.log(`Spawn.spawnMergeDecks: nsid "${nsid}" not a Card`);
                if (deck) {
                    deck.destroy();
                }
                return undefined;
            }

            if (deck) {
                const success: boolean = deck.addCards(obj);
                if (!success) {
                    console.log(
                        `Spawn.spawnMergeDecks: nsid "${nsid}" failed to merge with existing deck (wrong size?)`
                    );
                    if (deck) {
                        deck.destroy();
                    }
                    return undefined;
                }
            } else {
                deck = obj;
            }
        }
        return deck;
    }

    spawnMergeDecksOrThrow(
        nsids: Array<string>,
        position?: Vector | [x: number, y: number, z: number],
        rotation?: Rotator | [pitch: number, yaw: number, roll: number]
    ): Card {
        const obj: Card | undefined = this.spawnMergeDecks(
            nsids,
            position,
            rotation
        );
        if (!obj) {
            throw new Error(
                `spawnMergeDecksOrThrow failed for [${nsids.join(", ")}]`
            );
        }
        return obj;
    }

    inject(dict: { [key: string]: string }): this {
        for (const [k, v] of Object.entries(dict)) {
            this._nsidToTemplateId[k] = v;
        }
        return this;
    }

    has(nsid: string): boolean {
        return this._nsidToTemplateId[nsid] ? true : false;
    }

    clear(): this {
        this._nsidToTemplateId = {};
        return this;
    }

    getAllNsids(): Array<string> {
        return Object.keys(this._nsidToTemplateId);
    }

    getTemplateIdOrThrow(nsid: string): string {
        const templateId = this._nsidToTemplateId[nsid];
        if (!templateId) {
            throw new Error(`getTemplateIdOrThrow failed for "${nsid}"`);
        }
        return templateId;
    }

    /**
     * Make sure all registered templates exist.
     */
    validate(): this {
        const templateIds = new Set();
        for (const pkg of world.getAllowedPackages()) {
            for (const templateId of pkg.getTemplateIds()) {
                templateIds.add(templateId);
            }
        }

        const missing: Array<string> = [];
        for (const [nsid, templateId] of Object.entries(
            this._nsidToTemplateId
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
        return this;
    }
}
