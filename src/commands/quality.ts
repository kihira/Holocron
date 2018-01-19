import {Message, RichEmbed} from "discord.js";
import {isString} from "util";
import {Database} from "../db";
import {escapeRegex, idToName, nameToId} from "../util";
import {Argument, Command} from "./command";

interface IQuality {
    _id: string;
    description?: string;
    index: string[];
    active: "Active" | "Passive"; // todo should switch this to true/fale
    ranked: boolean;
}

export = class Quality extends Command {
    constructor() {
        super("quality", [new Argument("name")], "qualities", "special");
    }
    public async run(message: Message, args: string[]): Promise<void> {
        if (message.content.length > 7) {
            const talent = escapeRegex(nameToId(args[0]));
            const data = await Database.Data.collection<IQuality>("quality")
                .find({name: {$regex: talent, $options: "i"}}).limit(1).next();

            if (data == null) {
                await message.channel.send("No quality found");
                return;
            }

            const embed = new RichEmbed();
            embed.setTitle(idToName(data._id));
            embed.setAuthor(message.member.displayName, message.author.avatarURL);
            embed.setDescription(data.description || "");
            embed.setFooter(data.index.join(", "));
            embed.setColor("DARK_RED");
            embed.addField("Active", data.active, true);
            embed.addField("Ranked", data.ranked ? "True" : "False", true);
            if (process.env.DATA_URL !== undefined) {
                embed.setURL(process.env.DATA_URL + "/qualities/" + data._id);
            }

            await message.channel.send(embed);
        }
    }
};
