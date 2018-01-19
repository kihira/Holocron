import {Message, RichEmbed} from "discord.js";
import {isString} from "util";
import {Database} from "../db";
import {escapeRegex, idToName, nameToId} from "../util";
import {Argument, Command} from "./command";

interface ICareer {
    _id: string;
    description?: string;
    index: string[];
    skills: string[];
    specializations: string[];
}

export = class Quality extends Command {
    constructor() {
        super("career", [new Argument("name")]);
    }
    public async run(message: Message, args: string[]): Promise<void> {
        if (message.content.length > 7) {
            const talent = escapeRegex(nameToId(args[0]));
            const data = await Database.Data.collection<ICareer>("careers")
                .find({name: {$regex: talent, $options: "i"}}).limit(1).next();

            if (data == null) {
                await message.channel.send("No career found");
                return;
            }

            const embed = new RichEmbed();
            embed.setTitle(idToName(data._id));
            embed.setAuthor(message.member.displayName, message.author.avatarURL);
            embed.setDescription(data.description || "");
            embed.setFooter(data.index.join(", "));
            embed.setColor("DARK_RED");
            embed.addField("Skills", data.skills.join(" ,"));
            embed.addField("Specializations", data.specializations.join(" ,"));
            if (process.env.DATA_URL !== undefined) {
                embed.setURL(process.env.DATA_URL + "/careers/" + data._id);
            }

            await message.channel.send(embed);
        }
    }
};
