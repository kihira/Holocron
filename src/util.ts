export function escapeRegex(str: string) {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}

export function idToName(id: string) {
    return id.replace(/_/g, " ");
}

export function nameToId(name: string) {
    return name.replace(/ /g, "_");
}