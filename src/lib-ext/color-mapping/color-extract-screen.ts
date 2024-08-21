// https://apple.stackexchange.com/questions/87801/how-to-get-color-of-pixel-in-coordinates-123-456-in-screen

import { execSync } from "child_process";
import Jimp from "jimp";

// MacBook Air: 2560 x 1664 Retina
const x = 1200;
const y = 100;
const w = 100;
const h = 300;

async function process() {
    execSync(`screencapture -R${x},${y},${w},${h} -t png /tmp/px.png`);

    const image = await Jimp.read("/tmp/px.png");
    const slotColor = Jimp.intToRGBA(image.getPixelColor(174, 101));
    const objColor = Jimp.intToRGBA(image.getPixelColor(132, 352));
    const widgetColor = Jimp.intToRGBA(image.getPixelColor(152, 536));

    // Table color at widget position: 173 145 101

    console.log(
        [
            "slot:",
            slotColor.r,
            slotColor.g,
            slotColor.b,
            "obj:",
            objColor.r,
            objColor.g,
            objColor.b,
            "widget:",
            widgetColor.r,
            widgetColor.g,
            widgetColor.b,
        ].join(" ")
    );
}
process();
