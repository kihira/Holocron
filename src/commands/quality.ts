import {Message, RichEmbed} from "discord.js";
import {isString} from "util";
import {Database, Entry} from "../db";
import {escapeRegex, idToName, nameToId} from "../util";
import {Argument, Command} from "./command";

interface IQuality extends Entry {
    _id: string;
    description: string;
    active: "Active" | "Passive"; // todo should switch this to true/fale
    ranked: boolean;
}

export = class Quality extends Command {
    constructor() {
        super(["quality", "qualities", "special"], [new Argument("name")]);
    }
    public async run(message: Message, args: string[]): Promise<void> {
        const talent = escapeRegex(nameToId(args[0]));
        const data = await Database.Data.collection("quality")
            .find<IQuality>({name: {$regex: talent, $options: "i"}}).limit(1).next();

        if (data == null) {
            await message.channel.send("No quality found");
            return;
        }

        const embed = new RichEmbed();
        embed.setTitle(idToName(data._id));
        embed.setAuthor(message.member.displayName, message.author.avatarURL);
        embed.setDescription(data.description);
        embed.setFooter(data.index.join(", "));
        embed.setColor("DARK_RED");
        embed.addField("Active", data.active, true);
        embed.addField("Ranked", data.ranked ? "True" : "False", true);
        if (process.env.DATA_URL !== undefined) {
            embed.setURL(process.env.DATA_URL + "/qualities/" + data._id);
        }

        await message.channel.send(embed);
    }
};
