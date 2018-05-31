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

        const embed = createEmbed(message, data, "gear", data.name);
        embed.addField("Category", data.category);

        embed.addField("Price", data.price.toLocaleString() + (data.restricted ? " (R)" : ""), true);
        embed.addField("Rarity", data.rarity, true);
        embed.addField("Encumbrance", data.encumbrance, true);

        await message.channel.send(embed);
    }
};
