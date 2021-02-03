import { Message } from "discord.js";
import { Database, Entry, findOne } from "../db";
import { EmojiCache } from "../emoji";
import { createEmbed, escapeRegex, idToName } from "../util";
import { Argument, Command } from "./command";

interface IAttachment extends Entry {
    category: string;
    critical: number | "-";
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
    special: Array<string | { id: string, value: number }>;
}

export = class Attachment extends Command {
    constructor() {
        super(["weapon", "weapons", "w"], [new Argument("name")]);
    }

    public async run(message: Message, args: string[]): Promise<void> {
        const search = escapeRegex(args.join(" "));
        const data = await findOne<IAttachment>(Database.Data.collection("attachments"), {
            name: {
                $options: "i",
                $regex: search,
            },
        }, message);

        if (data === undefined) {
            message.channel.send("No attachments found");
            return;
        }

        const {item, msg} = data;
        const embed = createEmbed(message, item, "attachments", item.name);

        embed.addField("Damage", item.damage, true);
        embed.addField("Critical", item.critical === "-" ? "-" : EmojiCache.get("advantage").repeat(item.critical), true);
        embed.addField("Hard Points", item.hardpoints, true);

        embed.addField("Price", item.price.toLocaleString() + (item.restricted ? " (R)" : ""), true);
        embed.addField("Rarity", item.rarity, true);
        embed.addField("Encumbrance", item.encumbrance, true);

        embed.addField("Category", item.category, true);
        embed.addField("Skill", item.skill, true);

        if (item.special) {
            embed.addField("Special", item.special.map((element) => typeof (element) === "string" ? idToName(element) : `${idToName(element.id)} ${element.value}`).join(", "));
        }

        if (msg === undefined || !msg.editable) await message.channel.send(embed);
        else await msg.edit(embed);
    }
};
