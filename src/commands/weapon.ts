import {Client, Collection, Emoji, Message} from "discord.js";
import {Database, Entry, findOne} from "../db";
import {EmojiCache} from "../emoji";
import {createEmbed, escapeRegex, idToName} from "../util";
import {Argument, Command} from "./command";

interface IWeapon extends Entry {
    category: string;
    critical: number | "-"; // TODO should convert the - to 0
    damage: number;
    encumbrance: number;
    hardpoints: number;
    image?: string;
    name: string;
    notes?: string;
    price: number;
    range: string;
    rarity: number;
    restricted: boolean;
    skill: string;
    special: Array<string | {id: string, value: number}>;
}

export = class Weapon extends Command {
    constructor() {
        super(["weapon", "weapons", "w"], [new Argument("name")]);
    }

    public async run(message: Message, args: string[]) {
        const search = escapeRegex(args.join(" "));
        const data = await findOne<IWeapon>(Database.Data.collection("weapons"), {name: {$regex: search, $options: "i"}}, message);
        if (data === undefined) {
            message.channel.send("No weapons found");
            return;
        }

        const embed = createEmbed(message, data, "weapons", data.name);

        embed.addField("Damage", data.damage, true);
        embed.addField("Critical", data.critical === "-" ? "-" : EmojiCache.get("advantage").repeat(data.critical), true);
        embed.addField("Hard Points", data.hardpoints, true);

        embed.addField("Price", data.price.toLocaleString() + (data.restricted ? " (R)" : ""), true);
        embed.addField("Rarity", data.rarity, true);
        embed.addField("Encumbrance", data.encumbrance, true);

        embed.addField("Category", data.category, true);
        embed.addField("Skill", data.skill, true);

/*        embed.addField("Damage", data.damage, true);
        embed.addField("Critical", data.critical === "-" ? "-" : EmojiCache.get("advantage").repeat(data.critical), true);
        embed.addField("Skill", data.skill, true);

        embed.addField("Description", `
**Category:** ${data.category}
**Price:** ${data.price.toLocaleString() + (data.restricted ? " (R)" : "")}
**Rarity:** ${data.rarity}
**Encumbrance:** ${data.encumbrance}
**Hard Points:** ${data.hardpoints}
        `);*/

        if (data.special) {
            embed.addField("Special", data.special.map((element) => typeof (element) === "string" ? idToName(element) : `${idToName(element.id)} ${element.value}`).join(", "));
        }

        await message.channel.send(embed);
    }
};
