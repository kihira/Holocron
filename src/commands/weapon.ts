import {Message, RichEmbed} from "discord.js";
import {isObject, isString} from "util";
import {Command} from "../command";
import {Database} from "../db";
import {escapeRegex, idToName, nameToId} from "../util";

interface IWeapon {
    _id: string;
    category: string;
    critical: number;
    damage: number;
    description?: string;
    encumbrance: number;
    hardpoints: number;
    index: string[];
    name: string;
    notes?: string;
    price: number;
    range: string;
    rarity: number;
    restricted: boolean;
    skill: string;
    special?: Array<string | {id: string, value: number}>;
}

export = class Talent extends Command {
    constructor() {
        super(["weapon", "weapons"]);
    }
    public async run(message: Message, args: string[]): Promise<void> {
        if (message.content.length > 7) {
            const talent = escapeRegex(nameToId(args[0]));
            const data = await Database.Data.collection<IWeapon>("weapons")
                .findOne({name: {$regex: talent, $options: "i"}});

            if (data == null) {
                await message.reply("No weapon found");
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
            embed.addField("Price", data.price + (data.restricted ? " (R)" : ""), true);
            embed.addField("Rarity", data.rarity, true);
            embed.addField("Encumbrance", data.encumbrance, true);
            embed.addField("Damage", data.damage, true);
            embed.addField("Critical", data.critical, true);
            embed.addField("Hard Points", data.hardpoints, true);
            if (data.special) {
                // tslint:disable-next-line:max-line-length
                embed.addField("Special", data.special.map((element) => isString(element) ? element : `${element.id} ${element.value}`).join(", "));
            }

            if (process.env.DATA_URL !== undefined) {
                embed.setURL(process.env.DATA_URL + "/weapons/" + data._id);
            }
            await message.channel.send(embed);
        }
    }
};
