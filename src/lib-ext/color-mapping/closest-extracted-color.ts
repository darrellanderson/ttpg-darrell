import fs from "fs";

const data = [
    {
        colorName: "green", // TTS 007306
        hexColor: "#00C60A",
        variants: ["#5dc262", "#0c9113", "#82eb09", "#09eb67"],
    },
    {
        colorName: "red",
        hexColor: "#FF0505", //"#FF2417",
        variants: ["#ad5e5e", "#c02516", "#cf213e", "#ff6969"],
    },
    {
        colorName: "yellow",
        hexColor: "#FFD900", //"#FFDA00",
        variants: ["#fce979", "#a69317", "#d6bd4b", "#f6ff00"],
    },
    {
        colorName: "pink",
        hexColor: "#FF74D6", //"#FF84D6",
        variants: ["#edadd9", "#c21f90", "#bd2db0", "#de64b1"],
    },
    {
        colorName: "orange",
        hexColor: "#FF8C00", //"#FF932B",
        variants: ["#e09f5c", "#854300", "#ff6200", "#ffa600"],
    },
    {
        colorName: "purple", // TTS 7400B7
        hexColor: "#B252FF",
        variants: ["#af76cf", "#681d91", "#945ced", "#a600ff"],
    },
    {
        colorName: "blue", // TTS 07B2FF v
        hexColor: "#00CFFF", //"#07B2FF",
        variants: ["#6fd9f2", "#0e96b5", "#00ffea", "#0091ff"],
    },
    {
        colorName: "white",
        hexColor: "#F0F0F0", //"#BABABA",
        variants: ["#969696", "#4a4a4a", "#2c2c2e", "#2e2626"],
    },
];

// Array of 6-character hex strings.
const targetHexColors: Array<string> = [];
for (const entry of data) {
    targetHexColors.push(entry.hexColor);
    for (const variant of entry.variants) {
        targetHexColors.push(variant);
    }
}

// Raw file has [raw, slot, plastic, widget] colors as 6-char hex strings.
const rawFilename: string =
    "/Users/darrell/ttpg/ttpg-darrell/src/lib-ext/color-mapping/raw.txt";
const rawLines: Array<string> = fs
    .readFileSync(rawFilename)
    .toString()
    .split("\n")
    .filter((line) => {
        return line.length > 0 && !line.startsWith("#");
    });

type RGB = { r: number; g: number; b: number };
function rgbFromHex(hexColor: string): RGB {
    if (hexColor.startsWith("#")) {
        hexColor = hexColor.substring(1);
    }
    const r: number = Number.parseInt(hexColor.substring(0, 2), 16);
    const g: number = Number.parseInt(hexColor.substring(2, 4), 16);
    const b: number = Number.parseInt(hexColor.substring(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
        throw new Error(`bad hexColor "${hexColor}"`);
    }
    return { r, g, b };
}

function colorDistance(a: RGB, b: RGB): number {
    const dr = a.r - b.r;
    const dg = a.g - b.g;
    const db = a.b - b.b;
    return dr * dr + dg * dg + db * db;
}

function closest(targetHexColor: string): Record<string, string> {
    const targetRGB: RGB = rgbFromHex(targetHexColor);

    // Best "raw" value for each color type.
    let bestSlotRaw: string = "";
    let bestSlotCooked: string = "";
    let bestSlotD: number = Number.MAX_SAFE_INTEGER;

    let bestPlasticRaw: string = "";
    let bestPlasticCooked: string = "";
    let bestPlasticD: number = Number.MAX_SAFE_INTEGER;

    let bestWidgetRaw: string = "";
    let bestWidgetCooked: string = "";
    let bestWidgetD: number = Number.MAX_SAFE_INTEGER;

    for (const rawLine of rawLines) {
        const parts = rawLine.split(" ");
        if (parts.length !== 4) {
            throw new Error(`bad raw entry: "${rawLine}"`);
        }

        const rawHex: string = "#" + parts[0]!;
        const slotHex: string = "#" + parts[1]!;
        const plasticHex: string = "#" + parts[2]!;
        const widgetHex: string = "#" + parts[3]!;

        const slotRGB: RGB = rgbFromHex(slotHex);
        const plasticRGB: RGB = rgbFromHex(plasticHex);
        const widgetRGB: RGB = rgbFromHex(widgetHex);

        let d: number;
        d = colorDistance(targetRGB, slotRGB);
        if (d < bestSlotD) {
            bestSlotRaw = rawHex;
            bestSlotCooked = slotHex;
            bestSlotD = d;
        }

        d = colorDistance(targetRGB, plasticRGB);
        if (d < bestPlasticD) {
            bestPlasticRaw = rawHex;
            bestPlasticCooked = plasticHex;
            bestPlasticD = d;
        }

        d = colorDistance(targetRGB, widgetRGB);
        if (d < bestWidgetD) {
            bestWidgetRaw = rawHex;
            bestWidgetCooked = widgetHex;
            bestWidgetD = d;
        }
    }

    return {
        target: targetHexColor.toUpperCase(),
        slot: bestSlotRaw,
        slotRendered: bestSlotCooked,
        plastic: bestPlasticRaw,
        plasticRendered: bestPlasticCooked,
        widget: bestWidgetRaw,
        widgetRendered: bestWidgetCooked,
    };
}

const colorToClosests: Record<string, Array<object>> = {};
for (const entry of data) {
    const closests: Array<object> = [closest(entry.hexColor)];
    for (const variant of entry.variants) {
        closests.push(closest(variant));
    }
    colorToClosests[entry.colorName] = closests;
}
console.log(JSON.stringify(colorToClosests, null, 2));
