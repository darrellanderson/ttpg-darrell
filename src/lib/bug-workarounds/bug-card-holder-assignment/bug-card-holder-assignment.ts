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
    private _intervalHandle: unknown | undefined;

    public readonly _intervalRunnable = () => {
        this._run();
    };

    constructor(cardHolderNsid: string) {
        this._cardHolderNsid = cardHolderNsid;
    }

    public init(): void {
        this._intervalHandle = setInterval(this._intervalRunnable, 1000);
    }

    public destroy(): void {
        if (this._intervalHandle !== undefined) {
            clearInterval(this._intervalHandle);
            this._intervalHandle = undefined;
        }
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
                player.setHandHolder(cardHolder);
                const msg: string = `BugCardHolderAssignment: re-attached for slot ${playerSlot}`;
                console.log(msg);
                ErrorHandler.onError.trigger(msg);
            }
        }
    }
}
