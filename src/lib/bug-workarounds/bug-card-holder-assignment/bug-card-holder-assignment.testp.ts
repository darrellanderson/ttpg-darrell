import { refHolder } from "@tabletop-playground/api";
import { BugCardHolderAssignment } from "./bug-card-holder-assignment";
import { NSID } from "../../nsid/nsid";

const nsid: string = NSID.get(refHolder);
if (nsid.length === 0) {
    throw new Error("no nsid");
}

new BugCardHolderAssignment(nsid).init();
