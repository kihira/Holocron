import {ColorResolvable, Message, RichEmbed} from "discord.js";
import {isObject} from "util";
import {Mongo} from "../db";
import {escapeRegex, idToName, nameToId} from "../util";
import {Command} from "./command";

interface ITalent {
    _id: string;
    force: boolean;
    ranked: boolean;
    index: string[];
    short?: string;
    description?: string;
    activation: boolean | {Action?: boolean, Incidental?: boolean, Out_Of_Turn?: boolean};
}

export class Talent extends Command {
    public async run(message: Message): Promise<void> {
        if (message.content.length > 7) {
            const talent = escapeRegex(nameToId(message.content.substr(8))); // todo substr needs support for alias
            const data = await Mongo.Data.collection<ITalent>("talents")
                .findOne({_id: {$regex: talent, $options: "i"}});

            if (data == null) {
                await message.reply("No talent found");
                return;
            }

            const embed = new RichEmbed();
            embed.setTitle(idToName(data._id));
            embed.setAuthor(message.member.displayName, message.member.user.avatarURL);
            embed.setDescription(data.description || data.short || "");
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
}
