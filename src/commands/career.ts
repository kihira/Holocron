import {Message} from "discord.js";
import {Database, Entry} from "../db";
import {createEmbed, escapeRegex, idToName, nameToId} from "../util";
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
    public async run(message: Message, args: string[]): Promise<void> {
        const talent = escapeRegex(nameToId(args[0]));
        const data = await Database.Data.collection("careers")
            .find<ICareer>({name: {$regex: talent, $options: "i"}}).limit(1).next();

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
