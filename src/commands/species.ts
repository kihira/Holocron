import { Message, RichEmbed } from "discord.js";
import { ICharacteristics } from "../characteristics";
import { Database, Entry, findOne } from "../db";
import { createEmbed, escapeRegex, format, idToName, nameToId } from "../util";
import { Argument, Command } from "./command";

interface ISpecies extends Entry {
    _id: string;
    player?: boolean;
}

interface IPlayerSpecies extends ISpecies {
    wound: number;
    strain: number;
    xp: number;
    characteristics: ICharacteristics;
}

export = class Species extends Command {
    constructor() {
        super("species", [new Argument("species")]);
    }

    public async run(message: Message, args: string[]) {
        const search = escapeRegex(nameToId(args[0]));
        const data = await findOne<ISpecies>(Database.Data.collection("species"), {
            _id: {
                $options: "i",
                $regex: search,
            },
        }, message);

        if (data === undefined) {
            await message.channel.send("No species found");
            return;
        }

        const {item, msg} = data;
        const embed = createEmbed(message, item, "species");
        embed.addField("Player", item.player ? "True" : "False");
        if (item.player) {
            const playerData: IPlayerSpecies = (item as IPlayerSpecies);
            embed.addField("Brawn", playerData.characteristics.brawn, true);
            embed.addField("Agility", playerData.characteristics.agility, true);
            embed.addField("Intellect", playerData.characteristics.intellect, true);

            embed.addField("Cunning", playerData.characteristics.cunning, true);
            embed.addField("Willpower", playerData.characteristics.willpower, true);
            embed.addField("Presence", playerData.characteristics.presence, true);

            embed.addField("Strain Threshold", playerData.strain, true);
            embed.addField("Wound Threshold", playerData.wound, true);
            embed.addField("Starting XP", playerData.xp, true);
        }

        if (msg === undefined || !msg.editable) await message.channel.send(embed);
        else await msg.edit(embed);
    }
};
