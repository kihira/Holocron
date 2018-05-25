import {Message, RichEmbed} from "discord.js";
import {Database, Entry} from "../db";
import {escapeRegex, idToName, nameToId} from "../util";
import {Argument, Command} from "./command";

interface ISpecialization extends Entry {
    _id: string;
    skills: string[];
    tree: {talents: string[][]};
}

export = class Armor extends Command {
    constructor() {
        super(["specialization", "specialisation", "spec"], [new Argument("name")]);
    }
    public async run(message: Message, args: string[]): Promise<void> {
        const talent = escapeRegex(nameToId(args[0]));
        const data = await Database.Data.collection("specializations")
            .find<ISpecialization>({name: {$regex: talent, $options: "i"}}).limit(1).next();

        if (data == null) {
            await message.channel.send("No armor found");
            return;
        }

        const embed = new RichEmbed();
        embed.setTitle(idToName(data._id));
        embed.setAuthor(message.member.displayName, message.author.avatarURL);
        embed.setDescription(data.description || "");
        embed.setFooter(data.index.join(", "));
        embed.setColor("DARK_RED");
        embed.addField("Skills", data.skills.map((value) => idToName(value)).join(" ,"));
        // embed.addField("Tree", data.tree); // todo
        if (process.env.DATA_URL !== undefined) {
            embed.setURL(process.env.DATA_URL + "/specializations/" + data._id);
        }

        await message.channel.send(embed);
    }
};
