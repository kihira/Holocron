import {Message, RichEmbedOptions} from "discord.js";
import {Mongo} from "../db";
import {escapeRegex} from "../util";
import {Command} from "./command";

export class Talent extends Command {
    public async run(message: Message): Promise<void> {
        if (message.content.length > 7) {
            const talent = escapeRegex(message.content.replace(/ /g, "_").substr(8));
            const data = await Mongo.Data.collection("talents").findOne({_id: {$regex: talent, $options: "i"}});
            if (data == null) {
                await message.reply("No talent found");
            }
            else {
                const embed: RichEmbedOptions = {
                    author: {
                        icon_url: message.member.user.avatarURL,
                        name: message.member.displayName,
                    },
                    description: data.description || data.short,
                    fields: [
                        {
                            name: "Ranked",
                            value: data.ranked ? "True" : "False",
                        },
                        {
                            name: "Force",
                            value: data.force ? "True" : "False",
                        },
                    ],
                };
                if (process.env.DATA_URL !== undefined) {
                    embed.url = process.env.DATA_URL + "/talents/" + data._id;
                }
                await message.channel.sendEmbed(embed);
            }
            console.log(data);
        }
    }
}