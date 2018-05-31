import { Message } from "discord.js";
import { Database, Entry, findOne } from "../db";
import { createEmbed, escapeRegex, idToName } from "../util";
import { Argument, Command } from "./command";

interface ITalent extends Entry {
    _id: string;
    force: boolean;
    ranked: boolean;
    short?: string;
    activation: boolean | { Action?: boolean, Incidental?: boolean, Out_Of_Turn?: boolean };
}

export = class Talent extends Command {
    constructor() {
        super("talent", [new Argument("talent")]);
    }

    public async run(message: Message, args: string[]) {
        const search = escapeRegex(args.join("_"));
        const data = await findOne<ITalent>(Database.Data.collection("talents"), {
            _id: {
                $options: "i",
                $regex: search,
            },
        }, message);

        if (data === undefined) {
            await message.channel.send("No talent found");
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

        await message.channel.send(embed);
    }
};
