import {defaultTo} from "lodash";
import {EmojiCache} from "./emoji";
import {Message, RichEmbed} from "discord.js";
import {Entry} from "./db";
import {types} from "util";
import isMap = module

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
    ["EASY", `Easy (${EmojiCache.get("difficulty")})`],
    ["AVERAGE", `Average (${(EmojiCache.get("difficulty")).repeat(2)})`],
    ["HARD", `Hard (${(EmojiCache.get("difficulty")).repeat(3)})`],
    ["DAUNTING", `Daunting (${(EmojiCache.get("difficulty")).repeat(4)})`],
    ["FORMIDABLE", `Formidable (${(EmojiCache.get("difficulty")).repeat(5)})`],
]);

// TODO should cache this output? could be expensive to run it often
export function format(input: string): string {
    return input
        .replace(/\[CHECK:([A-Z]+):?([a-zA-Z]*)]/g, (match, p1, p2) => `**${check.get(p1) || p1} ${idToName(p2)} check**`)
        .replace(/\[CHARACTERISTIC:([a-zA-Z]+)]/g, "**$1**")
        .replace(/\[([A-Z]+)]/g, (match, p1) => EmojiCache.get(p1.toLowerCase()) || p1)
        .replace(/\[([A-Z]+):?([a-zA-Z]*)]/g, (match, p1, p2) => `**${check.get(p1) || p1} ${idToName(p2)}**`)
        .replace(/\[BR]/g, "\n");
}

export function createEmbed(message: Message, data: Entry, endpoint?: string, name?: string): RichEmbed {
    const embed = new RichEmbed();
    embed.setTitle(name || idToName(data._id as string));
    embed.setAuthor(message.member.displayName, message.author.avatarURL);
    embed.setDescription(data.description);
    embed.setFooter(data.index.join(", "));
    embed.setColor("DARK_RED");
    if (data.image !== undefined) {
        if (data.image.startsWith("http")) {
            embed.setThumbnail(data.image);
        }
        else if (process.env.DATA_URL !== undefined) {
            embed.setThumbnail(process.env.DATA_URL + data.image);
        }
    }
    if (process.env.DATA_URL !== undefined && endpoint !== undefined) {
        embed.setURL(`${process.env.DATA_URL}/${endpoint}/${data._id}`);
    }
    return embed;
}
