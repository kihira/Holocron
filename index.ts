import {Client} from "discord.js";

const client = new Client();

client.on("ready", () => {
    console.log("Ready!");
});

client.on("message", (message) => {
    if (message.content === "ping") {
        message.reply("pong!");
    }
});

client.login(process.env.API_TOKEN || "");
