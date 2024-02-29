#!env ts-node

/**
 * Create map from template metadata ("NSID") to template id.
 *
 * ARGS:
 * -i : path to assets/Templates dir
 * -o : path to src/out.json file
 * -f : overwrite any existing output file
 */

import * as fs from "fs-extra";
import klawSync from "klaw-sync"; // walk file system
import * as path from "path";
import * as yargs from "yargs";

const args = yargs
    .options({
        i: {
            alias: "input",
            descript: "input directory",
            type: "string",
            demand: true,
        },
        o: {
            alias: "output",
            descript: "output file (JSON)",
            type: "string",
            demand: true,
        },
        f: {
            alias: "force",
            descript: "overwrite any existing output file?",
            type: "boolean",
        },
    })
    .parseSync(); // creates typed result

async function main() {
    const root = path.resolve(args.i);
    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory) {
        throw new Error(`missing (-i) template directory "${root}"`);
    }

    // ------------------------------------
    console.log("\n----- LOCATING TEMPLATE JSON FILES -----\n");

    console.log(`scanning "${root}"`);
    const jsonFilenames = klawSync(root, {
        filter: (item) => path.extname(item.path) === ".json",
        nodir: true,
        traverseAll: true,
    }).map((item) => item.path);

    // Extract NSID -> templateId
    const nsidToTemplateId: { [key: string]: string } = {};

    // Restrict to templates.
    for (const jsonFilename of jsonFilenames) {
        const json = fs.readJSONSync(jsonFilename);
        const templateId = json.GUID;
        let nsid = json.Metadata;

        // Reject if missing a root level key (not a template file?).
        if (typeof templateId !== "string") {
            console.log(`rejecting no GUID: "${jsonFilename}"`);
            continue;
        }
        if (typeof nsid !== "string") {
            console.log(`rejecting no metadata: "${jsonFilename}"`);
            continue;
        }

        // Include decks as a "*" named NSID.
        if (json.Type === "Card" && typeof json.CardMetadata === "object") {
            // Require all cards share the same prefix.
            const cardNsids: string[] = Object.values(json.CardMetadata);
            if (cardNsids.length === 1 && (cardNsids[0]?.length ?? 0) > 0) {
                const newNsid = cardNsids[0];
                if (nsid !== newNsid) {
                    console.log(
                        `REPLACING SINGLETON "${nsid}" with "${newNsid}" (${jsonFilename})`
                    );
                    nsid = newNsid;
                }
            } else if (cardNsids.length > 1) {
                const getPrefix = (items: string[]): string => {
                    const first: string = items[0] ?? "";
                    const firstParts: string[] = first.split(".");

                    // Get longest dot-delimited matching type.
                    let matchingPartsCount = firstParts.length;
                    for (const item of items) {
                        const parts: string[] = item.split(".");
                        for (let i = 0; i < parts.length; i++) {
                            if (parts[i] !== firstParts[i]) {
                                matchingPartsCount = Math.min(
                                    matchingPartsCount,
                                    i
                                );
                                break;
                            }
                        }
                    }
                    return firstParts.slice(0, matchingPartsCount).join(".");
                };

                // Use a common prefix (matching to a dot-delimited string).
                const types: string[] = cardNsids.map((cardNsid) => {
                    const m = cardNsid.match("([^:]+):([^/]+)/.+");
                    return m?.[1] ?? "";
                });
                const type = getPrefix(types);

                const sources: string[] = cardNsids.map((cardNsid): string => {
                    const m = cardNsid.match("([^:]+):([^/]+)/.+");
                    return m?.[2] ?? "";
                });
                const source = getPrefix(sources);

                const newNsid = `${type}:${source}/*`;
                if (nsid !== newNsid) {
                    console.log(
                        `REPLACING DECK "${nsid}" with "${newNsid}" (${jsonFilename})`
                    );
                    nsid = newNsid;
                }
            }
        }

        if (!nsid.match("[^:]+:[^/]+/.+")) {
            // Reject metadata does not look like NSID.
            console.log(`rejecting not nsid: "${jsonFilename}" ("${nsid}")`);
            continue;
        }

        console.log(`accepting "${jsonFilename}"`);
        if (nsidToTemplateId[nsid]) {
            throw new Error(`Duplicate NSID "${nsid}"`);
        }
        nsidToTemplateId[nsid] = templateId;
    }

    const data =
        JSON.stringify(
            nsidToTemplateId,
            Object.keys(nsidToTemplateId).sort(),
            4
        ) + "\n";
    fs.writeFileSync(args.o, data);
}

main();
