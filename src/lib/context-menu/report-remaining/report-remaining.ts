import {
    Card,
    GameObject,
    Player,
    globalEvents,
    world,
} from "@tabletop-playground/api";
import { IGlobal } from "../../global/i-global";
import { NSID } from "../../nsid/nsid";

export class ReportRemaining implements IGlobal {
    private static readonly _actionName: string = "* Report remaining";
    private readonly _cardNsidPrefix: string;

    private readonly _customActionHandler = (
        obj: GameObject,
        player: Player,
        identifier: string
    ): void => {
        if (identifier !== ReportRemaining._actionName) {
            return; // not this
        }
        if (!(obj instanceof Card)) {
            throw new Error("not card");
        }
        const names: Array<string> = obj
            .getAllCardDetails()
            .map((cardDetails): string => {
                return cardDetails.name;
            })
            .sort();
        // TODO XXX
    };

    constructor(cardNsidPrefix: string) {
        this._cardNsidPrefix = cardNsidPrefix;
    }

    private _maybeAdd(obj: GameObject) {
        if (obj instanceof Card) {
            const nsids: string[] = NSID.getDeck(obj);
            const firstNsid: string | undefined = nsids[0];
            if (firstNsid?.startsWith(this._cardNsidPrefix)) {
                obj.removeCustomAction(ReportRemaining._actionName);
                obj.addCustomAction(ReportRemaining._actionName);
                obj.onCustomAction.remove(this._customActionHandler);
                obj.onCustomAction.add(this._customActionHandler);
            }
        }
    }

    init(): void {
        globalEvents.onObjectCreated.add((obj: GameObject) => {
            this._maybeAdd(obj);
        });
        const skipContained = false;
        for (const obj of world.getAllObjects(skipContained)) {
            this._maybeAdd(obj);
        }
    }
}
