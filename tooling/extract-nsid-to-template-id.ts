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
import klawSync, * as klaw from "klaw-sync"; // walk file system
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
      descript: "overwrite any existign output file?",
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
      if (cardNsids.length === 1 && cardNsids[0].length > 0) {
        const newNsid = cardNsids[0];
        if (nsid !== newNsid) {
          console.log(
            `REPLACING SINGLETON "${nsid}" with "${newNsid}" (${jsonFilename})`
          );
          nsid = newNsid;
        }
      } else if (cardNsids.length > 1) {
        const prefixes = cardNsids.map((cardNsid) => {
          const m = cardNsids[0].match("([^:]+:[^/]+)/.+");
          return m ? m[1] : undefined;
        });
        const firstPrefix: string | undefined = prefixes[0];
        let allMatch: boolean = true;
        for (const prefix of prefixes) {
          if (prefix !== firstPrefix) {
            allMatch = false;
          }
        }
        if (firstPrefix && allMatch) {
          const newNsid = `${firstPrefix}/*`;
          if (nsid !== newNsid) {
            console.log(
              `REPLACING DECK "${nsid}" with "${newNsid}" (${jsonFilename})`
            );
            nsid = newNsid;
          }
        }
        if (firstPrefix && !allMatch) {
          console.warn(
            `WARNING: DECK METADATA MISMATCH [${cardNsids.join(", ")}]`
          );
        }
      }
    }

    if (!nsid.match("[^:]+:[^/]+/.+")) {
      // Reject metadata does not look like NSID.
      console.log(`rejecting not nsid: "${jsonFilename}" ("${nsid}")`);
      continue;
    }

    console.log(`accepting "${jsonFilename}"`);
    nsidToTemplateId[nsid] = templateId;
  }

  console.log(JSON.stringify(nsidToTemplateId, undefined, 4));
}

main();
