import { Message, RichEmbed } from "discord.js";
import { Database, Entry } from "../db";
import { escapeRegex } from "../util";
import { Argument, Command } from "./command";

interface IDefense {
    aft: number;
    fore: number;
    port?: number;
    starboard?: number;
}

interface IHyperdrive {
    primary: number;
    secondary?: number;
}

interface IStarship extends Entry {
    armor: number;
    category: string;
    consumables: string;
    crew: string[];
    defense: IDefense;
    encumbrance: number;
    handling: number;
    hardpoints: number;
    hull: number;
    hyperdrive?: IHyperdrive;
    manufacturer: string;
    model: string;
    name: string;
    notes?: string;
    navicomputer: string;
    passengers: number;
    price: number;
    rarity: number;
    restricted: boolean;
    sensor: string;
    silhouette: number;
    speed: number;
    strain: number;
    weapons: number; // TODO convert to array
}

export = class Starship extends Command {
    constructor() {
        super("starship", [new Argument("spaceship")], "spaceship");
    }

    public async run(message: Message, args: string[]): Promise<void> {
        const name = escapeRegex(args[0]);
        const data = await Database.Data.collection("starships")
            .findOne<IStarship>({name: {$regex: name, $options: "i"}});

        if (data == null) {
            await message.channel.send("No starship found");
            return;
        }

        const embed = new RichEmbed();
        embed.setTitle(data.name);
        embed.setAuthor(message.member.displayName, message.author.avatarURL);
        embed.setDescription(data.description || data.notes || "");
        embed.setFooter(data.index.join(", "));
        embed.setColor("DARK_RED");
        embed.addField("Category", data.category, true);
        embed.addField("Manufacturer", data.manufacturer, true); // todo combine manu/model as per book?
        embed.addField("Model", data.model, true);

        embed.addField("Price", data.price.toLocaleString() + (data.restricted ? " (R)" : ""), true);
        embed.addField("Rarity", data.rarity, true);
        embed.addField("Encumbrance", data.encumbrance, true);

        embed.addField("Armor", data.armor, true);
        embed.addField("Strain Threshold", data.strain, true);
        embed.addField("Hull Threshold", data.hull, true);

        embed.addField("Consumables", data.consumables, true);
        embed.addField("Handling", data.handling, true);
        embed.addField("NaviComputer", data.navicomputer, true);

        embed.addField("Passengers", data.passengers, true);
        embed.addField("Sensor", data.sensor, true);
        embed.addField("Silhouette", data.silhouette, true);

        embed.addField("Handling", data.handling, true);
        embed.addField("Speed", data.speed, true);
        embed.addField("Defense", data.defense, true); // todo

        embed.addField("Crew", data.crew);
        embed.addField("Weapons", data.weapons);
        if (process.env.DATA_URL !== undefined) {
            embed.setURL(process.env.DATA_URL + "/starships/" + data._id);
        }

        await message.channel.send(embed);
    }
};
