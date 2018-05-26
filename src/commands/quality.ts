import {Message} from "discord.js";
import {Database, Entry} from "../db";
import {createEmbed, escapeRegex, nameToId} from "../util";
import {Argument, Command} from "./command";

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
    public async run(message: Message, args: string[]): Promise<void> {
        const talent = escapeRegex(nameToId(args[0]));
        const data = await Database.Data.collection("quality")
            .find<IQuality>({name: {$regex: talent, $options: "i"}}).limit(1).next();

        if (data == null) {
            await message.channel.send("No quality found");
            return;
        }

        const embed = createEmbed(message, data, "qualities");
        embed.addField("Active", data.active, true);
        embed.addField("Ranked", data.ranked ? "True" : "False", true);

        await message.channel.send(embed);
    }
};
