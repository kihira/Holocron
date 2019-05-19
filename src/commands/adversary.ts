import { ObjectID } from "bson";
import { Message } from "discord.js";
import { ICharacteristics } from "../characteristics";
import { Database, Entry, findOne } from "../db";
import { createEmbed, escapeRegex, idToName } from "../util";
import { Argument, Command } from "./command";

interface IAdversary extends Entry {
    abilities: string[];
    characteristics: ICharacteristics;
    equipment: { weapons: [ObjectID], armor: [ObjectID], gear: [ObjectID], other: [string] };
    level: "Minion" | "Rival" | "Nemesis";
    name: string;
    skills: [{ id: string; value: number }];
    stats: {
        melee_defense: number;
        ranged_defense: number;
        soak: number;
        strain: number;
        wounds: number;
    };
    talents: [{ id: string; value: number } | string];
}

export = class Adversary extends Command {
    constructor() {
        super(["adversary", "adversaries"], [new Argument("adversary")]);
    }

    public async run(message: Message, args: string[]) {
        const search = escapeRegex(args[0]);
        const data = await findOne<IAdversary>(Database.Data.collection("adversaries"), {
            name: {
                $options: "i",
                $regex: search,
            },
        }, message);

        if (data === undefined) {
            await message.reply("No adversary found");
            return;
        }
        const {item, msg} = data;

        // Equipment
        let equipment = "";
        for (const id of item.equipment.weapons) {
            const entry = await Database.Data.collection("weapons").findOne<{ name: string }>({_id: id});
            if (entry == null) return; // todo log error?
            equipment += entry.name + "\n";
        }
        for (const id of item.equipment.armor) {
            const entry = await Database.Data.collection("armor").findOne<{ name: string }>({_id: id});
            if (entry == null) return; // todo log error?
            equipment += entry.name + "\n";
        }
        for (const id of item.equipment.gear) {
            const entry = await Database.Data.collection("gear").findOne<{ name: string }>({_id: id});
            if (entry == null) return; // todo log error?
            equipment += entry.name + "\n";
        }
        item.equipment.other.forEach(async (entry) => {
            equipment += entry + "\n";
        });

        const embed = createEmbed(message, item, "adversaries", item.name);

        embed.addField("Characteristics", item.characteristics);
        embed.addField("Stats", item.stats);

        embed.addField("Skills", this.formatList(item.skills), true);
        embed.addField("Talents", this.formatList(item.talents), true);
        if (equipment.length > 0) {
            embed.addField("Equipment", equipment, true);
        }

        if (msg === undefined || !msg.editable) await message.channel.send(embed);
        else await msg.edit(embed);
    }

    private formatList(items: [{ id: string; value: number } | string]): string {
        let out = "";
        items.forEach((item) => {
            if (typeof item === "string") out += item;
            else out += `${idToName(item.id)} ${item.value}\n`;
        });
        return out;
    }
};
