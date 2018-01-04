import {Message, RichEmbed} from "discord.js";
import {isObject} from "util";
import {Database} from "../db";
import {escapeRegex, format, idToName, nameToId} from "../util";
import {Argument, Command} from "./command";

interface ITalent {
    _id: string;
    force: boolean;
    ranked: boolean;
    index: string[];
    short?: string;
    description?: string;
    activation: boolean | {Action?: boolean, Incidental?: boolean, Out_Of_Turn?: boolean};
}

export = class Talent extends Command {
    constructor() {
        super("talent", [new Argument("talent")]);
    }
    public async run(message: Message, args: string[]): Promise<void> {
        if (message.content.length > 7) {
            const talent = escapeRegex(nameToId(args[0]));
            const data = await Database.Data.collection<ITalent>("talents")
                .find({_id: {$regex: talent, $options: "i"}}).limit(1).next();

            if (data == null) {
                await message.reply("No talent found");
                return;
            }

            const embed = new RichEmbed();
            embed.setTitle(idToName(data._id));
            embed.setAuthor(message.member.displayName, message.author.avatarURL);
            embed.setDescription(format(data.description || data.short || ""));
            embed.setFooter(data.index.join(", "));
            embed.setColor("DARK_RED");
            embed.addField("Ranked", data.ranked ? "True" : "False", true);
            embed.addField("Force", data.force ? "True" : "False", true);

            if (!data.activation) {
                embed.addField("Activation", "Passive", true);
            }
            else {
                let value = "Active";
                if (isObject(data.activation)) {
                    value += " (";
                    const keys = Object.keys(data.activation);
                    for (let i = 0; i < keys.length; i++) {
                        keys[i] = idToName(keys[i]);
                    }
                    value += keys.join(", ");
                    value += ")";
                }
                embed.addField("Activation", value, true);
            }
            if (process.env.DATA_URL !== undefined) {
                embed.setURL(process.env.DATA_URL + "/talents/" + data._id);
            }
            await message.channel.send({embed});
        }
    }
};
