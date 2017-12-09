import {Client, Guild, GuildMember, Message} from "discord.js";
import * as dotenv from "dotenv";
import {Commands} from "./src/commands";
import {Mongo} from "./src/db";
import {logger} from "./src/logger";
import {Settings} from "./src/settings";

const client = new Client();

async function connectDiscord() {
    try {
        await client.login(process.env.API_TOKEN || "");
    } catch {
        logger.error("Failed to login to Discord");
    }
}

const init = async () => {
    dotenv.config();

    // Register handlers
    client.on("ready", async () => {
        logger.info("Connected to Discord");
    });

    client.on("message", async (message: Message) => {
        if (message.member.user.bot) return;
        if (!message.content.startsWith("!")) return;

        const split = message.content.split(" ");
        const cmd = Commands.get(split[0].slice(1));
        if (cmd === undefined) {
            await message.reply(`Unknown command \`${split[0].slice(1)}\``);
            return;
        }
        await cmd.run(message);
    });

    client.on("guildCreate", async (guild: Guild) => {
        let bots = 0;
        let users = 0;
        guild.members.forEach((member: GuildMember) => {
            if (member.user.bot) bots++;
            else users++;
        });
        if (users / bots > Settings.userBotRatioThreshold) {
            await guild.leave();
            // todo blacklist guild?
            logger.verbose(`Left Guild (${guild.name}) due to high user/bot ratio (${users / bots})`);
        }
        logger.verbose(`Joined Guild (${guild.name})`);
    });

    // Called for actually being removed from being a guild
    client.on("guildDelete", async (guild: Guild) => {
        logger.verbose(`Removed from guild (${guild.name})`);
        // todo delete settings
    });

    // Register commands
    await Commands.loadAllCommands();

    // Begin connect
    await Promise.all([Mongo.connect(), connectDiscord()]);
};

init();
