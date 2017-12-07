import {Client, Collection} from "discord.js";
import * as dotenv from "dotenv";
import {Command} from "./commands/command";
import {Talent} from "./commands/talent";
import {Mongo} from "./db";

const commands = new Collection<string, Command>();
const client = new Client();

async function connectDiscord() {
    try {
        await client.login(process.env.API_TOKEN || "");
    } catch {
        console.error("Failed to login to Discord");
    }
}

dotenv.config();

// Register handlers
client.on("ready", () => {
    console.log("Ready!");
});

client.on("message", async (message) => {
    if (!message.content.startsWith("!")) return;

    const split = message.content.split(" ");
    const cmd = commands.get(split[0].slice(1));
    if (cmd === undefined) {
        await message.reply(`Unknown command \`${split[0].slice(1)}\``);
        return;
    }
    await cmd.run(message);
});

// Register commands
commands.set("talent", new Talent("talent"));

Promise.all([Mongo.connect(), connectDiscord()]);
