import { Player } from "@tabletop-playground/api";
import { TurnEntryWartGenerator } from "./turn-entry-wart";

export const TurnOrderWidgetDefaults = {
    DEFAULT_ENTRY_WIDTH: 150,
    DEFAULT_ENTRY_HEIGHT: 25,
    DEFAULT_RESERVE_SLOTS: 8,
} as const;

export type TurnOrderWidgetParams = {
    // Per-turn entry size, stacked vertically.
    entryWidth?: number;
    entryHeight?: number;

    // Consume pixels at edges to highlight for mouseover (max useful is 4).
    margins?: {
        left?: number;
        top?: number;
        right?: number;
        bottom?: number;
    };

    // Where should the player name appear?  Defaults to full entry.
    nameBox?: {
        left?: number;
        top?: number;
        width?: number;
        height?: number;
    };

    // Attach additional items to the turn entry (e.g. score, faction, etc).
    wartGenerators?: TurnEntryWartGenerator[];

    // Size for N turns.
    reserveSlots?: number;

    // Options for toggling player state.
    togglePassed?: boolean;
    toggleEliminated?: boolean;

    // Add extra options.
    customActions?: {
        name: string;
        tooltip?: string;
        identifier?: string;
    }[];
    onCustomAction?: (player: Player, identifier: string) => void;
};
