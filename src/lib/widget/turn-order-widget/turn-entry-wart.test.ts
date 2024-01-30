import { Color } from "@tabletop-playground/api";
import { TurnEntryWart } from "./turn-entry-wart";

it("constructor", () => {
    class MyTurnEntryWart extends TurnEntryWart {
        destroy(): void {
            throw new Error("Method not implemented.");
        }
        update(playerSlot: number, fgColor: Color, bgColor: Color): void {
            throw new Error("Method not implemented.");
        }
    }
    new MyTurnEntryWart();
});
