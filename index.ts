import {Client, Collection} from "discord.js";
import * as dotenv from "dotenv";
import {Db, MongoClient} from "mongodb";
import {Command} from "./commands/command";
import {Talent} from "./commands/talent";

const commands = new Collection<string, Command>();
const client = new Client();
let mongo: Db;

async function connectDiscord() {
    try {
        await client.login(process.env.API_TOKEN || "");
    } catch {
        console.error("Failed to login to Discord");
    }
}

async function connectMongo() {
    try {
        mongo = await MongoClient.connect(process.env.MONGO_CONN || "mongodb://localhost:27017");
        console.log("Connected to Mongo");
    } catch {
        console.error("Failed to connect to Mongo");
    }
}

dotenv.config();

// Register handlers
client.on("ready", () => {
    console.log("Ready!");
});

client.on("message", (message) => {
    if (!message.content.startsWith("!")) return;

    const split = message.content.split(" ");
    const cmd = commands.get(split[0].slice(1));
    if (cmd === undefined) {
        message.reply(`Unknown command \`${split[0].slice(1)}\``);
        return;
    }
    cmd.run(message);
});

// Register commands
commands.set("talent", new Talent("talent"));

Promise.all([connectMongo(), connectDiscord()]);
