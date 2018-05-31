import { Message, RichEmbed } from "discord.js";
import { Command } from "./command";

export = class About extends Command {
    constructor() {
        super("about");
    }

    public async run(message: Message, args: string[]) {
        const client = message.client;
        const embed = new RichEmbed();
        embed.setDescription("A discord bot to help with all things related to FFG Star Wars RPG");
        embed.setAuthor("Kihira#5723");

        embed.addField("Guilds", client.guilds.size, true);
        embed.addField("Total users", client.users.size, true);
        embed.addBlankField(true);

        embed.addField("Uptime", client.uptime, true);
        embed.addField("Ping", client.ping, true);
        embed.addBlankField(true);

        await message.channel.send(embed);
    }
};
