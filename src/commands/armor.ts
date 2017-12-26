import {Message, RichEmbed} from "discord.js";
import {isObject, isString} from "util";
import {Database} from "../db";
import {escapeRegex, idToName, nameToId} from "../util";
import {Argument, Command} from "./command";

interface IArmor {
    _id: string;
    defense: number;
    description?: string;
    encumbrance: number;
    hardpoints: number;
    image?: string;
    index: string[];
    name: string;
    notes?: string;
    price: number;
    rarity: number;
    restricted: boolean;
    soak: number;
}

export = class Armor extends Command {
    constructor() {
        super("armor", [new Argument("name")], "armour");
    }
    public async run(message: Message, args: string[]): Promise<void> {
        if (message.content.length > 7) {
            const talent = escapeRegex(nameToId(args[0]));
            const data = await Database.Data.collection<IArmor>("armor")
                .find({name: {$regex: talent, $options: "i"}}).limit(1).next();

            if (data == null) {
                await message.channel.send("No armor found");
                return;
            }

            const embed = new RichEmbed();
            embed.setTitle(data.name);
            embed.setAuthor(message.member.displayName, message.author.avatarURL);
            embed.setDescription(data.description || data.notes || "");
            embed.setFooter(data.index.join(", "));
            embed.setColor("DARK_RED");
            embed.addField("Price", data.price.toLocaleString() + (data.restricted ? " (R)" : ""), true);
            embed.addField("Rarity", data.rarity, true);
            embed.addField("Encumbrance", data.encumbrance, true);
            embed.addField("Soak", data.soak, true);
            embed.addField("Defense", data.defense, true);
            embed.addField("Hard Points", data.hardpoints, true);
            if (process.env.DATA_URL !== undefined) {
                embed.setURL(process.env.DATA_URL + "/armor/" + data._id);
            }

            await message.channel.send(embed);
        }
    }
};
