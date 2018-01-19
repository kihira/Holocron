import {defaultTo} from "lodash";
import { emojiMap } from "./emoji";

export function escapeRegex(str: string): string {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}

export function idToName(id: string): string {
    return id.replace(/_/g, " ");
}

export function nameToId(name: string): string {
    return name.replace(/ /g, "_");
}

export function defaultParse(value: string, def: number): number {
    return defaultTo(parseInt(value, 10), def);
}

const check = new Map<string, string>([
    ["SIMPLE", "Simple"],
    ["EASY", `Easy (${emojiMap.get("difficulty")})`],
    ["AVERAGE", `Average (${(emojiMap.get("difficulty") || "").repeat(2)})`],
    ["HARD", `Hard (${(emojiMap.get("difficulty") || "").repeat(3)})`],
    ["DAUNTING", `Daunting (${(emojiMap.get("difficulty") || "").repeat(4)})`],
    ["FORMIDABLE", `Formidable (${(emojiMap.get("difficulty") || "").repeat(5)})`],
]);

export function format(input: string): string {
    return input
        .replace(/\[CHECK:([A-Z]+):?([a-zA-Z]*)]/g, (match, p1, p2) => `**${check.get(p1) || p1} ${idToName(p2)} check**`)
        .replace(/\[CHARACTERISTIC:([a-zA-Z]+)]/g, "**$1**")
        .replace(/\[([A-Z]+)]/g, (match, p1) => emojiMap.get(p1.toLowerCase()) || p1)
        .replace(/\[([A-Z]+):?([a-zA-Z]*)]/g, (match, p1, p2) => `**${check.get(p1) || p1} ${idToName(p2)}**`)
        .replace(/\[BR]/g, "\n");
}
