import {Client} from "discord.js";
import * as dotenv from "dotenv";
import {Db, MongoClient} from "mongodb";

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
    console.log(message);
    if (message.content === "ping") {
        message.reply("pong!");
    }
});

Promise.all([connectMongo(), connectDiscord()]);
