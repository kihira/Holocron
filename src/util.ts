import {defaultTo} from "lodash";

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
