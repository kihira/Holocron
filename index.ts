import {Client, Collection, Guild, GuildMember, Message} from "discord.js";
import * as dotenv from "dotenv";
import {Command} from "./commands/command";
import {Commands} from "./commands/commands";
import {Talent} from "./commands/talent";
import {Mongo} from "./db";
import {Settings} from "./settings";

const commands = new Collection<string, Command>();
const client = new Client();

async function connectDiscord() {
    try {
        await client.login(process.env.API_TOKEN || "");
    } catch {
        console.error("Failed to login to Discord");
    }
}

const init = async () => {
    dotenv.config();

    // Register handlers
    client.on("ready", async () => {
        console.log("Ready!");
    });

    client.on("message", async (message: Message) => {
        if (!message.content.startsWith("!")) return;

        const split = message.content.split(" ");
        const cmd = commands.get(split[0].slice(1));
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
            console.log(`Left Guild (${guild.name}) due to high user/bot ratio (${users / bots})`);
        }
        console.log(`Joined Guild (${guild.name})`);
    });

    // Register commands
    Commands.register(new Talent("talent"));

    // Begin connect
    await Promise.all([Mongo.connect(), connectDiscord()]);
};

init();