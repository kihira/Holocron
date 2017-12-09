import {Message, RichEmbedOptions} from "discord.js";
import {Mongo} from "../db";
import {escapeRegex, idToName, nameToId} from "../util";
import {Command} from "./command";

export class Talent extends Command {
    public async run(message: Message): Promise<void> {
        if (message.content.length > 7) {
            const talent = escapeRegex(nameToId(message.content.substr(8))); // todo substr needs support for alias
            const data = await Mongo.Data.collection("talents").findOne({_id: {$regex: talent, $options: "i"}});

            if (data == null) {
                await message.reply("No talent found");
                return;
            }

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
                title: idToName(data._id),
            };
            if (process.env.DATA_URL !== undefined) {
                embed.url = process.env.DATA_URL + "/talents/" + data._id;
            }
            await message.channel.send({embed});
        }
    }
}
