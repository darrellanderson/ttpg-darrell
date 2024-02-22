import { CardHolder, world } from "@tabletop-playground/api";
import { Find } from "../../find/find";
import { IGlobal } from "../../global/i-global";
import { ErrorHandler } from "../../error-handler/error-handler";

/**
 * Monitor card holder, expect it to be the primary holder for
 * the owning player slot player.
 */
export class BugCardHolderAssignment implements IGlobal {
    private readonly _find = new Find();
    private readonly _cardHolderNsid: string;

    constructor(cardHolderNsid: string) {
        this._cardHolderNsid = cardHolderNsid;
    }

    init(): void {
        setInterval(() => {
            this._run();
        }, 1000);
    }

    private _run(): void {
        for (const player of world.getAllPlayers()) {
            const playerSlot: number = player.getSlot();
            const skipContained = true;
            const cardHolder: CardHolder | undefined =
                this._find.findCardHolder(
                    this._cardHolderNsid,
                    playerSlot,
                    skipContained
                );
            if (cardHolder && player.getHandHolder() !== cardHolder) {
                const msg: string = `BugCardHolderAssignment: re-attached for slot ${playerSlot}`;
                console.group(msg);
                ErrorHandler.onError.trigger(msg);
                player.setHandHolder(cardHolder);
            }
        }
    }
}
