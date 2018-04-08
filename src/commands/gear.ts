import {Message, RichEmbed} from "discord.js";
import {isString} from "util";
import {Database, Entry} from "../db";
import {escapeRegex, idToName, nameToId} from "../util";
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
    public async run(message: Message, args: string[]): Promise<void> {
        const talent = escapeRegex(nameToId(args[0]));
        const data = await Database.Data.collection("gear")
            .find<IGear>({name: {$regex: talent, $options: "i"}}).next();

        if (data == null) {
            await message.channel.send("No gear found");
            return;
        }

        const embed = new RichEmbed();
        embed.setTitle(data.name);
        embed.setAuthor(message.member.displayName, message.author.avatarURL);
        embed.setDescription(data.description || data.notes || "");
        embed.setFooter(data.index.join(", "));
        embed.setColor("DARK_RED");
        embed.addField("Category", data.category);
        embed.addField("Price", data.price.toLocaleString() + (data.restricted ? " (R)" : ""), true);
        embed.addField("Rarity", data.rarity, true);
        embed.addField("Encumbrance", data.encumbrance, true);
        if (process.env.DATA_URL !== undefined) {
            embed.setURL(process.env.DATA_URL + "/gear/" + data._id);
        }

        await message.channel.send(embed);
    }
};
