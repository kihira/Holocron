import { Message } from "discord.js";
import { Database, Entry, findOne } from "../db";
import { createEmbed, escapeRegex } from "../util";
import { Argument, Command } from "./command";

interface IGear extends Entry {
    category: string;
    encumbrance: number;
    image?: string;
    name: string;
    notes?: string;
    price: number;
    rarity: number;
    restricted: boolean;
}

export = class Gear extends Command {
    constructor() {
        super("gear", [new Argument("name")]);
    }

    public async run(message: Message, args: string[]) {
        const search = escapeRegex(args.join(" "));
        const data = await findOne<IGear>(Database.Data.collection("gear"), {
            name: {
                $options: "i",
                $regex: search,
            },
        }, message);

        if (data === undefined) {
            await message.channel.send("No gear found");
            return;
        }

        const {item, msg} = data;
        const embed = createEmbed(message, item, "gear", item.name);
        embed.addField("Category", item.category);

        embed.addField("Price", item.price.toLocaleString() + (item.restricted ? " (R)" : ""), true);
        embed.addField("Rarity", item.rarity, true);
        embed.addField("Encumbrance", item.encumbrance, true);

        if (msg === undefined || !msg.editable) await message.channel.send(embed);
        else await msg.edit(embed);
    }
};
