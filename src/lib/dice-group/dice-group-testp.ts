import { Player, refObject, world } from "@tabletop-playground/api";
import { DiceGroup, DiceGroupCleanup, DiceResult } from "./dice-group";

world.setShowDiceRollMessages(false);

new DiceGroupCleanup().init();

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
    player: world.getAllPlayers()[0],
    position: refObject.getPosition().add([0, 4, 0]),
    timeoutSeconds: -1, // no timeout
    deleteAfterSeconds: -1, // no delete
    callback: (diceResults: DiceResult[], player: Player) => {
        console.log(
            diceResults
                .map((diceResult) => DiceGroup.format(diceResult))
                .join(", ")
        );
    },
});
