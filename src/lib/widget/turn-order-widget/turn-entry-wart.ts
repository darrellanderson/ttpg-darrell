import { Color } from "@tabletop-playground/api";

export type TurnEntryWartGenerator = (...args: any[]) => TurnEntryWart;

/**
 * Augment a TurnEntryWidget.  May update its own widgets independently of
 * changes to turn order (e.g. change score value when score changes).
 */
export abstract class TurnEntryWart {
    /**
     * TurnEntryWidget retired, remove any event handlers, etc.
     */
    abstract destroy(): void;

    /**
     * Update the turn entry widget.
     */
    abstract update(playerSlot: number, fgColor: Color, bgColor: Color): void;
}
