import { Message } from "discord.js";
import { Database, Entry, findOne } from "../db";
import { createEmbed, escapeRegex } from "../util";
import { Argument, Command } from "./command";

interface ICareer extends Entry {
    _id: string;
    skills: string[];
    specializations: string[];
}

export = class Quality extends Command {
    constructor() {
        super("career", [new Argument("name")]);
    }

    public async run(message: Message, args: string[]) {
        const talent = escapeRegex(args[0]);
        const data = await findOne<ICareer>(Database.Data.collection("careers"), {
            name: {
                $options: "i",
                $regex: talent,
            },
        }, message);

        if (data === undefined) {
            await message.channel.send("No career found");
            return;
        }

        const {item, msg} = data;
        const embed = createEmbed(message, item, "careers");
        embed.addField("Skills", item.skills.join(" ,"));
        embed.addField("Specializations", item.specializations.join(" ,"));

        if (msg === undefined || !msg.editable) await message.channel.send(embed);
        else await msg.edit(embed);
    }
};
