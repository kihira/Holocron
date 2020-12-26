import { Message, MessageEmbed } from "discord.js";
import { formatTime } from "../util";
import { Command } from "./command";

export = class About extends Command {
    constructor() {
        super("about");
    }

    public async run(message: Message, args: string[]): Promise<void> {
        const client = message.client;
        const embed = new MessageEmbed();
        embed.setTitle("Holocron");
        embed.setDescription("A discord bot to help with all things related to FFG Star Wars RPG");
        embed.setFooter("Developer: Kihira#5723");
        embed.setColor("DARK_PURPLE");

        embed.addField("Guilds", client.guilds.cache.size, true);
        embed.addField("Channels", client.channels.cache.size, true);
        embed.addField("Users", client.users.cache.size, true);

        embed.addField("Memory", `${Math.floor(process.memoryUsage().heapUsed / 1024 / 1024)} MB`, true);
        // embed.addField("CPU", `${(process.cpuUsage().user / 1000000).toFixed(1)}%`, true);
        // embed.addField("Powered By", "Docker, Node, Discord.js", true);

        embed.addField("Uptime", formatTime(client.uptime ?? 0), true);
        embed.addField("Ping", `${client.ws.ping.toFixed(0)}ms`, true);
        embed.addField("", "", true);

        embed.addField("Information", `**Invite:**[]()\n**Commands:** !commands`);

        await message.channel.send(embed);
    }
};
