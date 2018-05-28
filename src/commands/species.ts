import {Message, RichEmbed} from "discord.js";
import {ICharacteristics} from "../characteristics";
import {Database, Entry} from "../db";
import {createEmbed, escapeRegex, format, idToName, nameToId} from "../util";
import {Argument, Command} from "./command";

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
        const talent = escapeRegex(nameToId(args[0]));
        const data = await Database.Data.collection("species").findOne<ISpecies>({_id: {$regex: talent, $options: "i"}});

        if (data == null) {
            await message.reply("No Species found");
            return;
        }

        const embed = createEmbed(message, data, "species");
        embed.addField("Player", data.player ? "True" : "False");
        if (data.player) {
            const playerData: IPlayerSpecies = (data as IPlayerSpecies);
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

        await message.channel.send(embed);
    }
};
