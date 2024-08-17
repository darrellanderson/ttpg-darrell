import {
    PLASTIC_COLORS,
    PLASTIC_COLORS_SPECTRUM,
    RAW_COLORS,
    RAW_COLORS_SPECTRUM,
    WIDGET_COLORS,
} from "./color-mapping.data";

import { LinearRegression, setBackend } from "scikitjs";
import { SGDRegressor } from "scikitjs/dist/es5/linear_model/SgdRegressor";
import * as tensorflow from "@tensorflow/tfjs";

setBackend(tensorflow);

const raw = {
    R: RAW_COLORS.map(([r, _g, _b]) => r),
    G: RAW_COLORS.map(([_r, g, _b]) => g),
    B: RAW_COLORS.map(([_r, _g, b]) => b),

    RS: RAW_COLORS_SPECTRUM.map(([r, _g, _b]) => r),
    GS: RAW_COLORS_SPECTRUM.map(([_r, g, _b]) => g),
    BS: RAW_COLORS_SPECTRUM.map(([_r, _g, b]) => b),
};

async function processOne(
    name: string,
    channel: Array<number>,
    raw: Array<Array<number>>
) {
    let best: Array<number> = [];
    let bestScore = 0;
    for (let i = 0; i < 20; i++) {
        const model: SGDRegressor = await new LinearRegression({
            fitIntercept: true,
        }).fit(raw, channel);
        const score: number = model.score(raw, channel);
        if (score > bestScore) {
            best = model.coef.arraySync().flat();
            best.push(model.intercept as number);
            bestScore = score;
        }
    }
    const s: number = 100;
    best = best.map((value: number): number => Math.round(value * s) / s);
    console.log(name, "coef+intercept", best.join(","));
    console.log(name, "score", bestScore);
}

async function processOneSq(
    name: string,
    channel: Array<number>,
    raw: Array<Array<number>>
) {
    raw = raw.map((entry: Array<number>): Array<number> => {
        const result: Array<number> = [...entry];
        for (const value of entry) {
            result.push(value * value);
        }
        return result;
    });
    await processOne(name, channel, raw);
}

async function processAll() {
    await processOne("R", raw.R, PLASTIC_COLORS);
    await processOne("R+", raw.RS, PLASTIC_COLORS_SPECTRUM);
    await processOne("G", raw.G, PLASTIC_COLORS);
    await processOne("B", raw.B, PLASTIC_COLORS);
    await processOne("RW", raw.R, WIDGET_COLORS);
    await processOne("GW", raw.G, WIDGET_COLORS);
    await processOne("BW", raw.B, WIDGET_COLORS);

    await processOneSq("R2", raw.R, PLASTIC_COLORS);
    await processOneSq("R2+", raw.RS, PLASTIC_COLORS_SPECTRUM);
    await processOneSq("G2", raw.G, PLASTIC_COLORS);
    await processOneSq("B2", raw.B, PLASTIC_COLORS);
    await processOneSq("R2W", raw.R, WIDGET_COLORS);
    await processOneSq("G2W", raw.G, WIDGET_COLORS);
    await processOneSq("B2W", raw.B, WIDGET_COLORS);
}

processAll();
