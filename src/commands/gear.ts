import {Message} from "discord.js";
import {Database, Entry} from "../db";
import {createEmbed, escapeRegex} from "../util";
import {Argument, Command} from "./command";

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
        const talent = escapeRegex(args[0]);
        const data = await Database.Data.collection("gear").findOne<IGear>({name: {$regex: talent, $options: "i"}});

        if (data == null) {
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
