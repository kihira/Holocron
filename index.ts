import {Client} from "discord.js";
import {MongoClient} from "mongodb";

const client = new Client();

async function connectDiscord() {
    await client.login(process.env.API_TOKEN || "");
}

async function connectMongo() {
    await MongoClient.connect(process.env.MONGO_CONN || "mongodb://localhost:27017");
}

client.on("ready", () => {
    console.log("Ready!");
});

client.on("message", (message) => {
    console.log(message);
    if (message.content === "ping") {
        message.reply("pong!");
    }
});
