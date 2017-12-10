export function escapeRegex(str: string): string {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}

export function idToName(id: string): string {
    return id.replace(/_/g, " ");
}

export function nameToId(name: string): string {
    return name.replace(/ /g, "_");
}
