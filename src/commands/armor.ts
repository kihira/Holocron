import {Message} from "discord.js";
import {Database, Entry} from "../db";
import {createEmbed, escapeRegex} from "../util";
import {Argument, Command} from "./command";

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
        const talent = escapeRegex(args.join(" "));
        const data = await Database.Data.collection("armor").findOne<IArmor>({name: {$regex: talent, $options: "i"}});

        if (data == null) {
            await message.channel.send("No armor found");
            return;
        }

        const embed = createEmbed(message, data, "armor", data.name);
        embed.addField("Price", data.price.toLocaleString() + (data.restricted ? " (R)" : ""), true);
        embed.addField("Rarity", data.rarity, true);
        embed.addField("Encumbrance", data.encumbrance, true);

        embed.addField("Soak", data.soak, true);
        embed.addField("Defense", data.defense, true);
        embed.addField("Hard Points", data.hardpoints, true);

        await message.channel.send(embed);
    }
};
