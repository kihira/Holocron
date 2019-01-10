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

        const embed = createEmbed(message, data, "specializations");
        embed.addField("Career Skills", data.base_skills.map((value) => idToName(value)).join(" ,"));
        embed.addField(`${idToName(data._id)} Bonus Career Skills`, data.bonus_skills.map((value) => idToName(value)).join(" ,"));
        const tree = `\`\`\`${this.buildTalentTree(data.tree)}\`\`\``;
        embed.addField("Tree", tree);

        await message.channel.send(embed);
    }

    private buildTalentTree(tree: CareerTree): string {
        let maxWidth = 0;
        let maxHeight = 0;
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
