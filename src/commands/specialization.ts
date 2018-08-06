import { Message } from "discord.js";
import { Database, Entry, findOne } from "../db";
import { createEmbed, escapeRegex, idToName, nameToId } from "../util";
import { Argument, Command } from "./command";

interface ISpecialization extends Entry {
    _id: string;
    skills: string[];
    tree: { talents: string[][] };
}

export = class Armor extends Command {
    constructor() {
        super(["specialization", "specialisation", "spec"], [new Argument("name")]);
    }

    public async run(message: Message, args: string[]) {
        const search = escapeRegex(nameToId(args[0]));
        const data = await findOne<ISpecialization>(Database.Data.collection("specializations"), {
            _id: {
                $options: "i",
                $regex: search,
            },
        }, message);

        if (data === undefined) {
            await message.channel.send("No armor found");
            return;
        }

        const {item, msg} = data;
        const embed = createEmbed(message, item, "specializations");
        embed.addField("Skills", item.skills.map((value) => idToName(value)).join(" ,"));
        // embed.addField("Tree", data.tree); // todo

        if (msg === undefined || !msg.editable) await message.channel.send(embed);
        else await msg.edit(embed);
    }
};
