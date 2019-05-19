import { Message } from "discord.js";
import { Database, Entry, findOne } from "../db";
import { createEmbed, escapeRegex, idToName, nameToId } from "../util";
import { Argument, Command } from "./command";

interface CareerTree {
    talents: string[][];
    links: number[][];
}

interface ISpecialization extends Entry {
    _id: string;
    base_skills: string[];
    bonus_skills: string[];
    tree: CareerTree;
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
            await message.channel.send("No specialisation found");
            return;
        }

        const {item, msg} = data;
        const embed = createEmbed(message, item, "specializations");
        embed.addField("Career Skills", item.base_skills.map((value) => idToName(value)).join(" ,"));
        embed.addField(`${idToName(item._id)} Bonus Career Skills`, item.bonus_skills.map((value) => idToName(value)).join(" ,"));
        const tree = `\`\`\`${this.buildTalentTree(item.tree)}\`\`\``;
        embed.addField("Tree", tree);

        if (msg === undefined || !msg.editable) await message.channel.send(embed);
        else await msg.edit(embed);
    }

    private buildTalentTree(tree: CareerTree): string {
        let out = "";
        tree.talents.forEach((row) => {
            row.forEach((col) => {
                const talent = col.split("_");
                out += col + "\t";
            });
            out += "\n";
        });
        return out;
    }
};
