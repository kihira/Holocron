import {Message} from "discord.js";
import {isObject} from "util";
import {Database, Entry} from "../db";
import {createEmbed, escapeRegex, idToName, nameToId} from "../util";
import {Argument, Command} from "./command";

interface ITalent extends Entry {
    _id: string;
    force: boolean;
    ranked: boolean;
    short?: string;
    activation: boolean | {Action?: boolean, Incidental?: boolean, Out_Of_Turn?: boolean};
}

export = class Talent extends Command {
    constructor() {
        super("talent", [new Argument("talent")]);
    }
    public async run(message: Message, args: string[]): Promise<void> {
        const talent = escapeRegex(nameToId(args[0]));
        const data = await Database.Data.collection("talents")
            .find<ITalent>({_id: {$regex: talent, $options: "i"}}).limit(1).next();

        if (data == null) {
            await message.reply("No talent found");
            return;
        }

        const embed = createEmbed(message, data, "species");
        embed.addField("Ranked", data.ranked ? "True" : "False", true);
        embed.addField("Force", data.force ? "True" : "False", true);

        if (!data.activation) {
            embed.addField("Activation", "Passive", true);
        }
        else {
            let value = "Active";
            if (typeof(data.activation) === "object") {
                value += " (";
                const keys = Object.keys(data.activation);
                for (let i = 0; i < keys.length; i++) {
                    keys[i] = idToName(keys[i]);
                }
                value += keys.join(", ");
                value += ")";
            }
            embed.addField("Activation", value, true);
        }

        await message.channel.send({embed});
    }
};
