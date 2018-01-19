import {Message, RichEmbed} from "discord.js";
import {isString} from "util";
import {Database, Entry} from "../db";
import {escapeRegex, idToName, nameToId} from "../util";
import {Argument, Command} from "./command";

interface IWeapon extends Entry {
    category: string;
    critical: number;
    damage: number;
    encumbrance: number;
    hardpoints: number;
    image?: string;
    name: string;
    notes?: string;
    price: number;
    range: string;
    rarity: number;
    restricted: boolean;
    skill: string;
    special: Array<string | {id: string, value: number}>;
}

export = class Talent extends Command {
    constructor() {
        super("weapon", [new Argument("name")], "weapons");
    }
    public async run(message: Message, args: string[]): Promise<void> {
        const talent = escapeRegex(nameToId(args[0]));
        const data = await Database.Data.collection<IWeapon>("weapons")
            .find({name: {$regex: talent, $options: "i"}}).limit(1).next();

        if (data == null) {
            await message.channel.send("No weapon found");
            return;
        }

        const embed = new RichEmbed();
        embed.setTitle(data.name);
        embed.setAuthor(message.member.displayName, message.author.avatarURL);
        embed.setDescription(data.description || data.notes || "");
        embed.setFooter(data.index.join(", "));
        embed.setColor("DARK_RED");
        embed.addField("Category", data.category, true);
        embed.addField("Skill", data.skill, true);
        embed.addBlankField(true);
        embed.addField("Price", data.price.toLocaleString() + (data.restricted ? " (R)" : ""), true);
        embed.addField("Rarity", data.rarity, true);
        embed.addField("Encumbrance", data.encumbrance, true);
        embed.addField("Damage", data.damage, true);
        embed.addField("Critical", data.critical, true);
        embed.addField("Hard Points", data.hardpoints, true);
        if (data.special) {
            // tslint:disable-next-line:max-line-length
            embed.addField("Special", data.special.map((element) => isString(element) ? idToName(element) : `${idToName(element.id)} ${element.value}`).join(", "));
        }
        if (process.env.DATA_URL !== undefined) {
            embed.setURL(process.env.DATA_URL + "/weapons/" + data._id);
        }

        await message.channel.send(embed);
    }
};
