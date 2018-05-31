import { Message } from "discord.js";
import { Database, Entry } from "../db";
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
        const talent = escapeRegex(nameToId(args[0]));
        const data = await Database.Data.collection("specializations").findOne<ISpecialization>({
            _id: {
                $regex: talent,
                $options: "i",
            },
        });

        if (data == null) {
            await message.channel.send("No armor found");
            return;
        }

        const embed = createEmbed(message, data, "specializations");
        embed.addField("Skills", data.skills.map((value) => idToName(value)).join(" ,"));
        // embed.addField("Tree", data.tree); // todo

        await message.channel.send(embed);
    }
};
