import {Message, RichEmbed} from "discord.js";
import {isObject} from "util";
import {Database, Entry} from "../db";
import {escapeRegex, format, idToName, nameToId} from "../util";
import {Argument, Command} from "./command";
import {ICharacteristics} from "../characteristics";
import * as assert from "assert";

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
    public async run(message: Message, args: string[]): Promise<void> {
        if (message.content.length > 7) {
            const talent = escapeRegex(nameToId(args[0]));
            const data = await Database.Data.collection<ISpecies>("species")
                .find({_id: {$regex: talent, $options: "i"}}).limit(1).next();

            if (data == null) {
                await message.reply("No Species found");
                return;
            }

            const embed = new RichEmbed();
            embed.setTitle(idToName(data._id));
            embed.setAuthor(message.member.displayName, message.author.avatarURL);
            embed.setDescription(format(data.description || ""));
            embed.setFooter(data.index.join(", "));
            embed.setColor("DARK_RED");
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
            if (process.env.DATA_URL !== undefined) {
                embed.setURL(process.env.DATA_URL + "/species/" + data._id);
            }
            await message.channel.send({embed});
        }
    }
};
