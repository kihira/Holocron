import { Message, RichEmbed } from "discord.js";
import { Database, Entry, findOne } from "../db";
import { createEmbed, escapeRegex } from "../util";
import { Argument, Command } from "./command";

interface IStarship extends Entry {
    armor: number;
    category: string;
    consumables: string;
    crew: string[];
    defense: {
        aft: number;
        fore: number;
        port?: number;
        starboard?: number;
    };
    encumbrance: number;
    handling: number;
    hardpoints: number;
    hull: number;
    hyperdrive?: {
        primary: number;
        secondary?: number;
    };
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
        super(["starship", "spaceship"], [new Argument("spaceship")]);
    }

    public async run(message: Message, args: string[]) {
        const search = escapeRegex(args[0]);
        const data = await findOne<IStarship>(Database.Data.collection("starships"), {
            name: {
                $options: "i",
                $regex: search,
            },
        }, message);

        if (data === undefined) {
            await message.channel.send("No starship found");
            return;
        }

        const {item, msg} = data;
        let hyperdrive = "None";
        if (item.hyperdrive !== undefined) {
            hyperdrive = `**Primary:** Class ${item.hyperdrive.primary}`;
            if (item.hyperdrive.secondary !== undefined) {
                hyperdrive += `, **Secondary:** Class ${item.hyperdrive.secondary}`;
            }
        }

        const embed = createEmbed(message, item, "starships", item.name);
        embed.addField("Hull Type/Class", `${item.category}/${item.model}`, true);
        embed.addField("Manufacturer", item.manufacturer, true); // todo combine manu/model as per book?

        embed.addField("Price/Rarity",
            `${item.price.toLocaleString()}${item.restricted ? " (R)" : ""}/${item.rarity}`, true);
        embed.addField("Encumbrance", item.encumbrance, true);
        embed.addField("Hyperdrive", hyperdrive, true);

        embed.addField("Armor", item.armor, true);
        embed.addField("Strain Threshold", item.strain, true);
        embed.addField("Hull Threshold", item.hull, true);

        embed.addField("Consumables", item.consumables, true);
        embed.addField("Handling", item.handling, true);
        embed.addField("NaviComputer", item.navicomputer, true);

        embed.addField("Passengers", item.passengers, true);
        embed.addField("Sensor", item.sensor, true);
        embed.addField("Silhouette", item.silhouette, true);

        embed.addField("Handling", item.handling, true);
        embed.addField("Speed", item.speed, true);
        embed.addField("Defense", item.defense, true); // todo

        embed.addField("Crew", item.crew);
        embed.addField("Weapons", item.weapons);

        if (msg === undefined || !msg.editable) await message.channel.send(embed);
        else await msg.edit(embed);
    }
};
