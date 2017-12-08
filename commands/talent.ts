import {Message} from "discord.js";
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
                await message.reply("Talent found!");
            }
            console.log(data);
        }
    }
}