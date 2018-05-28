import {ObjectID} from "bson";
import {Message} from "discord.js";
import {ICharacteristics} from "../characteristics";
import {Database, Entry} from "../db";
import {createEmbed, escapeRegex, idToName} from "../util";
import {Argument, Command} from "./command";

interface IAdversary extends Entry {
    abilities: string[];
    characteristics: ICharacteristics;
    equipment: {weapons: [ObjectID], armor: [ObjectID], gear: [ObjectID], other: [string]};
    level: "Minion" | "Rival" | "Nemesis";
    name: string;
    skills: [{id: string; value: number}];
    stats: {
        melee_defense: number;
        ranged_defense: number;
        soak: number;
        strain: number;
        wounds: number;
    };
    talents: [{id: string; value: number} | string];
}

export = class Adversary extends Command {
    constructor() {
        super(["adversary", "adversaries"], [new Argument("adversary")]);
    }
    public async run(message: Message, args: string[]): Promise<void> {
        const adversary = escapeRegex(args[0]);
        const data = await Database.Data.collection("adversaries").findOne<IAdversary>({name: {$regex: adversary, $options: "i"}});

        if (data == null) {
            await message.reply("No adversary found");
            return;
        }

        // Equipment
        let equipment = "";
        for (const id of data.equipment.weapons) {
            const item = await Database.Data.collection("weapons").findOne<{name: string}>({_id: id});
            if (item == null) return; // todo log error?
            equipment += item.name + "\n";
        }
        for (const id of data.equipment.armor) {
            const item = await Database.Data.collection("armor").findOne<{name: string}>({_id: id});
            if (item == null) return; // todo log error?
            equipment += item.name + "\n";
        }
        for (const id of data.equipment.gear) {
            const item = await Database.Data.collection("gear").findOne<{name: string}>({_id: id});
            if (item == null) return; // todo log error?
            equipment += item.name + "\n";
        }
        data.equipment.other.forEach(async (item) => {
            equipment += item + "\n";
        });

        const embed = createEmbed(message, data, "adversaries", data.name);

        embed.addField("Characteristics", data.characteristics);
        embed.addField("Stats", data.stats);

        embed.addField("Skills", this.formatList(data.skills), true);
        embed.addField("Talents", this.formatList(data.talents), true);
        if (equipment.length > 0) {
            embed.addField("Equipment", equipment, true);
        }

        await message.channel.send({embed});
    }

    private formatList(items: [{id: string; value: number} | string]): string {
        let out = "";
        items.forEach((item) => {
            if (typeof item === "string") out += item;
            else out += `${idToName(item.id)} ${item.value}\n`;
        });
        return out;
    }
};
