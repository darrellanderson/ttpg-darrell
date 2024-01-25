import { refHolder } from "@tabletop-playground/api";
import { CardHolderPlayerName } from "./cardholder-player-name";

// Wait a frame to:
// (1) let creator finish setting up if a new object,
// (2) let player data become valid if (re)loading.
const obj = refHolder; // ref* gets cleared end of frame
process.nextTick(() => {
    new CardHolderPlayerName(obj);
});
