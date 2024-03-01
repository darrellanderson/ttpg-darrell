import { Player, refObject, world } from "@tabletop-playground/api";
import { DiceGroup, DiceGroupCleanup, DiceResult } from "./dice-group";

world.setShowDiceRollMessages(false);

new DiceGroupCleanup().init();

const player: Player | undefined = world.getAllPlayers()[0];
if (!player) {
    throw new Error("no player");
}

DiceGroup.roll({
    diceParams: [
        { sides: 10 },
        {
            id: "will-reroll",
            name: "Rerolled",
            sides: 10,
            primaryColor: [1, 0, 0, 1],
            secondaryColor: [1, 1, 0, 1],
            hit: 11, // cannot hit, will reroll
            reroll: true,
        },
        { sides: 4 },
        { sides: 6 },
        { sides: 8 },
        { sides: 12 },
        { sides: 20 },
    ],
    player,
    position: refObject.getPosition().add([0, 4, 0]),
    timeoutSeconds: -1, // no timeout
    deleteAfterSeconds: -1, // no delete
    callback: (diceResults: Array<DiceResult>) => {
        console.log(
            diceResults
                .map((diceResult) => DiceGroup.format(diceResult))
                .join(", ")
        );
    },
});
