import { Message } from "discord.js";
import { Database, Entry, findOne } from "../db";
import { createEmbed, escapeRegex, nameToId } from "../util";
import { Argument, Command } from "./command";

interface IQuality extends Entry {
    _id: string;
    description: string;
    active: "Active" | "Passive"; // todo should switch this to true/fale
    ranked: boolean;
}

export = class Quality extends Command {
    constructor() {
        super(["quality", "qualities", "special"], [new Argument("name")]);
    }

    public async run(message: Message, args: string[]) {
        const search = escapeRegex(nameToId(args[0]));
        const data = await findOne<IQuality>(Database.Data.collection("quality"), {
            _id: {
                $options: "i",
                $regex: search,
            },
        }, message);

        if (data === undefined) {
            await message.channel.send("No quality found");
            return;
        }

        const embed = createEmbed(message, data, "qualities");
        embed.addField("Active", data.active, true);
        embed.addField("Ranked", data.ranked ? "True" : "False", true);

        await message.channel.send(embed);
    }
};
