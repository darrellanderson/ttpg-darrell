import {
    Border,
    Canvas,
    CheckBox,
    ContentButton,
    ImageButton,
    LayoutBox,
    Panel,
    Player,
    Widget,
} from "@tabletop-playground/api";
import {
    Button,
    MockButton,
    MockCheckBox,
    MockContentButton,
    MockImageButton,
    MockPlayer,
} from "ttpg-mock";

export function clickAll(widget: Widget | undefined, player?: Player) {
    player = player ?? new MockPlayer({ slot: 19 });
    if (widget instanceof Border) {
        clickAll(widget.getChild(), player);
    } else if (widget instanceof Button) {
        const mockButton = widget as MockButton;
        mockButton._clickAsPlayer(player);
    } else if (widget instanceof Canvas) {
        for (const child of widget.getChildren()) {
            clickAll(child, player);
        }
    } else if (widget instanceof CheckBox) {
        const mockCheckBox = widget as MockCheckBox;
        mockCheckBox._clickAsPlayer(player);
    } else if (widget instanceof ContentButton) {
        const mockButton = widget as MockContentButton;
        mockButton._clickAsPlayer(player);
    } else if (widget instanceof ImageButton) {
        const mockButton = widget as MockImageButton;
        mockButton._clickAsPlayer(player);
    } else if (widget instanceof LayoutBox) {
        clickAll(widget.getChild(), player);
    } else if (widget instanceof Panel) {
        for (const child of widget.getAllChildren()) {
            clickAll(child, player);
        }
    }
}
