import { Message } from "discord.js";
import { Database, Entry, findOne } from "../db";
import { createEmbed, escapeRegex } from "../util";
import { Argument, Command } from "./command";

interface IArmor extends Entry {
    defense: number;
    encumbrance: number;
    hardpoints: number;
    image?: string;
    name: string;
    notes?: string;
    price: number;
    rarity: number;
    restricted: boolean;
    soak: number;
}

export = class Armor extends Command {
    constructor() {
        super(["armor", "armour"], [new Argument("name")]);
    }

    public async run(message: Message, args: string[]) {
        const search = escapeRegex(args.join(" "));
        const data = await findOne<IArmor>(Database.Data.collection("armor"), {
            name: {
                $options: "i",
                $regex: search,
            },
        }, message);

        if (data === undefined) {
            await message.channel.send("No armor found");
            return;
        }

        const {item, msg} = data;
        const embed = createEmbed(message, item, "armor", item.name);
        embed.addField("Price", item.price.toLocaleString() + (item.restricted ? " (R)" : ""), true);
        embed.addField("Rarity", item.rarity, true);
        embed.addField("Encumbrance", item.encumbrance, true);

        embed.addField("Soak", item.soak, true);
        embed.addField("Defense", item.defense, true);
        embed.addField("Hard Points", item.hardpoints, true);

        if (msg === undefined || !msg.editable) await message.channel.send(embed);
        else await msg.edit(embed);
    }
};
