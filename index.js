"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const client = new discord_js_1.Client();
client.on("ready", () => {
    console.log("Ready!");
});
client.on("message", (message) => {
    console.log(message);
    if (message.content === "ping") {
        message.reply("pong!");
    }
});
client.login(process.env.API_TOKEN || "");
