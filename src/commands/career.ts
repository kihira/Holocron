import {Message} from "discord.js";
import {Database, Entry} from "../db";
import {createEmbed, escapeRegex} from "../util";
import {Argument, Command} from "./command";

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
        const data = await Database.Data.collection("careers").findOne<ICareer>({name: {$regex: talent, $options: "i"}});

        if (data == null) {
            await message.channel.send("No career found");
            return;
        }

        const embed = createEmbed(message, data, "careers");
        embed.addField("Skills", data.skills.join(" ,"));
        embed.addField("Specializations", data.specializations.join(" ,"));

        await message.channel.send(embed);
    }
};
