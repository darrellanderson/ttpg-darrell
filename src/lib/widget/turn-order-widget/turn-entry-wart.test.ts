import { TurnEntryWart } from "./turn-entry-wart";

it("constructor", () => {
    class MyTurnEntryWart extends TurnEntryWart {
        destroy(): void {
            throw new Error("Method not implemented.");
        }
        update(): void {
            throw new Error("Method not implemented.");
        }
    }
    new MyTurnEntryWart();
});
